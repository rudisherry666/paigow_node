/*
* @class pgapp
*
* Main class for the paigow app.
*
*/

define([
    'models/pgplayermodel',
    'views/pgplayernameview',
    'views/pgsigninview',
    'models/pggamemodel',
    'views/pggameview'
], function(
    PGPlayerModel,
    PGPlayerNameView,
    PGSigninView,
    PGGameModel,
    PGGameView) {

    function PGApp() {
        var defer = $.Deferred();

        // Create a player model that will communicate with the server about
        // the player specifics.
        var pgPlayerModel = new PGPlayerModel();
        pgPlayerModel.fetch({
            success: function() { console.log('success'); defer.resolve(); },
            error:   function() { console.log('error');   defer.reject();  }
        });

        // Create a game model.  For now we don't fetch it.
        var pgGameModel = new PGGameModel();

        // Create the views that show the player's name or other attributes in
        // various parts of the UI.
        defer.promise().done(function() {

            // The container where the game is played
            var pgGameView = new PGGameView({
                $el: $("#pg-game"),
                pgPlayerModel: pgPlayerModel,
                pgGameModel: pgGameModel
            });

            // The part of the nav bar where the name is shown
            var navPGPlayerNameView = new PGPlayerNameView({
                pgPlayerModel: pgPlayerModel,
                $el: $("#pglayer-name-nav")
            });
            navPGPlayerNameView.render();

            // The sign-in view
            var signinView = new PGSigninView({
                el: $(".form-signin"),
                pgPlayerModel: pgPlayerModel
            });
            signinView.render();
        });
    }

    return PGApp;
});
