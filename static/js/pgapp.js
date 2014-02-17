/*
* @class pgapp
*
* Main class for the paigow app.
*
*/

define(['models/pgplayermodel', 'views/pgplayernameview'], function(PGPlayerModel, PGPlayerNameView) {

    function PGApp() {
        // Create a player model that will communicate with the server about
        // the player specifics.
        var pgPlayerModel = new PGPlayerModel();

        // Create the views that show the player's name or other attributes in
        // various parts of the UI.
        var navPGPlayerNameView = new PGPlayerNameView({
            model: pgPlayerModel,
            $el: $("#pglayer-name-nav")
        });
        navPGPlayerNameView.render();
    }

    return PGApp;
});
