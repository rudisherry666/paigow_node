/*
*
* @class pgplayermodel
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define(['backbone'], function(Backbone) {
    
    var PGPlayerModel = Backbone.Model.extend({

        // Startup
        initialize: function() {
            this.set(this.defaults);
        },

        defaults: {
            'name': 'unknown',
            'email': 'unknown'
        },

        urlRoot: '/player'

    });

    return PGPlayerModel;
});
