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
        initialize: function(options) {
            this._deckModel = options.deckModel;
            this.set(this.defaults);

            this._addModelListeners();

            // Get all the tile indexes.  These don't change, but when the
            // deck is shuffled we re-get the tile at that index.
            this._tileIndexes = [];
            for (var ti = 0; ti < 4; ti++)
                this._tileIndexes.push(this._deckModel.nextTileIndex());
        },

        // A hand is specific to a player in a game, and is
        // some round in the game.
        defaults: {
            'tiles': [],
            'points': 0
        },

        urlRoot: '/hand',

        _addModelListeners: function() {
            // If the deck is changed, our tiles should be re-initialized.
            this._deckModel.on('change:deck',
                _.bind(function() {
                    var tiles = [
                        this._deckModel.tileOf(this._tileIndexes[0]),
                        this._deckModel.tileOf(this._tileIndexes[1]),
                        this._deckModel.tileOf(this._tileIndexes[2]),
                        this._deckModel.tileOf(this._tileIndexes[3])
                    ];
                    this.set('tiles', tiles);
                    this.trigger('change:tiles');
                }, this));
        }

    });

    return PGHandModel;
});
