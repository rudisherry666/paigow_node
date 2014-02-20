/*
*
* @class PGHandModel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define(['backbone'], function(Backbone) {
    
    var PGHandModel = Backbone.Model.extend({

        // Startup
        initialize: function() {
            this.set(this.defaults);
        },

        // A hand is specific to a player in a game, and is
        // some round in the game.
        defaults: {
            'tiles': [],
            'game': null,
            'round': -1,
            'player': null
        },

        urlRoot: '/hand'

    });

    return PGHandModel;
});
