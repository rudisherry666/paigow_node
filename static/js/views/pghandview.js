/*
*
* @class PGHandView
*
* This file controls the signing or register view on the main page.
*/

define([
    'backbone',
    'classes/pghand'
], function(
    Backbone,
    PGHand
) {
    
    var PGHandView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            // View-based stuff.
            this._options = options;

            this._index = options.index;

            // Initialize all the models.
            this._handModel = options.handModel;

            // Listen for changes in the models.
            this._addModelListeners();
        },

        events: {
            'click .pgswitchtiles-btn': "_rearrange"
        },

        // Show our view when asked.
        render: function() {
            if (!this.renderedTemplate) {
                this.renderedTemplate = true;

                // We're given the hand div.
                this._$hand = this.$el;

                var $handTiles = $('<div class="pghand-tiles"></div>');
                this._$hand.append($handTiles);

                // Add the rearrange button.
                $handTiles.append('<span class="pgtexticon pgswitchtiles-btn">&#128257;</span>');

                // Add the tiles divs.  All dots are defined; the CSS will show only the
                // apprpropriate ones given the pgtile class, which comse from the tile it is.
                for (var di = 0; di < 2; di++) {
                    var $2tile = $('<div class="pg2tile"></div>');
                    $handTiles.append($2tile);
                    var $tileBlock = $('<div></div>');
                    $2tile.append($tileBlock);
                    for (var ti = 0; ti < 2; ti++) {
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
                        $tileBlock.append($tile);
                    }
                    $2tile.append('<span class="pg2tile-label"></span>');
                    if (di === 0)
                        $handTiles.append('<div class="pgtile-spacer"></div>');
                }
                this.delegateEvents();
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

            // Update the label.
            var $labels = this._$hand.find('.pg2tile-label');
            var highHand = new PGHand(tiles[0], tiles[1]);
            var lowHand = new PGHand(tiles[2], tiles[3]);
            $($labels[0]).text(highHand.name());
            $($labels[1]).text(lowHand.name());
        },

        _rearrange: function(e) {
            // Switch around our hand's tiles: third tile goes second,
            // fourth goes third, second goes fourth.
            var tiles = this._handModel.get('tiles');
            this._handModel.set('tiles', [ tiles[0], tiles[2], tiles[3], tiles[1] ]);
            this._tilesChanged();
        }

    });

    return PGHandView;
});
