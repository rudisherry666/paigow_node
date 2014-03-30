/*
*
* @class PGHandModel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'backbone',
    'classes/pghand',
    'classes/pgstrategy'
], function(
    Backbone,
    PGHand,
    PGStrategy
) {
    
    var PGHandModel = Backbone.Model.extend({

        // Startup
        initialize: function(options) {
            this._deckModel = options.deckModel;
            this.set(this.defaults);

            this._addModelListeners();

            // Get all the tile indexes.  These don't change, but when the
            // deck is shuffled we re-get the tile at that index.
            var tileIndexes = [];
            for (var ti = 0; ti < 4; ti++)
                tileIndexes.push(this._deckModel.nextTileIndex());

            // Set the indexes but during initialization we don't want
            // to trigger anything: that happens when the deck is washed.
            this.set('tile_indexes', tileIndexes, {silent: true});
        },

        // A hand is specific to a player in a game, and is
        // some round in the game.
        defaults: {
            'tiles': [],
            'points': 0
        },

        urlRoot: '/hand',

        _addModelListeners: function() {
            // If the deck is changed, our tiles should be re-initialized.
            this._deckModel.on('change:deck',
                _.bind(function() { this._resetTiles(); }, this));

            // If tile indexes are changed, reset the tiles
            this.on('change:tile_indexes',
                _.bind(function() { this._resetTiles(); }, this));
        },

        _resetTiles: function() {
            var tileIndexes = this.get('tile_indexes');
            var tiles = [
                this._deckModel.tileOf(tileIndexes[0]),
                this._deckModel.tileOf(tileIndexes[1]),
                this._deckModel.tileOf(tileIndexes[2]),
                this._deckModel.tileOf(tileIndexes[3])
            ];

            // First time when we set the tiles it sends out a notification
            // since it wasn't set at all; subsequently it doesn't because
            // it doesn't recognize array differences.  Set it to silent and
            // manually notify (below) so we do the same thing every time.
            this.set('tiles', tiles, {silent:true});
            this.trigger('change:tiles');
        },

        previewTiles: function(options) {
            var tiles = this.get('tiles');
            var tileIndexes = this.get('tile_indexes').slice(0);

            // Put the higher hand on the left
            var highHand = new PGHand(tiles[0], tiles[1]);
            var lowHand = new PGHand(tiles[2], tiles[3]);
            if (highHand.compare(lowHand) < 0) {
                tileIndexes = [ tileIndexes[2], tileIndexes[3], tileIndexes[0], tileIndexes[1] ];
            }

            // Make sure each hand has the higher tiles.
            var deckModel = this._deckModel;
            function compareAndSwitchIfNecessary(a, b) {
                if (deckModel.tileOf(tileIndexes[a]).compare(deckModel.tileOf(tileIndexes[b])) < 0) {
                    var tempIndex = tileIndexes[a];
                    tileIndexes[a] = tileIndexes[b];
                    tileIndexes[b] = tempIndex;
                }
            }
            compareAndSwitchIfNecessary(0, 1);
            compareAndSwitchIfNecessary(2, 3);

            this.set('tile_indexes', tileIndexes);
        },

        pgSet: function() {
            var tiles = this.get('tiles');
            return new PGSet(tiles[0], tiles[1], tiles[2], tiles[3]);
        },

        orderTiles: function(options) {
            if (!this.inOrderTiles) {
                var tiles = this.get('tiles');
                var tileIndexes = this.get('tile_indexes').slice(0);

                // Use strategy.
                var strategy = new PGStrategy(tiles);
                var bestSet = strategy.bestSet();
                var newTiles = bestSet.tiles();

                console.log("" + bestSet + " is chosen as only way");

                // Map the tiles as they are now to the tiles index; use
                // equality of tiles.
                var newTileIndexes = [];
                _.each(newTiles, function(newTile) {
                    for (var oti = 0; oti < tiles.length; oti++) {
                        if (newTile === tiles[oti])
                            newTileIndexes.push(tileIndexes[oti]);
                    }
                });

                this.inOrderTiles = true;
                this.set('tile_indexes', newTileIndexes);
                this.inOrderTiles = false;
            }
        }

    });

    return PGHandModel;
});
