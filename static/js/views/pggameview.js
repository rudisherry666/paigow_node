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
                        deckModel: this._deckModel,
                        gameModel: this._gameModel
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
            this._gameModel.on("change:score", _.bind(this._updateScore, this));
            this._gameModel.on("change:state", _.bind(this._handleGameState, this));
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

            // Set the score.  Manually trigger a score change just in case the score
            // was already 0-0.  Unfortunately is no backbone option to force a trigger
            // even if the new value is the same as the last value.
            this._gameModel.set('player_score', 0);
            this._gameModel.set('opponent_score', 0);
            this._gameModel.trigger("change:score");

            this.$el.finish().fadeIn(500);
            this._newDeal();
        },

        _handleGameState: function() {
            if (this._gameModel.get('state') === "new_deal_asked_for") {
                // Signal from dealview to deal next tiles; makes sure the
                // computer tiles are un-previewed.
                this._dealViews[1].readyForNewDeal()
                    .then(_.bind(function() {
                        this._newDeal();
                    }, this)
                );
            }
        },

        _newDeal: function() {
            this._deckModel.washTiles();

            // We deal the tiles, start over.
            this._gameModel.set('state', "just_dealt");

            // Order the three hands (sets)
            this._dealViews[1].orderSets();
            this._computerDealModel.set('state', 'previewing');
        },

        _handleDealState: function() {
            switch (this._playerDealModel.get('state')) {

                case 'thinking':
                case 'previewing':
                    // Make sure the computer hand is hidden
                    $(".pg-opponent-deal").addClass("pg-hidden-hand");

                    // All point-nums back to normal.
                    this.$el.find('.pg-handpoints, .pghand').removeClass("pg-winner pg-loser pg-push");
                break;

                // The player has set their tiles
                case 'finished':

                    this._gameModel.set('state', "scoring");

                    // Show the computer hands
                    $(".pg-opponent-deal").removeClass("pg-hidden-hand");

                    // Set the score.

                    // All the handpoints: they go from player 321 to computer 321.
                    var $scoreNums = this.$el.find('.pg-handpoints');
                    var $hands = this.$el.find('.pghand');
                    var playerHands = this._playerDealModel.get('handmodels');
                    var computerHands = this._computerDealModel.get('handmodels');
                    for (var hi = 0; hi < 3; hi++) {
                        var points = 3 - hi;
                        var playerIndex = hi;
                        var computerIndex = hi + 3;
                        var playerSet = playerHands[hi].pgSet();
                        var computerSet = computerHands[hi].pgSet();
                        switch (playerSet.compare(computerSet)) {
                            case 1:   // player wins
                                $($hands[playerIndex]).addClass('pg-winner');
                                $($hands[computerIndex]).addClass('pg-loser');
                                $($scoreNums[playerIndex]).addClass('pg-winner');
                                $($scoreNums[computerIndex]).addClass('pg-loser');
                                this._gameModel.set('player_score', this._gameModel.get('player_score') + points);
                            break;

                            case 0:   // push
                                $($hands[playerIndex]).addClass('pg-push');
                                $($hands[computerIndex]).addClass('pg-push');
                                $($scoreNums[playerIndex]).addClass('pg-push');
                                $($scoreNums[computerIndex]).addClass('pg-push');
                            break;

                            case -1:  // computer wins
                                $($hands[computerIndex]).addClass('pg-winner');
                                $($hands[playerIndex]).addClass('pg-loser');
                                $($scoreNums[computerIndex]).addClass('pg-winner');
                                $($scoreNums[playerIndex]).addClass('pg-loser');
                                this._gameModel.set('opponent_score', this._gameModel.get('opponent_score') + points);
                            break;
                        }
                    }

                    // Test for finished game.
                    if (this._gameModel.get('player_score') >= 21 || this._gameModel.get('opponent_score') >= 21) {
                        // Game is finished.  User will have to pick new game.
                        this._gameModel.set('state', "finished");
                    } else {
                        // Still more to play.
                        this._gameModel.set('state', "ready_for_next_deal");
                    }
                break;
            }
        },

        _updateScore: function() {
            this.$el.find('.pg-player-name').text(this._playerModel.get('username'));
            this.$el.find('.pg-player-score').text(this._gameModel.get('player_score'));
            this.$el.find('.pg-opponent-name').text(this._gameModel.get('opponent_name'));
            this.$el.find('.pg-opponent-score').text(this._gameModel.get('opponent_score'));
        },

        _gameTemplate:
                '<div>' +
                    '<p class="pgscore"><span class="pg-player-name"></span>: <span class="pg-player-score"></span> <span class="pg-opponent-name"></span>: <span class="pg-opponent-score"></span></p>' +
                    '<div class="pgdeal pg-player-deal"></div>' +
                    '<div class="pgdeal pg-opponent-deal pg-hidden-hand"></div>' +
                '</div>'

    });

    return PGGameView;
});
