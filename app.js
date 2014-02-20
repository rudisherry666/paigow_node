// Module dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),
    PGTile = require('./models/pgtile'),
    PGHand = require('./models/pghand'),
    PGDeal = require('./models/pgdeal'),
    PGDBPlayer = require('./models/db/pgdbplayer'),
    PGRoutePlayer = require('./routes/pgrouteplayer');

// Set up the express application
var app = express();
app.set('port', process.env.PORT || 8088);
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/static'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: process.env.PG_SECRET}));
app.use(app.router);
// app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());

// Initialize the player stuff.
var pgdbPlayer = new PGDBPlayer();
var pgRoutePlayer = new PGRoutePlayer(app, pgdbPlayer);

app.get('/', function(req, res) {
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

// Get of player: return the player that's in the session.
// app.get('/player', function(req, res) {
//     res.setHeader('Content-Type', 'application/json');
//     if (req.session.username)
//         res.end(JSON.stringify({ username: req.session.username }));
//     else {
//         console.log("calling get...");
//         PGPlayer.getSessionPlayer(req)
//             .then(function(player) {
//                 console.log("          ...success: " + player.username);
//                 req.session.username = player.username;
//                 res.end(JSON.stringify({ username: req.session.username }));
//             })
//             .fail(function(err) {
//                 console.log("          ...failure: " + err);
//                 req.session.username = "unknown";
//                 res.end(JSON.stringify({ username: req.session.username }));
//             });
//     }
// });

// Post of player means they're creating a player or signing in.
app.post('/player', function(req, res) {
    var player = req.body;
    PGPlayer.setSessionPlayer(req.body);
});

// Test all the tiles.
app.get('/tiles', function(req, res) {
    res.render('pgtiles.ejs', {
        title: 'All Tiles'
    });
});

// Test getting one tile.
app.get('/tile', function(req, res) {
    var tile = new PGTile(PGTile.prototype.TILE_INDEX.TEEN_1);
    res.render('pgtile.ejs', {
        title: 'Tile',
        tile: tile
    });
});

// Test a hand.
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

// Test a deal.
app.get('/deal', function(req, res) {
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

// Start the server!
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

