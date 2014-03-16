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
            this._dealModel = options.dealModel;
            this._deckModel = options.deckModel;

            // Listen to the models for changes.
            this._addModelListeners();
        },

        events: {
            'click .pgswitchhands-btn': "_switchHands"
        },


        // If there is no signin, then show the view.
        render: function() {
            if (!this.renderedTemplate) {
                this.renderedTemplate = true;
                var $deal = this.$el;

                // There are three hands, each with a model.
                this._handViews = [];
                for (var hvi = 0; hvi < 3; hvi++) {
                    var $pointsEl = $('<span class="pg-handpoints pg-handpoints-' + (3-hvi) + '">' + (3-hvi) + '</span>');
                    $deal.append($pointsEl);
                    var $handEl = $('<div id="pghand-' + hvi + '" class="pghand">');
                    $deal.append($handEl);
                    this._handViews.push(new PGHandView({
                        el: $handEl[0],
                        handModel: this._dealModel.get('handModels')[hvi],
                        index: hvi
                    }));
                    if (hvi < 2)
                        $deal.append('<span data-handindex="' + hvi + '" class="pgtexticon pgswitchhands-btn pgswitchhands-' + hvi + '-btn">&#59215;</span>');
                }

                // The 'events' was parsed before we created our view; this call
                // reparse it to get the views we just created.
                this.delegateEvents();
            }
            _.each(this._handViews, function(handView) { handView.render(); });
        },

        // Listen for changes
        _addModelListeners: function() {
        },

        _switchHands: function(e) {
            var whichHand = parseInt($(e.target).attr('data-handindex'), 10);
            var handModels = this._dealModel.get('handModels');
            var modelOne = handModels[whichHand];
            var modelTwo = handModels[whichHand+1];
            var tilesOne = modelOne.get('tileindexes');
            var tilesTwo = modelTwo.get('tileindexes');
            modelOne.set('tileindexes', tilesTwo);
            modelTwo.set('tileindexes', tilesOne);
        },

    });

    return PGDealView;
});
