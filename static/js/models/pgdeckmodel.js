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
        },

        defaults: {
            'nextTileIndex': 0
        },

        // Shuffle an array.
        washTiles: function() {
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
            this.set('deck', washed);
            this.set('nextTileIndex', 0);

            // Manual trigger because of array-comparison; setting to new
            // deck doesn't auto-trigger 'changed:deck'.
            this.trigger('changed:deck');
        },

        nextTileIndex: function() {
            var nextTileIndex = this.get('nextTileIndex');
            if (nextTileIndex > 31) throw new Error("Too many tiles asked for");
            this.set('nextTileIndex', nextTileIndex+1);
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
