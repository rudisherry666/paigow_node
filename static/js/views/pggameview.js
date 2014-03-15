/*
*
* @class PGGameView
*
* This file controls the overall page
*/

define([
    'backbone',
    'underscore',
    'classes/pgtile',
    'models/pghandmodel',
    'views/pghandview'
], function(
    Backbone,
    _,
    PGTile,
    PGHandModel,
    PGHandView
) {
    
    var PGGameView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._$el = options.$el;

            this._playerModel = options.pgPlayerModel;
            this._gameModel = options.pgGameModel;

            // Initialize all the models.
            this._handModels = [];
            for (var hmi = 0; hmi < 3; hmi++) {
                var handModel = new PGHandModel();
                this._handModels.push(handModel);
            }

            // Listen to the models for changes.
            this._addModelListeners();

            // This is not inside our view so we use the old-style
            // jquery for that.
            // TODO: have the button in the app or navbar and change
            // the game model in some way.
            $('#pg-new-game').click(
                _.bind(function(e) {
                    this._newGame();
                }, this)
            );
        },

        // If there is no signin, then show the view.
        render: function() {
            if (!this.renderedTemplate) {
                this.renderedTemplate = true;
                var $game = $('<div class="pggame"></div>');
                this._$el.append($game);

                this._handViews = [];
                for (var hvi = 0; hvi < 3; hvi++) {
                    this._handViews.push(new PGHandView({
                        $el: $game,
                        handModel: this._handModels[hvi],
                        index: hvi
                    }));
                }
            }
            _.each(this._handViews, function(handView) { handView.render(); });
        },

        // Listen for changes
        _addModelListeners: function() {
            this._playerModel.on("change:state", _.bind(this._showOrHide, this));
        },

        _showOrHide: function() {
            if ((this._playerModel.get('state') === 'static') && (this._playerModel.get('username') !== "unknown")) {
            } else {
                this._$el.finish().fadeOut(500);
            }
        },

        _newGame: function() {
            this.render();
            this._$el.finish().fadeIn(500);
            this._gameModel._washTiles();

            var $game = $(".pggame");
            $game.find('.pgscore').remove();
            var score = _.template('<h2 class="pgscore"><%=playerName%>: <%=playerScore%> <%=opponentName%>: <%=opponentScore%></h2>', {
                playerName: this._playerModel.get('username'),
                opponentName: this._gameModel.get('opponentName'),
                playerScore: this._gameModel.get('playerScore'),
                opponentScore: this._gameModel.get('opponentScore')
            });
            $game.prepend(score);

            var hands = this._gameModel.get('hands');
            for (var hi = 1; hi <= 3; hi++) {
                var hand = hands[hi-1];
                for (var ti = 0; ti < 4; ti++) {
                    hand[ti] = this._gameModel._dealNextTile();
                }
                // We have to manually trigger the change event because the old and new
                // values are 4-long arrays of PGTile and _.isEqual() returns true for
                // equal, so backbone doesn't think anything changed.
                this._handModels[hi-1].set('tiles', hand);
                this._handModels[hi-1].trigger('change:tiles');
            }
        },

    });

    return PGGameView;
});
