/*
* class PGRoutePlayer
*
* Handles the endpoints for player manipulation
*
*/

var util = require('util'),
    PGLog = require('../utils/pglog'),
    PGRouteBase = require('./pgroutebase'),
    PGDBPlayer = require('../models/db/pgdbplayer');

function PGRoutePlayer(expressApp, pgdbPlayer) {
    PGRouteBase.call(this, expressApp);
    var self = this;
    self._log = new PGLog("RoutePlayer", 'debug');

    // Establish the endpoints.
    self._expressApp.get('/player', function(req, res) { self._getSessionUsername(req, res); });
    self._expressApp.post('/player', function(req, res) { self._registerOrSigninPlayer(req, res); });
}

util.inherits(PGRoutePlayer, PGRouteBase);

/*
* @method GET /player
* 
* Get the username current player in the session, or "unknown" if there isn't one.
*
*/
PGRoutePlayer.prototype._getSessionUsername = function(req, res) {
    var self = this;
    self._log.debug("_getSessionUsername called");

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ username: this._getSessionPlayer(req).username() }));
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
    self._log.debug("_registerOrSigninPlayer called");
    self._log.debug("register: " + JSON.stringify(req.body));

    res.setHeader('Content-Type', 'application/json');

    // We know the difference between signing in and registering by the state
    if (req.body.state === 'registering') {
        try {
            self._log.debug("registering");
            // This is a register
            self._getSessionPlayer(req).registerNewUser(req.body.username, req.body.password).then(
                function() {
                    self._log.debug("registering done" );
                    req.session['username'] = req.body.username;
                    res.end(JSON.stringify({ username: req.session['username'] }));
                },
                function(err) {
                    self._log.debug('err registering: ' + err);
                    res.end(JSON.stringify({ err: err }));
                });
        } catch (err) {
            self._log.debug('caught err registering: ' + err);
        }
    } else {
        console.log("PGRoutePlayer _signin");
        self._getSessionPlayer(req).verifyPostedUsernameAndPassword(req.body.username, req.body.password).then(function() {
            req.session['username'] = req.body.username;
            res.end(JSON.stringify({ username: req.session['username'] }));
        }).fail(function(err) {
            res.end(JSON.stringify({ err: err }));
        });
    }

};

/*
* Return the current player in the session, creating one if necessary.
*
* @method _getSessionPlayer
*
*/
PGRoutePlayer.prototype._getSessionPlayer = function(req) {
    var self = this;
    self._log.debug("_getSessionPlayer called");

    // If there is no player, now is the time to create one.
    if (!req.session['pgdbPlayer'])
        req.session['pgdbPlayer'] = new PGDBPlayer();
    return req.session['pgdbPlayer'];
};

module.exports = PGRoutePlayer;
