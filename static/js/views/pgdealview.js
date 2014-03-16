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

        // If there is no signin, then show the view.
        render: function() {
            if (!this.renderedTemplate) {
                this.renderedTemplate = true;
                var $deal = $('<div class="pgdeal"></div>');
                this.$el.append($deal);

                // There are three hands, each with a model.
                this._handViews = [];
                for (var hvi = 0; hvi < 3; hvi++) {
                    var $handEl = $('<div id="pghand-' + hvi + '" class="pghand">');
                    $deal.append($handEl);
                    this._handViews.push(new PGHandView({
                        el: $handEl[0],
                        handModel: this._dealModel.get('handModels')[hvi],
                        index: hvi
                    }));
                }
            }
            _.each(this._handViews, function(handView) { handView.render(); });
        },

        // Listen for changes
        _addModelListeners: function() {
        },

    });

    return PGDealView;
});
