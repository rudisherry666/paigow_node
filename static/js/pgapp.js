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
        // Create a player model that will communicate with the server about
        // the player specifics.
        var pgPlayerModel = new PGPlayerModel();

        // Create the views that show the player's name or other attributes in
        // various parts of the UI.
        var navPGPlayerNameView = new PGPlayerNameView({
            pgPlayerModel: pgPlayerModel,
            $el: $("#pglayer-name-nav")
        });
        navPGPlayerNameView.render();

        var signinView = new PGSigninView({
            pgPlayerModel: pgPlayerModel,
        });
    }

    return PGApp;
});
