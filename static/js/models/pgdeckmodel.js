/*
*
* @class PGDeckModel
*
* This file defines the deck in its current state/
*/

define([
    'backbone',
    '../classes/pgtile'
],
function(
    Backbone,
    PTGile
) {
    
    var PGDeckModel = Backbone.Model.extend({

        // Startup
        initialize: function() {
            this.set(this.defaults);
            // this.washTiles({silent: true});
        },

        defaults: {
            'next_tile_index': 0
        },

        // Shuffle an array.
        washTiles: function(options) {
            var obj = PGTile.prototype.deck();
            var washed = [], rand;
            for (var index = 0; index < obj.length; index++) {
                value = obj[index];
                if (index === 0) {
                    washed[0] = value;
                } else {
                    rand = Math.floor(Math.random() * (index + 1));
                    washed[index] = washed[rand];
                    washed[rand] = value;
                }
            }

            // First time when we set the deck it sends out a notification
            // since it wasn't set at all; subsequently it doesn't because
            // it doesn't recognize array differences.  Set it to silent and
            // manually notify (below) so we do the same thing every time.
            this.set('deck', washed, {silent:true});
            this.set('next_tile_index', 0);

            // Manual trigger because of array-comparison; setting to new
            // deck doesn't auto-trigger 'changed:deck'.
            if (!options || !options.silent)
                this.trigger('change:deck');
        },

        nextTileIndex: function() {
            var nextTileIndex = this.get('next_tile_index');
            if (nextTileIndex > 31) throw new Error("Too many tiles asked for");
            this.set('next_tile_index', nextTileIndex+1);
            return nextTileIndex;
        },

        tileOf: function(index) {
            var deck = this.get('deck');
            if (!deck) throw new Error("No tiles");
            if (index < 0 || index > 31) throw new Error("Tile index out of bounds");
            return deck[index];
        }
    });

    return PGDeckModel;
});
