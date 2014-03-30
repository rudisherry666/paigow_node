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
    'models/pgdealmodel'
],
function(
    Backbone,
    PGDealModel
) {
    
    var PGGameModel = Backbone.Model.extend({

        // Startup
        initialize: function(options) {
            this.set(this.defaults);

            this._addModelListeners();

            // There are always two dealModels.
            var dealOptions = { deckModel: options.pgDeckModel };
        },

        // A game is specific to a player.
        defaults: {
            'next_tile_index': 0,
            'player_score': 0,
            'opponent_score': 0,
            'opponent_name': "computer"
        },

        _addModelListeners: function() {
            this.on("change:player_score", function() { this.trigger("score:change"); });
            this.on("change:opponent_score", function() { this.trigger("score:change"); });
        },

        urlRoot: '/game',

    });

    return PGGameModel;
});
