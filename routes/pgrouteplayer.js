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
    self._expressApp.get('/player', function(req, res) { self._getSessionPlayer(req, res); });
    self._expressApp.post('/player', function(req, res) { self._registerOrSigninPlayer(req, res); });

    self._pgdbPlayer = pgdbPlayer;
}

util.inherits(PGRoutePlayer, PGRouteBase);

/*
* @method GET /player
* 
* Get the current player in the session, or "unknown" if there isn't one.
*
*/
PGRoutePlayer.prototype._getSessionPlayer = function(req, res) {
    var self = this;
    res.setHeader('Content-Type', 'application/json');
    if (!req.session['username'])
        req.session['username'] = self._pgdbPlayer.currentUsername();
    res.end(JSON.stringify({ username: req.session['username'] }));
};

/*
* Register a new player who provides a username and a password.
* This cannot duplicate an existing player.
*
* @method _registerPlayer
*
*/
PGRoutePlayer.prototype._registerOrSigninPlayer = function(req, res) {
    var self = this;

    res.setHeader('Content-Type', 'application/json');

    // We know the difference between signing in and registering by the state
    if (req.body.state === 'registering') {
        try {
            console.log("PGRoutePlayer _register");
            // This is a register
            self._pgdbPlayer.registerNewUser(req.body.username, req.body.password).then(
                function() {
                    req.session['username'] = req.body.username;
                    res.end(JSON.stringify({ username: req.session['username'] }));
                },
                function(err) {
                    console.log('err setting username: ' + err);
                    res.end(JSON.stringify({ err: err }));
                });
        } catch (err) {
            console.log("Caught err " + err);
        }
    } else {
        console.log("PGRoutePlayer _signin");
        self._pgdbPlayer.verifyPostedUsernameAndPassword(req.body.username, req.body.password).then(function() {
            req.session['username'] = req.body.username;
            res.end(JSON.stringify({ username: req.session['username'] }));
        }).fail(function(err) {
            res.end(JSON.stringify({ err: err }));
        });
    }

};

module.exports = PGRoutePlayer;
