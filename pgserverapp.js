/*
* @class PGServerApp
*
* The main server application for PaiGow
*/

// Module dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),
    PGLog = require('./utils/pglog'),
    PGTile = require('./static/js/classes/pgtile'),
    PGHand = require('./static/js/classes/pghand'),
    PGDeal = require('./models/pgdeal'),
    PGDBPlayer = require('./models/db/pgdbplayer'),
    PGRoutePlayer = require('./routes/pgrouteplayer'),
    PGRouteGame = require('./routes/pgroutegame');

function PGServerApp() {
    this._log = new PGLog("app", 'debug');

    // Set up the express application
    this._expressApp = express();
    this._expressApp.set('port', process.env.PORT || 8088);
    this._expressApp.set('views', __dirname + '/views');
    this._expressApp.use(express.static(__dirname + '/static'));
    this._expressApp.use(express.favicon());
    this._expressApp.use(express.logger('dev'));
    this._expressApp.use(express.bodyParser());
    this._expressApp.use(express.methodOverride());
    this._expressApp.use(express.cookieParser('P0KJjhtvbhDwwpU6iUyytG43E4E'));
    this._expressApp.use(express.cookieSession());
    this._expressApp.use(this._expressApp.router);
    this._expressApp.use(express.static(path.join(__dirname, 'public')));
    this._expressApp.use(express.errorHandler());
}

PGServerApp.prototype.init = function(testing) {
    var self = this;

    // If we already have the DB keys set, just use them.
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_ENDPOINT) {
        self._initWithSecrets(testing);
    } else {
        this._expressApp.post('/setkeys', function(req, res) {
            if (req.body.key1 && req.body.key2 && req.body.key3 && req.body.key4 && req.body.key5) {
                process.env.AWS_ACCESS_KEY_ID = req.body.key1;
                process.env.AWS_SECRET_ACCESS_KEY = req.body.key2;
                process.env.AWS_REGION = req.body.key3;
                process.env.AWS_ENDPOINT = req.body.key4 + "://" + req.body.key5;
                if (req.body.key6)
                    process.env.AWS_ENDPOINT += ":" + req.body.key6;
                self._log.debug("ep: " + process.env.AWS_ENDPOINT);
                self._initWithSecrets(testing);
            }

            // Always return a 404, so sender doesn't know that it's really here.
            res.send(404);
        });
    }
};

PGServerApp.prototype._initWithSecrets = function(testing) {
    var self = this;
    if (self._initWithSecretsCalled) return;
    self._initWithSecretsCalled = true;

    self._log.debug("_initWithSecrets called");

    // Initialize the player stuff.
    var pgdbPlayer;
    if (!testing)
        pgdbPlayer = new PGDBPlayer();

    // Initialize the routes
    var pgRoutePlayer = new PGRoutePlayer(this._expressApp);
    var pgRouteGame = new PGRouteGame(this._expressApp);

    // TODO: remove testing stuff below

    // Main endpoint.
    self._expressApp.get('/', function(req, res) {
        var deal = new PGDeal([
            new PGTile(PGTile.prototype.TILE_INDEX.TEEN_1),
            new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1),
            new PGTile(PGTile.prototype.TILE_INDEX.DAY_2),
            new PGTile(PGTile.prototype.TILE_INDEX.HARMONY_FOUR_1)
        ]);
        res.render('paigow.ejs', {
            title: 'Home',
            deal: deal
        });
    });

    // Test all the tiles.
    self._expressApp.get('/tiles', function(req, res) {
        res.render('pgtiles.ejs', {
            title: 'All Tiles'
        });
    });

    // Test getting one tile.
    self._expressApp.get('/tile', function(req, res) {
        var tile = new PGTile(PGTile.prototype.TILE_INDEX.TEEN_1);
        res.render('pgtile.ejs', {
            title: 'Tile',
            tile: tile
        });
    });

    // Test a hand.
    self._expressApp.get('/hand', function(req, res) {
        var hand = new PGHand([
            new PGTile(PGTile.prototype.TILE_INDEX.TEEN_1),
            new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1)
        ]);
        res.render('pghand.ejs', {
            title: 'Hand',
            hand: hand
        });
    });

    // Test a deal.
    self._expressApp.get('/deal', function(req, res) {
        var deal = new PGDeal([
            new PGTile(PGTile.prototype.TILE_INDEX.TEEN_1),
            new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1),
            new PGTile(PGTile.prototype.TILE_INDEX.DAY_2),
            new PGTile(PGTile.prototype.TILE_INDEX.HARMONY_FOUR_1)
        ]);
        res.render('pgdeal.ejs', {
            title: 'Hand',
            deal: deal
        });
    });
};

PGServerApp.prototype.run = function() {
    var self = this;
    // Start the server!
    this._server = http.createServer(self._expressApp).listen(self._expressApp.get('port'), function() {
        console.log("Express server listening on port " + self._expressApp.get('port'));
    });
};

PGServerApp.prototype.stop = function() {
    if (this._server)
        this._server.close();
};



module.exports = PGServerApp;
