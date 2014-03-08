/*
* class PGRoutePlayer
*
* Handles the endpoints for player manipulation
*
*/

var Q = require('q'),
    util = require('util'),
    PGLog = require('../utils/pglog'),
    PGSession = require('../utils/pgsession'),
    PGRouteBase = require('./pgroutebase'),
    PGDBPlayer = require('../models/db/pgdbplayer'),
    PasswordHash = require('password-hash');

var pgRoutePlayerLog = new PGLog("rteplayer", 'debug');

function PGRoutePlayer(expressApp) {
    PGRouteBase.call(this, expressApp);
    var self = this;
    pgRoutePlayerLog.debug("PGRoutePlayer constructor called");

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
    pgRoutePlayerLog.debug("_getSessionUsername called");

    res.setHeader('Content-Type', 'application/json');
    self._getSessionPlayer(req).then(
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
    pgRoutePlayerLog.debug("_setSessionPlayer called");
    if (!(pgdbPlayer instanceof PGDBPlayer)) throw new Error("_setSessionPlayer setting wrong type of object");

    PGSession.set(req, 'pgdbPlayer', pgdbPlayer);

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
    pgRoutePlayerLog.debug(prefix + "called ");

    res.setHeader('Content-Type', 'application/json');

    // We know the difference between signing in and registering by the state
    if (req.body.state === 'registering') {
        pgRoutePlayerLog.debug("registering");
        // This is a register
        self._registerNewUser(req, req.body.username, req.body.password).then(
            function(data) {
                self._setSessionPlayer(req, data);
                pgRoutePlayerLog.debug(prefix + "registering done" );
                res.end(JSON.stringify({ username: PGSession.get(req, 'pgdbPlayer').username() }));
            },
            function(err) {
                pgRoutePlayerLog.debug(prefix + "err registering: " + err);
                res.end(JSON.stringify({ err: err }));
            });
    } else {
        pgRoutePlayerLog.debug(prefix + "signing in");
        self._verifyPostedUsernameAndPassword(req, req.body.username, req.body.password).then(
            function(data) {
                self._setSessionPlayer(req, data);
                res.end(JSON.stringify({ username: PGSession.get(req, 'pgdbPlayer').username() }));
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
    pgRoutePlayerLog.debug("_getSessionPlayer called");

    // If there is no player, now is the time to create one.
    if (!PGSession.get(req, 'pgdbPlayer')) {
        self._setSessionPlayer(req, new PGDBPlayer());
        pgRoutePlayerLog.debug("_getSessionPlayer created player" );
    }
    return PGSession.get(req, 'pgdbPlayer').created();
};

PGRoutePlayer.prototype._verifyPostedUsernameAndPassword = function(req, postedUsername, postedPassword) {
    var self = this;
    var prefix = "verifyPostedUsernameAndPassword('" + postedUsername + "') ";
    pgRoutePlayerLog.debug(prefix + "called");

    var defer = Q.defer();
    self._getSessionPlayer(req).then(
        function(pgdbPlayer) {
            pgRoutePlayerLog.debug("getSessionPlayer returned a player");

            // Fetch it and check the password.
            pgdbPlayer.find(postedUsername).then(
                function(data) {
                    pgRoutePlayerLog.debug(prefix + "find returned: " + JSON.stringify(data));
                    if (!(data instanceof Array)) {
                        pgRoutePlayerLog.fatal(prefix + "non-array returned");
                        defer.reject("non-array");
                    } else if (data.length !== 1) {
                        pgRoutePlayerLog.fatal(prefix + "bad number of items returned");
                        defer.reject("bad-array-length");
                    } else {
                        var user = data[0];
                        if (user.username !== postedUsername) {
                            pgRoutePlayerLog.fatal(prefix + "username mismatch");
                            defer.reject("bad-username");
                        } else {
                            pgRoutePlayerLog.debug(prefix + "matching name");
                            if (PasswordHash.verify(postedPassword, user.hashedPassword)) {
                                pgRoutePlayerLog.debug(prefix + "password match success");
                                pgdbPlayer.setUsername(postedUsername).then(
                                    function(data) { defer.resolve(pgdbPlayer); },
                                    function(err)  { defer.reject(err); }
                                );
                            } else {
                                pgRoutePlayerLog.error(prefix + "password mismatch");
                                defer.reject();
                            }
                        }
                    }
                },
                function(err) {
                    pgRoutePlayerLog.error(prefix + "find err: " + err);
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
    pgRoutePlayerLog.debug(prefix + "called");

    var defer = Q.defer();

    self._getSessionPlayer(req).then(
        function(pgdbPlayer) {
            pgRoutePlayerLog.debug(prefix + "getSessionPlayer returned a player");

            // Can't have duplicates.
            // TODO: use 'Exists' in the 'Expected' property to avoid duplicates
            pgdbPlayer.find(postedUsername).then(
                function() {
                    pgRoutePlayerLog.warn(prefix + "rejected: name exists");
                    defer.reject("name-exists");
                },
                function(err) {
                    if (err === "not-found") {
                        pgRoutePlayerLog.debug(prefix + "returned not-found, this is good");
                        var passHash = PasswordHash.generate(postedPassword);
                        var user = {username: postedUsername, hashedPassword: passHash};
                        pgdbPlayer.add(user).then(
                            function() {
                                pgRoutePlayerLog.debug(prefix + "added user just fine");
                                pgdbPlayer.setUsername(postedUsername).then(
                                    function(data) { defer.resolve(pgdbPlayer); },
                                    function(err)  { defer.reject(err); }
                                );                             
                            },
                            function(err) {
                                pgRoutePlayerLog.error(prefix + "adding user: " + err);
                                defer.reject(err);
                            }
                        );
                    } else {
                        // Uh-oh, some other kind of error, bad news.
                        pgRoutePlayerLog.error(prefix + "trying to fetch username" + err);
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
