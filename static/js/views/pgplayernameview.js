/*
*
* @class PGPlayerView
*
* This file defines the pgplayer js class on the client
*
* A single player corresponds to a person playing the game.
*/

define(['backbone'], function(Backbone) {
    
    var PGPlayerNameView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._addModelListeners();
        },

        // Add a span with the player's name
        render: function() {
            if (!this._nameSpan) {
                this._nameSpan = $('<span></span>');
                this._nameSpan.html(this._options.pgPlayerModel.get('username'));
                this._options.$el.append(this._nameSpan);
            }
        },

        // Listen for changes
        _addModelListeners: function() {
            this._options.pgPlayerModel.on("change:username", _.bind(function() {
                console.log("PGPlayerView: name changed!");
                if (this._nameSpan)
                    this._nameSpan.html(this._options.pgPlayerModel.get('username'));
            }, this));
        }


    });

    return PGPlayerNameView;
});
