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

    // Original username is 'unknown'.
    this._username = "unknown";
}

// Extend from PGDB.
util.inherits(PGDBPlayer, PGDB);

PGDBPlayer.prototype.fetchUsername = function(username) {
    var self = this;
    self._log.debug("fetchUsername(" + username + ")");

    var defer = Q.defer();

    self._initPromise.then(
        function() {
            self.find(username).then(
                function(data) { defer.resolve(data); },
                function(err)  { defer.reject(err);   }
            );
        },
        function(err) {
            defer.reject(err);
        }
    );

    return defer.promise;
};

PGDBPlayer.prototype.verifySessionUsername = function(username) {
    var self = this;
    self._log.debug("verifySessionUsername(" + username + ")");

    var fetchPromise = self.fetchUsername(username);

    // We get first dibs on the promise; we return the same promise but by
    // the time our caller does a .then() on it, we've already done ours.
    // If there was a problem and it was rejected, we don't care, but our
    // client should handle the rejection.
    fetchPromise.then(function(user) {
        self._username = username;
    });

    return fetchPromise;
};

PGDBPlayer.prototype.verifyPostedUsernameAndPassword = function(postedUsername, postedPassword) {
    var self = this;
    self._log.debug("verifyPostedUsernameAndPassword(" + username + ")");

    var defer = Q.defer();

    self._initPromise.then(
        function() {
            // I guess our old username isn't valid.
            delete self._username;

            // Fetch it and check the password.
            self.fetchUsername(postedUsername).then(
                function(userInDB) {
                    self._log.debug("verifyPostedUsernameAndPassword('" + postedUsername + "') returned from fetchUsername");
                    self._log.debug("verifyPostedUsernameAndPassword('" + postedUsername + "') fetchUserName returned: " + JSON.stringify(userInDB));
                    if (userInDB.username === postedUsername) {
                        self._log.debug("verifyPostedUsernameAndPassword('" + postedUsername + "') matching name");
                        if (PasswordHash.verify(postedPassword, userInDB.hashedPassword)) {
                            self._log.debug("verifyPostedUsernameAndPassword('" + postedUsername + "') password match success");
                            self._username = postedUsername;
                            defer.resolve({username: postedUsername, password: postedPassword});
                        } else {
                            self._log.error("verifyPostedUsernameAndPassword('" + postedUsername + "') password mismatch");
                            defer.reject();
                        }
                    } else {
                        self._log.fatal("verifyPostedUsernameAndPassword('" + postedUsername + "') FATAL username mismatch");
                        defer.reject();
                    }
                },
                function(err) {
                    self._log.error("verifyPostedUsernameAndPassword('" + postedUsername + "') fetchUsername err: " + err);
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
            self.fetchUsername(postedUsername).then(
                function() {
                    self._log.warn("PGDBPlayer.registerNewUser rejected: name exists");
                    defer.reject("name-exists");
                },
                function(err) {
                    if (err === "not-found") {
                        var user = {username: postedUsername, hashedPassword: PasswordHash.generate(postedPassword)};
                        self.add(user).then(
                            function()    { defer.resolve(user); },
                            function(err) { defer.reject(err);   }
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

PGDBPlayer.prototype.currentUsername = function() {
    return this._username;
};

module.exports = PGDBPlayer;
