/*
*
* @class PGHandView
*
* This file controls the signing or register view on the main page.
*/

define([
    'backbone',
    'classes/pghand',
    'utils/pgbrowserutils'
], function(
    Backbone,
    PGHand,
    PGBrowserUtils
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
            'click .rotatetiles-btn': "_rotateTiles"
        },

        // Show our view when asked.
        render: function() {
            if (!this.renderedTemplate) {
                this.renderedTemplate = true;

                // We're given the hand div.
                this._$hand = this.$el;

                // Create the overall hand from the templat.
                var $handTiles = $(this._handTemplate);
                this._$hand.append($handTiles);

                // The 'events' was parsed before we created our view; this call
                // reparse it to get the views we just created.
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

        _rotateTiles: function(e) {
            // Switch around our hand's tiles: third tile goes second,
            // fourth goes third, second goes fourth.
            var tileIndexes = this._handModel.get('tile_indexes');
            this._handModel.set('tile_indexes', [ tileIndexes[0], tileIndexes[2], tileIndexes[3], tileIndexes[1] ]);
            this._tilesChanged();
        },

        previewHand: function() {
            this._handModel.previewTiles();
            if (this._handModel.get('preview_state') !== 'previewed') {
                this._handModel.set('preview_state', 'previewed');
                var twoTile = this._$hand.find('.pg2tile>div')[1];
                return PGBrowserUtils.animateRotate($(twoTile), 0, 90);
            } else
                return PGBrowserUtils.resolvedDefer;
        },

        unpreviewHand: function() {
            if (this._handModel.get('preview_state') === 'previewed') {
                this._handModel.set('preview_state', 'unpreviewed');
                var twoTile = this._$hand.find('.pg2tile>div')[1];
                return PGBrowserUtils.animateRotate($(twoTile), 90, 0);
            } else
                return PGBrowserUtils.resolvedDefer;
        },

        _handTemplate:
            '<div class="pghand-tiles">' +
                '<span class="pg-tile-manipulate-control pgtexticon rotatetiles-btn">&#10226;</span>' +
                '<div class="pg2tile">' +
                    '<div>' +
                        '<div class="pgtile">' +
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
                        '</div>' +
                        '<div class="pgtile">' +
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
                        '</div>' +
                    '</div>' +
                    '<span class="pg2tile-label"></span>' +
                '</div>' +
                '<div class="pgtile-spacer"></div>' +
                '<div class="pg2tile">' +
                    '<div>' +
                        '<div class="pgtile">' +
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
                        '</div>' +
                        '<div class="pgtile">' +
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
                        '</div>' +
                    '</div>' +
                    '<span class="pg2tile-label"></span>' +
                '</div>' +
            '</div>'

    });

    return PGHandView;
});
