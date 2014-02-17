
/**
* Module dependencies.
*/

var express = require('express'),
    http = require('http'),
    path = require('path'),
    PGTile = require('./models/pgtile'),
    PGHand = require('./models/pghand');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 8088);
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/static'));
    // app.engine('html', require('ejs').renderFile);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    // app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.render('index.ejs', {
        title: 'Home'
    });
});

app.get('/tiles', function(req, res) {
    res.render('pgtiles.ejs', {
        title: 'All Tiles'
    });
});

app.get('/tile', function(req, res) {
    var tile = new PGTile(PGTile.prototype.TILE_INDEX.TEEN_1);
    res.render('pgtile.ejs', {
        title: 'Tile',
        tile: tile
    });
});

app.get('/hand', function(req, res) {
    var hand = new PGHand([
        new PGTile(PGTile.prototype.TILE_INDEX.TEEN_1),
        new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1)
    ]);
    res.render('pghand.ejs', {
        title: 'Hand',
        hand: hand
    });
});

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

