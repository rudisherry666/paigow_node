/*
*
* @class PGDealModel
*
* This file defines the deal that a single player (or oppoenent) gets
*/

define([
    'backbone',
    'models/pghandmodel'
],
function(
    Backbone,
    PGHandModel
) {
    
    var PGDealModel = Backbone.Model.extend({

        // Startup
        initialize: function(options) {
            this.set(this.defaults);
            this._deckModel = options.deckModel;

            // Create the three handmodels underlying this dealModel.
            var handOptions = { deckModel: options.deckModel };
            this.set('handmodels', [
                new PGHandModel(handOptions),
                new PGHandModel(handOptions),
                new PGHandModel(handOptions)
            ]);

            this._addModelListeners();

            if (options.computer) {
                _.each(this.get('handmodels'), function(model) {
                    model.on('change:tiles', function() {
                        model.orderTiles();
                    });
                });
            }
        },

        defaults: {
            'username': "unknown",
            'state': "thinking",
            'computer': false
        },


        _addModelListeners: function() {
        },

        orderSets: function() {
            var handModels = this.get('handmodels');
            var sets = [
                handModels[0].pgSet(),
                handModels[1].pgSet(),
                handModels[2].pgSet()
            ];
            var sads = [
                sets[0].sumAndDiff().sum,
                sets[1].sumAndDiff().sum,
                sets[2].sumAndDiff().sum
            ];
            if (sads[0] < sads[1]) {

            }
        },

        urlRoot: '/deal',

    });

    return PGDealModel;
});
