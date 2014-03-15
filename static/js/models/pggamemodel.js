/*
*
* @class PGGameModel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define(['backbone'], function(Backbone) {
    
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
            'player_score': 0,
            'opponent_score': 0,
            'opponent_name': "computer"
        },

        urlRoot: '/game'

    });

    return PGGameModel;
});
