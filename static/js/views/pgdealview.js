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
            this._$el = options.$el;

            this._pgPlayerModel = options.pgPlayerModel;
            this._pgGameModel = options.pgGameModel;

            // Initialize all the models.
            this._handModels = [];
            for (var hmi = 0; hmi < 3; hmi++) {
                var handModel = new PGHandModel();
                this._handModels.push(handModel);
            }

            // Listen to the models for changes.
            this._addModelListeners();
        },

        // If there is no signin, then show the view.
        render: function() {
            if (!this.renderedTemplate) {
                this.renderedTemplate = true;
                var $deal = $('<div class="pgdeal"></div>');
                this._$el.append($deal);

                // There are three hands, each with a model.
                this._handViews = [];
                for (var hvi = 0; hvi < 3; hvi++) {
                    this._handViews.push(new PGHandView({
                        $el: $game,
                        handModel: this._handModels[hvi],
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
