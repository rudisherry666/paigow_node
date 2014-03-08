var Q = require('q'),
    Before = require('../before.test'),
    assert = require('assert'),
    PGDBPlayer = require('../../models/db/pgdbplayer'),
    PGDBGame = require('../../models/db/pgdbgame');

console.log("test: PGDBGame");

describe('PGDBGame', function() {

    var pgdbPlayer, computer;

    before(function(done) {
        var cp = PGDBPlayer.prototype.computerPromise();
        var pp = new PGDBPlayer().created();
        Q.all([cp, pp]).then(
            function(data) {
                computer = data[0];
                pgdbPlayer = data[1];
                assert(computer instanceof PGDBPlayer, "Computer is not a PGDBPlayer");
                assert(pgdbPlayer instanceof PGDBPlayer, "Player is not a PGDBPlayer");
                done();
            },
            function(err)  { assert.fail(err); }
        );
    });

    it('should throw with fewer than two players', function() {
        var pgdbGame;
        assert.throws(function() {
            pgdbGame = new PGDBGame();
        });
        assert.throws(function() {
            pgdbGame = new PGDBGame(pgdbPlayer);
        });
    });

    it('should throw if called with non-players', function() {
        var pgdbGame;
        assert.throws(function() {
            pgdbGame = new PGDBGame(5, pgdbPlayer);
        });
        assert.throws(function() {
            pgdbGame = new PGDBGame(pgdbPlayer, {});
        });
    });

    it('should return a PGDBGame object', function() {
        var pgdbGame = new PGDBGame(pgdbPlayer, computer);
        assert.notEqual(pgdbGame, null);
        assert.equal(pgdbGame.player1(), pgdbPlayer);
        assert.equal(pgdbGame.player2(), computer);
    });
});
