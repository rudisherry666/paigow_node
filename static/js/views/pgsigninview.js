/*
*
* @class PGSigninView
*
* This file controls the signing or register view on the main page.
*/

define(['bootstrap', 'backbone', 'jquery-ui'], function(Bootstrap, Backbone) {
    
    var PGSigninView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._options = options;
            this._addModelListeners();
        },

        events: {
            'click #pgsignin-signin': "_onSignin",
            'click #pgsignin-register': "_onRegister",
        },

        // If there is no signin, then show the view.
        render: function() {
            if (this._options.pgPlayerModel.get('name') === "unknown" && !this._isShowing) {
                this._isShowing = true;
                $(".form-signin").fadeIn(500);

                // Initialize the tabs
                $("#pgsignin-tabs").tabs();
            }
        },

        // Listen for changes: show or hide the form depending on whether
        // or not there is a user (name === "unknown" is the trigger)
        _addModelListeners: function() {
            this._options.pgPlayerModel.on("change:name", _.bind(function() {
                this._isShowing = (this._options.pgPlayerModel.get('name') === "unknown");
                if (this._isShowing)
                    $(".form-signin").fadeIn(500);
                else
                    $(".form-signin").fadeOut(500);
            }, this));
        },

        _onSignin: function(e) {
            var email = $("#pgsignin-signin-email").val();
            if (!email) {

            }
            var password = $("#pgsignin-signin-password").val();
            if (!password) {

            }
            console.log("signin!");
        },

        _onRegister: function(e) {
            var email = $("#pgsignin-register-email").val();
            if (!email) {

            }
            var password = $("#pgsignin-register-password").val();
            if (!password) {
                
            }
            var passwordVerify = $("#pgsignin-register-password-verify").val();
            if (!passwordVerify) {
                
            }
            if (passwordVerify != password) {
                
            }
            console.log("register!");
        }

    });

    return PGSigninView;
});
