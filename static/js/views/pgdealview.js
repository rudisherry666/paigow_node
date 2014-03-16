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

                // Get the contents of the deal from the template.
                var $hands = $(this._dealTemplate);
                $deal.append($hands);

                // There are three hands, each with a model.
                this._handViews = [];
                for (var hvi = 0; hvi < 3; hvi++) {
                    this._handViews.push(new PGHandView({
                        el: $deal.find('.pghand')[hvi],
                        handModel: this._dealModel.get('handModels')[hvi],
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

        _dealTemplate:
            '<span class="pg-handpoints pg-handpoints-3">3</span>' +
            '<div id="pghand-0" class="pghand"></div>' +
            '<span data-handindex="0" class="pgtexticon pgswitchhands-btn pgswitchhands-0-btn">&#59215;</span>' +
            '<span class="pg-handpoints pg-handpoints-2">2</span>' +
            '<div id="pghand-1" class="pghand"></div>' +
            '<span data-handindex="0" class="pgtexticon pgswitchhands-btn pgswitchhands-1-btn">&#59215;</span>' +
            '<span class="pg-handpoints pg-handpoints-1">1</span>' +
            '<div id="pghand-2" class="pghand"></div>'


    });

    return PGDealView;
});
