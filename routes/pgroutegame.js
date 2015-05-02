/*
* class PGRouteGame
*
* Handles the endpoints for player manipulation
*
*/

var Q = require('q'),
    util = require('util'),
    PGLog = require('../utils/pglog'),
    PGSession = require('../utils/pgsession'),
    PGRouteBase = require('./pgroutebase'),
    PGDBPlayer = require('../models/db/pgdbgame');

var pgRouteGameLog = new PGLog("rtegame", 'debug');

function PGRouteGame(expressApp, pgdbPlayer) {
    PGRouteBase.call(this, expressApp);
    var self = this;
    pgRouteGameLog.debug("PGRouteGame constructor called");

    // Establish the endpoints.
    self._expressApp.get('/games', function(req, res) { self._getSessionGames(req, res); });
    self._expressApp.get('/game', function(req, res) { self._getSessionGame(req, res); });
    self._expressApp.post('/game', function(req, res) { self._newGame(req, res); });
}

util.inherits(PGRouteGame, PGRouteBase);

/*
* Return a promise that resolves to the current game in the session.
*
* @method _getSessionGame
*
*/
PGRouteGame.prototype._getSessionGame = function(req, res) {
    var self = this;
    pgRouteGameLog.debug("_getSessionGame called");

    // If there is no game, we return 404
    PGSession.get(req, 'game').then(
        function(data) { res.end(JSON.stringify(pgdbGame)); },
        function(err)  { res.end(404); }
    );
};


/*
* Return the list of games for this player
*
* @method _getSessionGames
*
*/
PGRouteGame.prototype._getSessionGames = function(req, res) {
    var self = this;
    pgRouteGameLog.debug("_getSessionGames called");

    res.setHeader('Content-Type', 'application/json');

    // There is a player. Find out what games he's in.

    // Get the games from the player.  Right now there are none.
};



/*
* Register a new player who provides a username and a password.
* This cannot duplicate an existing player.
*
* @method _registerPlayer
*
*/
PGRouteGame.prototype._newGame = function(req, res) {
    var self = this;
    var prefix = "PGRouteGame._newGame() ";
    pgRouteGameLog.debug(prefix + "called ");

    res.setHeader('Content-Type', 'application/json');

    // Get the player so we can find games for this player.
    var sessionPlayer = PGSession.get(req, 'player');
    if (!sessionPlayer) {
        pgRoutGameLog.error(prefix + "no player for this game");
        res.end(500);
    }

    var sessionGame = new PGDBGame(sessionPlayer, PGDBPlayer.prototype.computer());
    sessionGame.add();
    PGSession.set('game', sessionGame);

};


module.exports = PGRouteGame;
