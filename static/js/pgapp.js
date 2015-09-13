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
    'models/pgdeckmodel',
    'models/pggamemodel',
    'views/pggameview'
], function(
    PGPlayerModel,
    PGPlayerNameView,
    PGSigninView,
    PGDeckModel,
    PGGameModel,
    PGGameView) {

    function PGApp() {
        var pgGameView;
        function _newGame(e) {
            pgGameView.newGame(e);
        }
        function _onSignin(model, state) {
            var $gameView, $newGame;
            switch(state) {
                case 'signed-in':
                    if (!pgGameView) {
                        // The container where the game is played
                        $gameView = $('<div class="pggame"></div>');
                        $('.pg-game').append($gameView);
                        pgGameView = new PGGameView({
                            el: $gameView[0],
                            pgPlayerModel: pgPlayerModel,
                            pgDeckModel: pgDeckModel,
                            pgGameModel: pgGameModel
                        });
                        $newGame = $('#pg-new-game');
                    }

                    // Don't double-bind
                    $newGame.unbind('click', _newGame);
                    $newGame.bind('click', _newGame);
                break;

                case 'not-signed-in':
                    $newGame.unbind('click', _newGame);
                break;
            }
        }

        var defer = $.Deferred();

        // Create a player model that will communicate with the server about
        // the player specifics.
        var pgPlayerModel = new PGPlayerModel();
        pgPlayerModel.fetch({
            success: function() { console.log('success'); defer.resolve(); },
            error:   function() { console.log('error');   defer.reject();  }
        });

        pgPlayerModel.on('change:state', _onSignin);

        // Create a deck model that everyone will use.
        var pgDeckModel = new PGDeckModel();

        // Create a game model.  For now we don't fetch it.
        var pgGameModel = new PGGameModel({ pgDeckModel: pgDeckModel });

        // Create the views that show the player's name or other attributes in
        // various parts of the UI.
        defer.promise().done(function() {

            // The part of the nav bar where the name is shown
            var navPGPlayerNameView = new PGPlayerNameView({
                pgPlayerModel: pgPlayerModel,
                $el: $("#pglayer-name-nav")
            });
            navPGPlayerNameView.render();

            // Any button on the navbar removes the collapse.
            $(".collapse.navbar-collapse").click(function(e) {
              $(".collapse.navbar-collapse").removeClass("in");
            });

            // The sign-in view
            var signinView = new PGSigninView({
                el: $(".form-signin")[0],
                pgPlayerModel: pgPlayerModel
            });
            signinView.render();
        });
    }

    return PGApp;
});
