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
            'click .nav-tabs li a': function(e) { this._hideError(); }
        },

        // If there is no signin, then show the view.
        render: function() {
            if (!this._everRendered) {
                this._everRendered = true;

                // Initialize the tabs
                $("#pgsignin-tabs").tabs();
            }
            this._showOrHide();
        },

        // Listen for changes: show or hide the form depending on whether
        // or not there is a user (name === "unknown" is the trigger)
        _addModelListeners: function() {
            this._options.pgPlayerModel.on("change:username", _.bind(this._showOrHide, this));
        },

        _showOrHide: function() {
            this._isShowing = (this._options.pgPlayerModel.get('username') === "unknown");
            if (this._isShowing) {
                $(".form-signin").fadeIn(500);
            } else
                $(".form-signin").fadeOut(500);
        },

        _onSignin: function(e) {
            this._hideError();

            var name = $("#pgsignin-signin-name").val();
            if (!name) {
                return this._onError("Username is required!");
            }
            var password = $("#pgsignin-signin-password").val();
            if (!password) {
                return this._onError("Password is required!");
            }
            console.log("signin!");
        },

        _onRegister: function(e) {
            this._hideError();

            var username = $("#pgsignin-register-name").val();
            if (!username) {
                return this._onError("Username is required!");
            }
            var password = $("#pgsignin-register-password").val();
            if (!password) {
                return this._onError("Password is required!");
            }
            var passwordVerify = $("#pgsignin-register-password-verify").val();
            if (!passwordVerify) {
                return this._onError("Password verification is required!");
            }
            if (passwordVerify != password) {
                return this._onError("Passwords don't match!");
            }
            this._options.pgPlayerModel.set({
                username: username,
                password: password
            });
            this._options.pgPlayerModel.save();
        },

        _onError: function(err) {
            $("#pgsignin-error-message").text(err);
            $("#pgsignin-error-message").css("visibility", "visible");
        },

        _hideError: function() {
            $("#pgsignin-error-message").css('visibility', "hidden");            
        }

    });

    return PGSigninView;
});
