/*
* @class pgapp
*
* Main class for the paigow app.
*
*/

define([
    'models/pgplayermodel',
    'views/pgplayernameview',
    'views/pgsigninview'
], function(
    PGPlayerModel,
    PGPlayerNameView,
    PGSigninView) {

    function PGApp() {
        var defer = $.Deferred();

        // Create a player model that will communicate with the server about
        // the player specifics.
        var pgPlayerModel = new PGPlayerModel();
        pgPlayerModel.fetch({
            success: function() { console.log('success'); defer.resolve(); },
            error:   function() { console.log('error');   defer.reject();  }
        });

        // Create the views that show the player's name or other attributes in
        // various parts of the UI.
        defer.promise().done(function() {
            console.log('done');
            var navPGPlayerNameView = new PGPlayerNameView({
                pgPlayerModel: pgPlayerModel,
                $el: $("#pglayer-name-nav")
            });
            navPGPlayerNameView.render();

            var signinView = new PGSigninView({
                el: $(".form-signin"),
                pgPlayerModel: pgPlayerModel,
            });
            signinView.render();
        });
    }

    return PGApp;
});
