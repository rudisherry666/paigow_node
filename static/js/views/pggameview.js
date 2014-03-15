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

            this._pgPlayerModel = options.pgPlayerModel;
            this._pgGameModel = options.pgGameModel;

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
            this._pgPlayerModel.on("change:state", _.bind(this._showOrHide, this));
        },

        _showOrHide: function() {
            if ((this._pgPlayerModel.get('state') === 'static') && (this._pgPlayerModel.get('username') !== "unknown")) {
            } else {
                this._$el.finish().fadeOut(500);
            }
        },

        _newGame: function() {
            this.render();
            this._$el.finish().fadeIn(500);
            this._washTiles();

            var $game = $(".pggame");
            $game.find('.pgscore').remove();
            var score = _.template('<h2 class="pgscore"><%=player_name%>: <%=player_score%> <%=opponent_name%>: <%=opponent_score%></h2>', {
                player_name: this._pgPlayerModel.get('username'),
                opponent_name: this._pgGameModel.get('opponent_name'),
                player_score: this._pgGameModel.get('player_score'),
                opponent_score: this._pgGameModel.get('opponent_score')
            });
            $game.prepend(score);

            var hands = this._pgGameModel.get('hands');
            for (var hi = 1; hi <= 3; hi++) {
                var hand = hands[hi-1];
                for (var ti = 0; ti < 4; ti++) {
                    hand[ti] = this._dealNextTile();
                }
                // We have to manually trigger the change event because the old and new
                // values are 4-long arrays of PGTile and _.isEqual() returns true for
                // equal, so backbone doesn't think anything changed.
                this._handModels[hi-1].set('tiles', hand);
                this._handModels[hi-1].trigger('change:tiles');
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
