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
        },

        defaults: {
            'username': "unknown",
            'state': "thinking"
        },


        _addModelListeners: function() {
        },

        urlRoot: '/deal',

    });

    return PGDealModel;
});
