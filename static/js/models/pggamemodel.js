/*
*
* @class PGGameModel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define([
    'backbone',
    '../classes/pgtile'
],
function(
    Backbone,
    PTGile
) {
    
    var PGGameModel = Backbone.Model.extend({

        // Startup
        initialize: function() {
            this.set(this.defaults);
        },

        // A game is specific to a player.
        defaults: {
            'hands': [
                [],
                [],
                []
            ],
            'nextTileIndex': 0,
            'playerScore': 0,
            'opponentScore': 0,
            'opponentName': "computer"
        },

        urlRoot: '/game',

        // Shuffle an array.
        _washTiles: function() {
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
        },

        _dealNextTile: function() {
            var deck = this.get('deck');
            if (!deck) throw new Error("No tiles");
            var nextTileIndex = this.get('nextTileIndex');
            if (nextTileIndex > 31) throw new Error("No more tiles");
            var tile = deck[nextTileIndex];
            this.set('nextTileIndex', nextTileIndex+1);
            return tile;
        }

    });

    return PGGameModel;
});
