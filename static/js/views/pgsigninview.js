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
            'click #pgsignin-signin'  : "_onSignin",
            'click #pgsignin-register': "_onRegister",
            'keyup'                   : "_onKeyUp",
            'click .nav-tabs li a'    : "_hideError"
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
            this._options.pgPlayerModel.on("change:state", _.bind(this._showOrHide, this));
        },

        _showOrHide: function() {
            if (this._options.pgPlayerModel.get('state') === 'static') {
                this._hideError();
                this._isShowing = (this._options.pgPlayerModel.get('username') === "unknown");
                if (this._isShowing) {
                    $(".form-signin").fadeIn(500, function() { $("#pgsignin-signin-name").focus(); });
                } else
                    $(".form-signin").fadeOut(500);
            } else {
                this._onError((this._options.pgPlayerModel.get('state') === 'signing-in') ? "Signing in..." : "Registering...");
            }
        },

        // Implementation of 'esc' and 'return' for submitting form, need to do
        // it manually because it's not really a form.
        _onKeyUp: function(e) {
            // Regardless of key, we don't do anything if it's working
            // om a signin or register.
            if (this._options.pgPlayerModel.get('state') === 'working')
                return;

            switch (e.keyCode) {
                case 13: // return: confirm the form: figure out which tab
                    var $tab = $('.nav-tabs li.active a');
                    var href = $tab.attr('href');
                    switch(href) {
                        case "#login"   : this._onSignin(e); break;
                        case "#register": this._onRegister(e); break;
                    }
                break;

                case 27: // esc: empty the form
                    $('.pgsignin-input').val("");
                break;
            }
        },

        _onSignin: function(e) {
            if (this._isSigningInOrRegistering()) return;
            $('body').removeClass('pg-user-not-signed-in').addClass('pg-user-signing-in');

            this._hideError();

            var username = $("#pgsignin-signin-name").val();
            if (!username) {
                return this._onError("Username is required!");
            }
            var password = $("#pgsignin-signin-password").val();
            if (!password) {
                return this._onError("Password is required!");
            }

            this._signInOrRegister('signing-in', username, password);
        },

        _onRegister: function(e) {
            if (this._isSigningInOrRegistering()) return;
            $('body').removeClass('pg-user-not-signed-in').addClass('pg-user-signing-in');

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

            this._signInOrRegister('registering', username, password);
        },

        _onError: function(err) {
            $("#pgsignin-error-message").text(err);
            $("#pgsignin-error-message").css("visibility", "visible");
        },

        _hideError: function() {
            $("#pgsignin-error-message").css('visibility', "hidden");
        },

        _isSigningInOrRegistering: function() {
            var $body = $('body');
            return $body.hasClass('signing-in');
        },

        _signInOrRegister: function(state, username, password) {
            this._options.pgPlayerModel.set({
                state: state,
                username: username,
                password: password
            });
            this._options.pgPlayerModel.save()
                .then(_.bind(function() {
                    this._options.pgPlayerModel.set('state', 'signed-in');
                    $('body').removeClass('pg-user-signing-in').addClass('pg-user-signed-in');
                }, this))
                .fail(_.bind(function() {
                    this._options.pgPlayerModel.set('state', 'not-signed-in');
                    $('body').removeClass('pg-user-signing-in').addClass('pg-user-not-signed-in');
                }, this));
        }

    });

    return PGSigninView;
});
