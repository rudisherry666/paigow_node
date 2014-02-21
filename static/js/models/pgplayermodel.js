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
            // Assume the worst: we don't know.
            this.set(this.defaults);

            // Fetch: maybe it will change.
            this.fetch();
        },

        defaults: {
            'username': 'unknown',
            'password': 'unknown'
        },

        urlRoot: '/player'

    });

    return PGPlayerModel;
});
