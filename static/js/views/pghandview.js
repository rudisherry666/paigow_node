/*
*
* @class PGHandView
*
* This file controls the signing or register view on the main page.
*/

define(['backbone'], function(Backbone) {
    
    var PGHandView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._addModelListeners();
        },

        // If there is no signin, then show the view.
        render: function() {
        },

        // Listen for changes
        _addModelListeners: function() {
        }

    });

    return PGHandView;
});
