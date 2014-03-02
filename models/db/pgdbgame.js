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
    PGDBPlayer = require('./pgdbplayer'),
    util = require('util');

/*
* @constructor PGDBGame
* @extends PGDB
*
*/

function PGDBGame(pgdbPlayer1, pgdbPlayer2) {
    if (!pgdbPlayer1 || !(pgdbPlayer1 instanceof PGDBPlayer)) throw new Error("PGDBGame constructor called with bad player 1");
    if (!pgdbPlayer2 || !(pgdbPlayer2 instanceof PGDBPlayer)) throw new Error("PGDBGame constructor called with bad player 2");

    PGDB.call(this, 'Games', 'gameid');
    var self = this;
    self._log = new PGLog('game', 'debug');

    this._pgdbPlayer1 = pgdbPlayer1;
    this._pgdbPlayer2 = pgdbPlayer2;
}

// Extend from PGDB.
util.inherits(PGDBGame, PGDB);

PGDBGame.prototype.player1 = function() {
    return this._pgdbPlayer1;
}
PGDBGame.prototype.player2 = function() {
    return this._pgdbPlayer2;
}

module.exports = PGDBGame;
