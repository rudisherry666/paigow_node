/*
*
* @class PGDBGame
*
* This file defines the PGDBGame class.
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
* @constructor PGDBGame
* @extends PGDB
*
*/

function PGDBGame() {
    PGDB.call(this, 'Games', 'gameid');
    var self = this;
    self._log = new PGLog('game', 'debug');

    // Original username is 'unknown'.
    this._username = "unknown";
}

// Extend from PGDB.
util.inherits(PGDBGame, PGDB);

module.exports = PGDBGame;
