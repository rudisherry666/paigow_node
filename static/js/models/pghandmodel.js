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
            var tileIndexes = [];
            for (var ti = 0; ti < 4; ti++)
                tileIndexes.push(this._deckModel.nextTileIndex());

            // Set the indexes but during initialization we don't want
            // to trigger anything: that happens when the deck is washed.
            this.set('tileindexes', tileIndexes, {silent: true});
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
                _.bind(function() { this._resetTiles(); }, this));

            // If tile indexes are changed, reset the tieles
            this.on('change:tileindexes',
                _.bind(function() { this._resetTiles(); }, this));
        },

        _resetTiles: function() {
            var tileIndexes = this.get('tileindexes');
            var tiles = [
                this._deckModel.tileOf(tileIndexes[0]),
                this._deckModel.tileOf(tileIndexes[1]),
                this._deckModel.tileOf(tileIndexes[2]),
                this._deckModel.tileOf(tileIndexes[3])
            ];
            this.set('tiles', tiles);
            this.trigger('change:tiles');
        }

    });

    return PGHandModel;
});
