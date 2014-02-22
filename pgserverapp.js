/*
* @class PGServerApp
*
* The main server application for PaiGow
*/

// Module dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),
    PGTile = require('./models/pgtile'),
    PGHand = require('./models/pghand'),
    PGDeal = require('./models/pgdeal'),
    PGDBPlayer = require('./models/db/pgdbplayer'),
    PGRoutePlayer = require('./routes/pgrouteplayer');

function PGServerApp() {
    // Set up the express application
    this._expressApp = express();
    this._expressApp.set('port', process.env.PORT || 8088);
    this._expressApp.set('views', __dirname + '/views');
    this._expressApp.use(express.static(__dirname + '/static'));
    this._expressApp.use(express.favicon());
    this._expressApp.use(express.logger('dev'));
    this._expressApp.use(express.bodyParser());
    this._expressApp.use(express.methodOverride());
    this._expressApp.use(express.cookieParser());
    this._expressApp.use(express.session({secret: process.env.PG_SECRET}));
    this._expressApp.use(this._expressApp.router);
    // this._expressApp.use(require('stylus').middleware(__dirname + '/public'));
    this._expressApp.use(express.static(path.join(__dirname, 'public')));
    this._expressApp.use(express.errorHandler());
}

PGServerApp.prototype.init = function() {
    
    // Initialize the player stuff.
    var pgdbPlayer = new PGDBPlayer();
    var pgRoutePlayer = new PGRoutePlayer(this._expressApp, pgdbPlayer);

    // TODO: remove testing stuff below

    // Main endpoint.
    this._expressApp.get('/', function(req, res) {
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
    this._expressApp.get('/tiles', function(req, res) {
        res.render('pgtiles.ejs', {
            title: 'All Tiles'
        });
    });

    // Test getting one tile.
    this._expressApp.get('/tile', function(req, res) {
        var tile = new PGTile(PGTile.prototype.TILE_INDEX.TEEN_1);
        res.render('pgtile.ejs', {
            title: 'Tile',
            tile: tile
        });
    });

    // Test a hand.
    this._expressApp.get('/hand', function(req, res) {
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
    this._expressApp.get('/deal', function(req, res) {
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
    http.createServer(self._expressApp).listen(self._expressApp.get('port'), function() {
        console.log("Express server listening on port " + self._expressApp.get('port'));
    });
};


module.exports = PGServerApp;
