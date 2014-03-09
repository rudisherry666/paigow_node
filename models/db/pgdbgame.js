/*
*
* @class PGDBGame
*
* This file defines the PGDBGame class.
*
* A player is a person that plays.
*/

// Module dependencies.
var crypto = require('crypto'),
    PGLog = require('../../utils/pglog'),
    Q = require('q'),
    PGDB = require('./pgdb'),
    PGDBPlayer = require('./pgdbplayer'),
    util = require('util');

/*
* @constructor PGDBGame
* @extends PGDB
*
*/

var pgdbGameLog = new PGLog('pgdbgame', 'verbose');

function PGDBGame(player1, player2) {
    var prefix = "PGDBGame constructor ";
    pgdbGameLog.verbose(prefix + "called");

    function pgdbGameConstructorFatal(err) {
        pgdbGameLog.fatal(prefix + err);
        throw new Error(prefix + err);
    }
    if (!player1 || !(player1 instanceof PGDBPlayer)) pgdbGameConstructorFatal("bad player 1");
    if (!player2 || !(player2 instanceof PGDBPlayer)) pgdbGameConstructorFatal("bad player 2");

    PGDB.call(this, 'Games', 'gameid');
    var self = this;

    // Create a random game ID.  In the extremely unlikely event that the random string is already
    // created, too bad.
    self._origSavePromise =
        self.set('gameid', crypto.randomBytes(10).toString('base64')).then(
            function(data) {
                pgdbGameLog.verbose(prefix + "orig name resolved: " + data);
                return self.set('players', [
                    player1.username(),
                    player2.username()
                ]);
            },
            function(err)  { pgdbGameConstructorFatal("random game ID already exists"); }
        );
}

// Extend from PGDB.
util.inherits(PGDBGame, PGDB);

// Override created.
PGDBGame.prototype.created = function() {
    var self = this;

    return self._initPromise.then(
        function(data) { return self._origSavePromise; },
        function(err)  {
            pgdbGameLog.verbose('PGDBGame.created rejected');
            throw new Error(err);
        }
    );
};

PGDBGame.prototype.player1 = function() {
    var players = this.get('players');
    if (players)
        return players[0];
    else
        return null;
};

PGDBGame.prototype.player2 = function() {
    var players = this.get('players');
    if (players)
        return players[1];
    else
        return null;
};

module.exports = PGDBGame;
