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
    'models/pgdealmodel',
    'views/pgdealview'
], function(
    Backbone,
    _,
    PGTile,
    PGDealModel,
    PGDealView
) {
    
    var PGGameView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._playerModel = options.pgPlayerModel;
            this._deckModel = options.pgDeckModel;
            this._gameModel = options.pgGameModel;

            // Initialize all the models.
            this._playerDealModel = new PGDealModel({
                username: this._playerModel.get('username'),
                deckModel: this._deckModel
            });
            this._computerDealModel = new PGDealModel({
                username: this._playerModel.get('computer'),
                deckModel: this._deckModel,
                computer: true
            });

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
                var $game = this.$el;

                var $gameContents = $(this._gameTemplate);
                $game.append($gameContents);
                this._dealViews = [
                    new PGDealView({
                        el: $gameContents.find('.pgdeal')[0],
                        dealModel: this._playerDealModel,
                        deckModel: this._deckModel
                    }),
                    new PGDealView({
                        el: $gameContents.find('.pgdeal')[1],
                        dealModel: this._computerDealModel,
                        deckModel: this._deckModel,
                    })
                ];
            }
            _.each(this._dealViews, function(dealView) { dealView.render(); });
        },

        // Listen for changes
        _addModelListeners: function() {
            this._playerModel.on("change:state", _.bind(this._showOrHide, this));
            this._playerDealModel.on("change:state", _.bind(this._handleDealState, this));
        },

        _showOrHide: function() {
            if ((this._playerModel.get('state') === 'static') && (this._playerModel.get('username') !== "unknown")) {
            } else {
                this.$el.finish().fadeOut(500);
            }
        },

        _newGame: function() {
            this.$el.finish().fadeOut(500);
            this.render();

            var $game = $(".pggame");
            $game.find('.pgscore').remove();
            var score = _.template('<p class="pgscore"><%=playerName%>: <%=playerScore%> <%=opponentName%>: <%=opponentScore%></p>', {
                playerName: this._playerModel.get('username'),
                opponentName: this._gameModel.get('opponentName'),
                playerScore: this._gameModel.get('playerScore'),
                opponentScore: this._gameModel.get('opponentScore')
            });
            $game.prepend(score);

            this._deckModel.washTiles();
            this.$el.finish().fadeIn(500);
        },

        _handleDealState: function() {
            switch (this._playerDealModel.get('state')) {
                case 'thinking':
                case 'previewing':
                    $(".pg-opponent-deal").addClass("pg-hidden-hand");
                break;
                case 'finished':
                    this._computerDealModel.orderSets();
                    $(".pg-opponent-deal").removeClass("pg-hidden-hand");
                break;
            }
        },

        _gameTemplate:
                '<div>' +
                    '<div class="pgdeal pg-player-deal"></div>' +
                    '<div class="pgdeal pg-opponent-deal pg-hidden-hand"></div>' +
                '</div>'

    });

    return PGGameView;
});
