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
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ username: req.session.username }));
};

/*
* Register a new player who provides a username and a password.
* This cannot duplicate an existing player.
*
* @method _registerPlayer
*
*/
PGRoutePlayer.prototype._registerPlayer = function(req, res) {
    var self = this;
    console.log("PGRoutePlayer _registerPlayer");

    res.setHeader('Content-Type', 'application/json');
    self._pgdbPlayer.registerNewUser(req.username, req.password).then(function() {
        req.session.username = username;
        res.end(JSON.stringify({ username: req.session.username }));
    }).fail(function(err) {
        res.end(JSON.stringify({ err: err }));
    });
};

PGRoutePlayer.prototype._signinPlayer = function(req, res) {
    var self = this;
    console.log("PGRoutePlayer _signinPlayer");

    res.setHeader('Content-Type', 'application/json');
    self._pgdbPlayer.verifyPostedUsernameAndPassword(req.username, req.password).then(function() {
        req.session.username = username;
        res.end(JSON.stringify({ username: req.session.username }));
    }).fail(function(err) {
        res.end(JSON.stringify({ err: err }));
    });
};

module.exports = PGRoutePlayer;
