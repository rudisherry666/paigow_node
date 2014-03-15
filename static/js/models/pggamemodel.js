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

            // There are always two dealModels.
            var dealOptions = { deckModel: options.pgDeckModel };
        },

        // A game is specific to a player.
        defaults: {
            'nextTileIndex': 0,
            'playerScore': 0,
            'opponentScore': 0,
            'opponentName': "computer"
        },

        urlRoot: '/game',

    });

    return PGGameModel;
});
