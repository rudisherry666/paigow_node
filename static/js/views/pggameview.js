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
    'models/pghandmodel'
], function(
    Backbone,
    _,
    PGTile,
    PGHandModel
) {
    
    var PGGameView = Backbone.View.extend({

        // Startup
        initialize: function(options) {
            this._pgPlayerModel = options.pgPlayerModel;
            this._pgGameModel = options.pgGameModel;
            this._$el = options.$el;
            this._addModelListeners();

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
                this._$el.html('<div class="pggame"></div>');
            }
        },

        // Listen for changes
        _addModelListeners: function() {
            this._pgPlayerModel.on("change:state", _.bind(this._showOrHide, this));
        },

        _showOrHide: function() {
            if ((this._pgPlayerModel.get('state') === 'static') && (this._pgPlayerModel.get('username') !== "unknown")) {
                this._$el.finish().fadeIn(500);
                this.render();
            } else {
                this._$el.finish().fadeOut(500);
            }
        },

        _newGame: function() {
            this._washTiles();

            var $game = $(".pggame");
            $game.empty();
            var score = _.template('<h2 class="pgscore"><%=player_name%>: <%=player_score%> <%=opponent_name%>: <%=opponent_score%></h2>', {
                player_name: this._pgPlayerModel.get('username'),
                opponent_name: this._pgGameModel.get('opponent_name'),
                player_score: this._pgGameModel.get('player_score'),
                opponent_score: this._pgGameModel.get('opponent_score')
            });
            $game.append(score);

            var hands = this._pgGameModel.get('hands');
            for (var hi = 1; hi <= 3; hi++) {
                if (!hands[hi-1]) hands[hi-1] = [];
                var hand = hands[hi-1];
                var $hand = $(  '<div id="pghand-' + hi + '" class="pghand">' +
                                    '<div class="pghand-tiles">' +
                                    '</div>' +
                                '</div>');

                var $handTiles = $hand.children(".pghand-tiles");
                for (var ti = 0; ti < 4; ti++) {
                    hand[ti] = this._dealNextTile();
                    var $tile = $(  '<div class="pgtile pgtile-' + hi + '-' + ti + ' ' + hand[ti].divClass() + '">' +
                                        '<div class="pgdot pgdot-1"></div>' +
                                        '<div class="pgdot pgdot-2"></div>' +
                                        '<div class="pgdot pgdot-3"></div>' +
                                        '<div class="pgdot pgdot-4"></div>' +
                                        '<div class="pgdot pgdot-5"></div>' +
                                        '<div class="pgdot pgdot-6"></div>' +
                                        '<div class="pgdot pgdot-7"></div>' +
                                        '<div class="pgdot pgdot-8"></div>' +
                                        '<div class="pgdot pgdot-9"></div>' +
                                        '<div class="pgdot pgdot-10"></div>' +
                                        '<div class="pgdot pgdot-11"></div>' +
                                        '<div class="pgdot pgdot-12"></div>' +
                                        '<div class="pgdot pgdot-13"></div>' +
                                        '<div class="pgdot pgdot-14"></div>' +
                                        '<div class="pgdot pgdot-15"></div>' +
                                        '<div class="pgdot pgdot-16"></div>' +
                                        '<div class="pgdot pgdot-17"></div>' +
                                        '<div class="pgdot pgdot-18"></div>' +
                                        '<div class="pgdot pgdot-19"></div>' +
                                        '<div class="pgdot pgdot-20"></div>' +
                                    '</div>');
                    $handTiles.append($tile);
                }

                $game.append($hand);
            }
        },

        // Shuffle an array.
        _washTiles: function() {
            var obj = PGTile.prototype.deck();
            var washed = [], rand;
            for (var index = 0; index < obj.length; index++) {
                value = obj[index];
                if (index === 0) {
                    washed[0] = value;
                } else {
                    rand = Math.floor(Math.random() * (index + 1));
                    washed[index] = washed[rand];
                    washed[rand] = value;
                }
            }
            this._pgGameModel.set('deck', washed);
            this._pgGameModel.set('nextTile', 0);
        },

        _dealNextTile: function() {
            var deck = this._pgGameModel.get('deck');
            if (!deck) throw new Error("No tiles");
            var nextTile = this._pgGameModel.get('nextTile');
            if (nextTile > 31) throw new Error("No nore tiles");
            var tile = deck[nextTile];
            nextTile++;
            this._pgGameModel.set('nextTile', nextTile);
            return tile;
        }

    });

    return PGGameView;
});
