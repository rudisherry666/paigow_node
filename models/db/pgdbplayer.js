/*
*
* @class PGDBPlayer
*
* This file defines the PGDBPlayer class.
*
* A player is a person that plays.
*/

// Module dependencies.
var PGLog = require('../../utils/pglog'),
    Q = require('q'),
    PGDB = require('./pgdb'),
    util = require('util'),
    PasswordHash = require('password-hash');

/*
* @constructor PGDBPlayer
* @extends PGDB
*
*/

function PGDBPlayer() {
    PGDB.call(this, 'Players', 'username');
    var self = this;
    self._log = new PGLog('player', 'debug');
    self._log.debug("PGDBPlayer constructor called");

    // Original username is 'unknown'.
    this._username = "unknown";
}

// Extend from PGDB.
util.inherits(PGDBPlayer, PGDB);

PGDBPlayer.prototype.verifyPostedUsernameAndPassword = function(postedUsername, postedPassword) {
    var self = this;
    var prefix = "verifyPostedUsernameAndPassword('" + postedUsername + "') ";
    self._log.debug(prefix + "called");

    var defer = Q.defer();

    self._initPromise.then(
        function() {
            // I guess our old username isn't valid.
            delete self._username;

            // Fetch it and check the password.
            self.find(postedUsername).then(
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
                                self._username = postedUsername;
                                self._hashedPassword = user.hashedPassword;
                                defer.resolve({username: postedUsername, password: postedPassword});
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
PGDBPlayer.prototype.registerNewUser = function(postedUsername, postedPassword) {
    var self = this;
    self._log.debug("PGDBPlayer.registerNewUser('" + postedUsername + "')");

    var defer = Q.defer();

    self._initPromise.then(
        function() {
            // Can't have duplicates.
            // TODO: use 'Exists' in the 'Expected' property to avoid duplicates
            self.find(postedUsername).then(
                function() {
                    self._log.warn("PGDBPlayer.registerNewUser rejected: name exists");
                    defer.reject("name-exists");
                },
                function(err) {
                    if (err === "not-found") {
                        var passHash = PasswordHash.generate(postedPassword);
                        var user = {username: postedUsername, hashedPassword: passHash};
                        self.add(user).then(
                            function() {
                                self._username = postedUsername;
                                self._hashedPassword = passHash;
                                defer.resolve(user);
                            },
                            function(err) { defer.reject(err); }
                        );
                    } else {
                        // Uh-oh, some other kind of error, bad news.
                        self._log.error("PGDBPlayer.registerNewUser error trying to fetch username " + postedUsername + ": " + err);
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

PGDBPlayer.prototype.deleteUser = function(username) {
    var self = this;
    self._log.debug("PGDBPlayer.deleteUser('" + username + "')");

    var defer = Q.defer();

    self._initPromise.then(
        function() {
            self._log.debug("PGDBPlayer.deleteUser('" + username + "') _initPromise.then success function called");
            self.delete(username).then(
                function(data) {
                    self._log.debug("PGDBPlayer.deleteUser('" + username + "') pgdb.deleteItem.then success function called");
                    defer.resolve(data);
                },
                function(err)  {
                    self._log.debug("PGDBPlayer.deleteUser('" + username + "') pgdb.deleteItem.then failure function called");
                    defer.reject(err);
                }
            );
        },
        function(err) {
            self._log.debug("PGDBPlayer.deleteUser('" + username + "') _initPromise.then failure function called");
            defer.reject(err);
        }
    );

    return defer.promise;
};

PGDBPlayer.prototype.username = function() {
    return this._username;
};

module.exports = PGDBPlayer;
