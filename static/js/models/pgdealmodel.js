/*
*
* @class PGDealModel
*
* This file defines the deal that a single player (or oppoenent) gets
*/

define([
    'underscore',
    'backbone',
    'models/pghandmodel'
],
function(
    _,
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

    });

    return PGDealModel;
});
