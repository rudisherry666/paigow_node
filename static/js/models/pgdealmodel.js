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
            var handOptions = { deckModel: options.deckModel };
            this.set('handModels', [
                new PGHandModel(handOptions),
                new PGHandModel(handOptions),
                new PGHandModel(handOptions)
            ]);
        },

        defaults: {
            'username': "unknown"
        },

        urlRoot: '/deal',

    });

    return PGDealModel;
});
