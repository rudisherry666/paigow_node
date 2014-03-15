var Q = require('q'),
    Before = require('../../before.test'),
    assert = require('assert'),
    PGDBPlayer = require('../../../models/db/pgdbplayer'),
    PGDBGame = require('../../../models/db/pgdbgame');

console.log("test: PGDBGame");

describe('PGDBGame', function() {

    var pgdbPlayer, computer;

    before(function(done) {
        var cp = PGDBPlayer.prototype.computerPromise();
        var pp = new PGDBPlayer().created();
        Q.all([cp, pp])
            .then(function(data) {
                computer = data[0];
                pgdbPlayer = data[1];
                assert(computer instanceof PGDBPlayer, "Computer is not a PGDBPlayer");
                assert(pgdbPlayer instanceof PGDBPlayer, "Player is not a PGDBPlayer");
            })
            .fail(function(err) { assert.fail(err); })
            .done(function()    { done(); });
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

    it('should return a PGDBGame object with the input players', function(done) {
        var pgdbGame = new PGDBGame(pgdbPlayer, computer);
        assert.notEqual(pgdbGame, null);
        pgdbGame.created()
            .then(function(data) {
                assert.equal(data, pgdbGame);
                assert.equal(pgdbGame.player1(), pgdbPlayer.username());
                assert.equal(pgdbGame.player2(), computer.username());
            })
            .fail(function(err) { assert.fail(err); })
            .done(function()    { done(); });
    });
});
