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
}

// Extend from PGDB.
util.inherits(PGDBPlayer, PGDB);

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

// Convenience functions
PGDBPlayer.prototype.username = function() {
    return this.get('username') || "unknown";
};

PGDBPlayer.prototype.setUsername = function(username) {
    return this.set('username', username);
};

module.exports = PGDBPlayer;
