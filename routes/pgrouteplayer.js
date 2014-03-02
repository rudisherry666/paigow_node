/*
* class PGRoutePlayer
*
* Handles the endpoints for player manipulation
*
*/

var Q = require('q'),
    util = require('util'),
    PGLog = require('../utils/pglog'),
    PGRouteBase = require('./pgroutebase'),
    PGDBPlayer = require('../models/db/pgdbplayer'),
    PasswordHash = require('password-hash');

function PGRoutePlayer(expressApp, pgdbPlayer) {
    PGRouteBase.call(this, expressApp);
    var self = this;
    self._log = new PGLog("rteplayer", 'debug');

    // Establish the endpoints.
    self._expressApp.get('/player', function(req, res) { self._getSessionUsername(req, res); });
    self._expressApp.post('/player', function(req, res) { self._registerOrSigninPlayer(req, res); });
}

util.inherits(PGRoutePlayer, PGRouteBase);

/*
* @method GET /player
* 
* Get the username current player in the session, or "unknown" if there isn't one.
*
*/
PGRoutePlayer.prototype._getSessionUsername = function(req, res) {
    var self = this;
    self._log.debug("_getSessionUsername called");

    res.setHeader('Content-Type', 'application/json');
    this._getSessionPlayer(req).then(
        function(data) { res.end(JSON.stringify({ username: data.username() })); },
        function(err)  { res.end(500); }
    );
};

/*
* @method _setSessionPlayer
* 
* Set the current session player
*
*/
PGRoutePlayer.prototype._setSessionPlayer = function(req, pgdbPlayer) {
    var self = this;
    self._log.debug("_setSessionPlayer called");

    req.session.pgdbPlayer = pgdbPlayer;

    // Allow chaining.
    return pgdbPlayer;
};


/*
* Register a new player who provides a username and a password.
* This cannot duplicate an existing player.
*
* @method _registerPlayer
*
*/
PGRoutePlayer.prototype._registerOrSigninPlayer = function(req, res) {
    var self = this;
    var prefix = "PGRoutePlayer._registerOrSigninPlayer() ";
    self._log.debug(prefix + "called ");

    res.setHeader('Content-Type', 'application/json');

    // We know the difference between signing in and registering by the state
    if (req.body.state === 'registering') {
        self._log.debug("registering");
        // This is a register
        self._registerNewUser(req, req.body.username, req.body.password).then(
            function(data) {
                self._setSessionPlayer(req, data);
                self._log.debug(prefix + "registering done" );
                res.end(JSON.stringify({ username: req.session.pgdbPlayer.username() }));
            },
            function(err) {
                self._log.debug(prefix + "err registering: " + err);
                res.end(JSON.stringify({ err: err }));
            });
    } else {
        self._log.debug(prefix + "signing in");
        self._verifyPostedUsernameAndPassword(req, req.body.username, req.body.password).then(
            function(data) {
                self._setSessionPlayer(req, data);
                res.end(JSON.stringify({ username: req.session.pgdbPlayer.username() }));
            },
            function(err) { res.end(JSON.stringify({ err: err })); }
        );
    }

};

/*
* Return a promise that resolves to the current player in the session, creating one if necessary.
*
* @method _getSessionPlayer
*
*/
PGRoutePlayer.prototype._getSessionPlayer = function(req) {
    var self = this;
    self._log.debug("_getSessionPlayer called");

    // If there is no player, now is the time to create one.
    if (!req.session.pgdbPlayer) {
        self._setSessionPlayer(req, new PGDBPlayer());
        self._log.debug("_getSessionPlayer created player" );
    }
    return req.session.pgdbPlayer.created();
};

PGRoutePlayer.prototype._verifyPostedUsernameAndPassword = function(req, postedUsername, postedPassword) {
    var self = this;
    var prefix = "verifyPostedUsernameAndPassword('" + postedUsername + "') ";
    self._log.debug(prefix + "called");

    var defer = Q.defer();
    self._getSessionPlayer(req).then(
        function(pgdbPlayer) {
            self._log.debug("getSessionPlayer returned a player");

            // Fetch it and check the password.
            pgdbPlayer.find(postedUsername).then(
                function(data) {
                    self._log.debug(prefix + "find returned: " + JSON.stringify(data));
                    if (!(data instanceof Array)) {
                        self._log.fatal(prefix + "non-array returned");
                        defer.reject("non-array");
                    } else if (data.length !== 1) {
                        self._log.fatal(prefix + "bad number of items returned");
                        defer.reject("bad-array-length");
                    } else {
                        var user = data[0];
                        if (user.username !== postedUsername) {
                            self._log.fatal(prefix + "username mismatch");
                            defer.reject("bad-username");
                        } else {
                            self._log.debug(prefix + "matching name");
                            if (PasswordHash.verify(postedPassword, user.hashedPassword)) {
                                self._log.debug(prefix + "password match success");
                                pgdbPlayer.setUsername(postedUsername).then(
                                    function(data) { defer.resolve(pgdbPlayer); },
                                    function(err)  { defer.reject(err); }
                                );
                            } else {
                                self._log.error(prefix + "password mismatch");
                                defer.reject();
                            }
                        }
                    }
                },
                function(err) {
                    self._log.error(prefix + "find err: " + err);
                    defer.reject();
                });
        },
        function(err) {
            // initPromise failed: we can't do any DB stuff.
            defer.reject(err);
        }
    );

    return defer.promise;
};

/*
* @method registerNewUser
*
* @param postedUsername {string} the name of the user
* @param postedPassword {string} the password
*
* Returns a promise that, if resolved, means the user has been saved.
* If rejected, 'err' param to .fail() it has several possible values:
*     "name-exists": the name already exist
*     "fetch-error ...": some internal error looking to see if it was duplicate, prefix plus error
*     "save-error ...": some internal error trying to add the new users, prefix plus error.
*/
PGRoutePlayer.prototype._registerNewUser = function(req, postedUsername, postedPassword) {
    var self = this;
    var prefix = "PGRoutePlayer._registerNewUser('" + postedUsername + "') ";
    self._log.debug(prefix + "called");

    var defer = Q.defer();

    self._getSessionPlayer(req).then(
        function(pgdbPlayer) {
            self._log.debug(prefix + "getSessionPlayer returned a player");

            // Can't have duplicates.
            // TODO: use 'Exists' in the 'Expected' property to avoid duplicates
            pgdbPlayer.find(postedUsername).then(
                function() {
                    self._log.warn(prefix + "rejected: name exists");
                    defer.reject("name-exists");
                },
                function(err) {
                    if (err === "not-found") {
                        self._log.debug(prefix + "returned not-found, this is good");
                        var passHash = PasswordHash.generate(postedPassword);
                        var user = {username: postedUsername, hashedPassword: passHash};
                        pgdbPlayer.add(user).then(
                            function() {
                                self._log.debug(prefix + "added user just fine");
                                pgdbPlayer.setUsername(postedUsername).then(
                                    function(data) { defer.resolve(pgdbPlayer); },
                                    function(err)  { defer.reject(err); }
                                );                                
                            },
                            function(err) {
                                self._log.error(prefix + "adding user: " + err);
                                defer.reject(err);
                            }
                        );
                    } else {
                        // Uh-oh, some other kind of error, bad news.
                        self._log.error(prefix + "trying to fetch username" + err);
                        defer.reject("fetch-error " + err);
                    }
                }
            );
        },
        function(err) {
            // initPromise failed: we can't do any DB stuff.
            defer.reject(err);
        }
    );

    return defer.promise;
};


module.exports = PGRoutePlayer;
