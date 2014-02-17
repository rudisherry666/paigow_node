/*
*
* @class PGSigninView
*
* This file controls the signing or register view on the main page.
*/

define(['backbone'], function(Backbone) {
    
    var PGSigninView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._addModelListeners();
        },

        // If there is no signin, then show the view.
        render: function() {
            if (this._options.model.get('name') === "unknown" && !this._isShowing) {
                this._isShowing = true;
                $(".form-signin").fadeIn(500);
            }
        },

        // Listen for changes: show or hide the form depending on whether
        // or not there is a user (name === "unknown" is the trigger)
        _addModelListeners: function() {
            this._options.model.on("change:name", _.bind(function() {
                this._isShowing = (this._options.model.get('name') === "unknown");
                if (this._isShowing)
                    $(".form-signin").fadeIn(500);
                else
                    $(".form-signin").fadeOut(500);
            }, this));
        }


    });

    return PGSigninView;
});
