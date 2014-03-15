/*
*
* @class PGHandView
*
* This file controls the signing or register view on the main page.
*/

define(['backbone'], function(Backbone) {
    
    var PGHandView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            // View-based stuff.
            this._options = options;
            this._$el = options.$el;

            this._index = options.index;

            // Initialize all the models.
            this._handModel = options.handModel;

            // Listen for changes in the models.
            this._addModelListeners();
        },

        // Show our view when asked.
        render: function() {
            if (!this.renderedTemplate) {
                this.renderedTemplate = true;

                // Create a div for the hand, remembering the index so it's individually addressable.
                this._$hand = $(  '<div id="pghand-' + this._index + '" class="pghand">' +
                                    '<div class="pghand-tiles">' +
                                    '</div>' +
                                '</div>');
                this._$el.append(this._$hand);

                var $handTiles = this._$hand.children(".pghand-tiles");
                var tiles = this._handModel.get('tiles');
                for (var ti = 0; ti < 4; ti++) {
                    var $tile = $(  '<div class="pgtile">' +
                                        '<div class="pgdot pgdot-1"></div>' +
                                        '<div class="pgdot pgdot-2"></div>' +
                                        '<div class="pgdot pgdot-3"></div>' +
                                        '<div class="pgdot pgdot-4"></div>' +
                                        '<div class="pgdot pgdot-5"></div>' +
                                        '<div class="pgdot pgdot-6"></div>' +
                                        '<div class="pgdot pgdot-7"></div>' +
                                        '<div class="pgdot pgdot-8"></div>' +
                                        '<div class="pgdot pgdot-9"></div>' +
                                        '<div class="pgdot pgdot-10"></div>' +
                                        '<div class="pgdot pgdot-11"></div>' +
                                        '<div class="pgdot pgdot-12"></div>' +
                                        '<div class="pgdot pgdot-13"></div>' +
                                        '<div class="pgdot pgdot-14"></div>' +
                                        '<div class="pgdot pgdot-15"></div>' +
                                        '<div class="pgdot pgdot-16"></div>' +
                                        '<div class="pgdot pgdot-17"></div>' +
                                        '<div class="pgdot pgdot-18"></div>' +
                                        '<div class="pgdot pgdot-19"></div>' +
                                        '<div class="pgdot pgdot-20"></div>' +
                                    '</div>');
                    $handTiles.append($tile);
                }
            }
        },

        // Listen for changes
        _addModelListeners: function() {
            this._handModel.on("change:tiles",
                _.bind(function(e) { this._tilesChanged(); }, this));
        },

        _tilesChanged: function() {
            // Change the tile classes.
            var $tiles = this._$hand.find('.pgtile');
            var tiles = this._handModel.get('tiles');
            for (var ti = 0; ti < 4; ti++) {
                var tile = (tiles && tiles[ti]) || null;
                var divClass = (tile && tile.divClass()) || "";
                var $tile = $($tiles[ti]);
                $tile.removeClass();
                $tile.addClass('pgtile pgtile-' + this._index + '-' + ti + ' ' + divClass);
            }
        }

    });

    return PGHandView;
});
