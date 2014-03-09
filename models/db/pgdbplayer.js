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

var pgdbPlayerCreateComputerDefer = Q.defer(),
    pgdbPlayerCreatingComputer = false,
    pgdbPlayerComputer;

var pgPlayerLog = new PGLog('Player', 'debug');

/*
* @constructor PGDBPlayer
* @extends PGDB
*
*/

function PGDBPlayer(props) {
    PGDB.call(this, 'Players', 'username');
    var self = this;
    var prefix = "PGDBPlayer constructor ";
    pgPlayerLog.debug(prefix + "called");

    // We might be the computer: if we have props, that's us.
    if (props) {
        pgPlayerLog.debug(prefix + "creating the computer player from props");
        self._props = props;
    } else if (!pgdbPlayerCreatingComputer) {
        // We're the first one in; make sure there is a computer in the database.
        pgdbPlayerCreatingComputer = true;
        self._initPromise.then(
            function(data) {
                self.find('computer').then(
                    function(data) {
                        pgPlayerLog.debug(prefix + "found computer, no need to create it");
                        pgdbPlayerComputer = new PGDBPlayer(data);
                        pgdbPlayerCreateComputerDefer.resolve();               // found computer, no need to create
                    },
                    function(err)  {
                        if (err !== "not-found") {
                            pgPlayerLog.error(prefix + "error trying to find computer: " + err);
                            pgdbPlayerCreateComputerDefer.reject(err);                             // uh-oh
                        } else {
                            pgPlayerLog.debug(prefix + "need to create computer");
                            var computerItem = {
                                username: 'computer',
                                passwordHash: PasswordHash.generate('I am the computer')
                            };
                            var _pgdbPlayerComputer = new PGDBPlayer(computerItem);
                            _pgdbPlayerComputer._initPromise.then(
                                function(data) {
                                    pgPlayerLog.debug(prefix + "initPromise for computer resolved");
                                    _pgdbPlayerComputer.add(computerItem).then(
                                        function(data) {
                                            pgdbPlayerComputer = _pgdbPlayerComputer;
                                            pgdbPlayerCreateComputerDefer.resolve(pgdbPlayerComputer);   // created computer, that's good
                                        },
                                        function(err) {
                                            pgPlayerLog.error(prefix + "error trying to add computer: " + err);
                                            pgdbPlayerCreateComputerDefer.reject(err);                     // uh-oh
                                        }
                                    );
                                },
                                function(err) {
                                    pgPlayerLog.error(prefix + "initPromise error trying to add computer: " + err);
                                    pgdbPlayerCreateComputerDefer.reject(err);                     // uh-oh
                                }
                            );
                        }
                    }
                );
            },
            function(err) {
                pgPlayerLog.fatal(prefix + "error on initPromise: " + err);
                pgdbPlayerCreateComputerDefer.reject(err);
            }
        );
    }
}

// Extend from PGDB.
util.inherits(PGDBPlayer, PGDB);

// Override created.
PGDBPlayer.prototype.created = function() {
    var self = this;
    var defer = Q.defer();
    Q.all([
        self._initPromise,
        pgdbPlayerCreateComputerDefer.promise
    ]).then(
        function(data) {
            pgPlayerLog.debug("created returning self");
            defer.resolve(self);
        },
        function(err)  { defer.reject(err); }
    );
    return defer.promise;
};

// Return the computer player
PGDBPlayer.prototype.computer = function() {
    if (!pgdbPlayerComputer) {
        var err = "PGDBPLayer.computer: called too soon!";
        pgPlayerLog.fatal(err);
        throw new Error(err);
    }
    return pgdbPlayerComputer;
};

// Return the computer player promise so clients can know when it's done.
PGDBPlayer.prototype.computerPromise = function() {
    return pgdbPlayerCreateComputerDefer.promise;
};

PGDBPlayer.prototype.deleteUser = function(username) {
    var self = this;
    pgPlayerLog.debug("PGDBPlayer.deleteUser('" + username + "')");

    var defer = Q.defer();

    self._initPromise.then(
        function() {
            pgPlayerLog.debug("PGDBPlayer.deleteUser('" + username + "') _initPromise.then success function called");
            self.delete(username).then(
                function(data) {
                    pgPlayerLog.debug("PGDBPlayer.deleteUser('" + username + "') pgdb.deleteItem.then success function called");
                    defer.resolve(data);
                },
                function(err)  {
                    pgPlayerLog.debug("PGDBPlayer.deleteUser('" + username + "') pgdb.deleteItem.then failure function called");
                    defer.reject(err);
                }
            );
        },
        function(err) {
            pgPlayerLog.debug("PGDBPlayer.deleteUser('" + username + "') _initPromise.then failure function called");
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
