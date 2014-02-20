/*
* class PGRoutePlayer
*
* Handles the endpoints for player manipulation
*
*/

var util = require('util'),
    PGRouteBase = require('./pgroutebase'),
    PGDBPlayer = require('../models/db/pgdbplayer');

function PGRoutePlayer(expressApp, pgdbPlayer) {
    PGRouteBase.call(this, expressApp);
    var self = this;

    // Establish the endpoints.
    self._expressApp.get('/player', self._getSessionPlayer);
    self._expressApp.post('/player/register', self._registerPlayer);
    self._expressApp.post('/player/signin', self._signinPlayer);

    self._pgdbPlayer = pgdbPlayer;
}

util.inherits(PGRoutePlayer, PGRouteBase);

PGRoutePlayer.prototype._getSessionPlayer = function(req, res) {
    var self = this;
    console.log("PGRoutePlayer _getSessionPlayer");
};

PGRoutePlayer.prototype._registerPlayer = function(req, res) {
    var self = this;
    console.log("PGRoutePlayer _registerPlayer");
};

PGRoutePlayer.prototype._signinPlayer = function(req, res) {
    var self = this;
    console.log("PGRoutePlayer _signinPlayer");
};

module.exports = PGRoutePlayer;
