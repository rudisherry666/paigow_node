var Q = require('q'),
    Before = require('../before.test'),
    assert = require('assert'),
    PGDBPlayer = require('../../models/db/pgdbplayer'),
    PGDBGame = require('../../models/db/pgdbgame');

console.log("test: PGDBGame");

describe('PGDBGame', function() {

    var pgdbPlayer1, pgdbPlayer2;

    before(function(done) {
        pgdbPlayer1 = new PGDBPlayer();
        pgdbPlayer1.created().then(
            function(data) {
                pgdbPlayer2 = new PGDBPlayer();
                pgdbPlayer2.created().then(
                    function(data) { },
                    function(err) { assert.fail(err); }
                ).done(function()  { done(); });
            },
            function(err) { assert.fail(err); done(); }
        );
    });

    it('should throw with fewer than two players', function() {
        var pgdbGame;
        assert.throws(function() {
            pgdbGame = new PGDBGame();
        });
        assert.throws(function() {
            pgdbGame = new PGDBGame(pgdbPlayer1);
        });
    });
    it('should throw if called with non-players', function() {
        var pgdbGame;
        assert.throws(function() {
            pgdbGame = new PGDBGame(5, pgdbPlayer2);
        });
        assert.throws(function() {
            pgdbGame = new PGDBGame(pgdbPlayer1, {});
        });
    });
    it('should return a PGDBGame object', function() {
        var pgdbGame = new PGDBGame(pgdbPlayer1, pgdbPlayer2);
        assert.notEqual(pgdbGame, null);
        assert.equal(pgdbGame.player1(), pgdbPlayer1);
        assert.equal(pgdbGame.player2(), pgdbPlayer2);
    });
});
