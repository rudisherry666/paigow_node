/*
*
* @class PGDealView
*
* This file controls what is seen for a single player's 3 hands.
*/

define([
    'backbone',
    'underscore',
    'classes/pgtile',
    'models/pghandmodel',
    'views/pghandview'
], function(
    Backbone,
    _,
    PGTile,
    PGHandModel,
    PGHandView
) {
    
    var PGDealView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._dealModel = options.dealModel;
            this._deckModel = options.deckModel;

            // Listen to the models for changes.
            this._addModelListeners();
        },

        events: {
            'click .pgswitchhands-btn': "_switchHands",
            'click .pg-deal-preview-hands': "_previewHands",
            'click .pg-deal-tiles-are-set': "_tilesAreSet",
        },


        // If there is no signin, then show the view.
        render: function() {
            if (!this.renderedTemplate) {
                this.renderedTemplate = true;
                var $deal = this.$el;

                // Get the contents of the deal from the template.
                var $hands = $(this._dealTemplate);
                $deal.append($hands);

                // There are three hands, each with a model.
                this._handViews = [];
                for (var hvi = 0; hvi < 3; hvi++) {
                    this._handViews.push(new PGHandView({
                        el: $deal.find('.pghand')[hvi],
                        handModel: this._dealModel.get('handmodels')[hvi],
                        index: hvi
                    }));
                }

                // The 'events' was parsed before we created our view; this call
                // reparse it to get the views we just created.
                this.delegateEvents();
            }
            _.each(this._handViews, function(handView) { handView.render(); });
        },

        // Listen for changes
        _addModelListeners: function() {
            // If the state changes as a result of clicking one of the buttons,
            // update the state of the buttons.
            this._dealModel.on('change:state',
                _.bind(function() {
                    switch (this._dealModel.get('state')) {
                        case "thinking":
                            $('.pg-deal-preview-hands').removeAttr('disabled');
                            $('.pg-deal-tiles-are-set').attr('disabled', "disabled");
                        break;
                        case "previewing":
                            $('.pg-deal-preview-hands').attr('disabled', "disabled");
                            $('.pg-deal-tiles-are-set').removeAttr('disabled');
                        break;
                        case "finished":
                            $('.pg-deal-buttons button').attr('disabled', "disabled");
                        break;
                    }
                }, this)
            );

            // If any of the handmodel states change, make sure we're in "thinking".
            this._dealModel.get('handmodels').forEach(
                _.bind(function(handModel) {
                    handModel.on('change:tiles',
                        _.bind(function() {
                            this._dealModel.set('state', "thinking");
                        }, this)
                    );
                }, this)
            );

            // If the state changes to "previewing", order the tiles
            this.on('change:state',
                _.bind(function() { this._checkPreview(this.previous('state')); }, this));

        },

        _switchHands: function(e) {
            var whichHand = parseInt($(e.target).attr('data-handindex'), 10);
            var handModels = this._dealModel.get('handmodels');
            var modelOne = handModels[whichHand];
            var modelTwo = handModels[whichHand+1];
            var tilesOne = modelOne.get('tileindexes');
            var tilesTwo = modelTwo.get('tileindexes');
            modelOne.set('tileindexes', tilesTwo);
            modelTwo.set('tileindexes', tilesOne);
        },

        _dealTemplate:
            '<div class="pg-deal-buttons">' +
                '<div><button type="button" class="pg-deal-preview-hands btn btn-primary btn-sm">Preview hands</button></div>' +
                '<div><button type="button" class="pg-deal-tiles-are-set btn btn-primary btn-sm">Tiles are set</button></div>' +
            '</div>' +
            '<div class="pg-deal-hands">' +
                '<span class="pg-handpoints pg-handpoints-3">3</span>' +
                '<div id="pghand-0" class="pghand"></div>' +
                '<span class="pg-handpoints pg-handpoints-2">2</span>' +
                '<div id="pghand-1" class="pghand"></div>' +
                '<span data-handindex="0" class="pgtexticon pgswitchhands-btn pgswitchhands-0-btn">&#59215;</span>' +
                '<span class="pg-handpoints pg-handpoints-1">1</span>' +
                '<div id="pghand-2" class="pghand"></div>' +
                '<span data-handindex="1" class="pgtexticon pgswitchhands-btn pgswitchhands-1-btn">&#59215;</span>' +
            '</div>',

        _previewHands: function(e) {
            var newState = this._dealModel.get('state');
            switch(newState) {
                case "thinking":
                    newState = "previewing";
                    this._dealModel.get('handmodels').forEach(function(handModel) {
                        handModel.orderTiles();
                    });
                break;
                case "previewing":
                    newState = "thinking";
                break;
            }
            this._dealModel.set('state', newState);
        },

        _tilesAreSet: function(e) {

        }


    });

    return PGDealView;
});
