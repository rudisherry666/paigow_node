var PGLog = require('../../../utils/pglog'),
    Before = require('../../before.test'),
    PGDBPlayer = require('../../../models/db/pgdbplayer'),
    assert = require('assert');

console.log("test: db.PGDBPlayer");

var playerLog = new PGLog('Test', 'debug');

describe('PGDBPlayer', function() {
    var pgdbPlayer;
    before(function(done) {
        pgdbPlayer = new PGDBPlayer();
        pgdbPlayer.created().then(
            function(data) {
                assert.equal(data, pgdbPlayer);
                done();
            },
            function(err)  { assert.fail(err); done(); }
        );
    });

    it('should have a specific computer player', function () {
        assert(pgdbPlayer.computer() instanceof PGDBPlayer, "computer is not a player");
        assert.equal(pgdbPlayer.computer().username(), "computer", "computer's name is not 'computer'");
    });
    it('its computerPromise should return the computer', function (done) {
        PGDBPlayer.prototype.computerPromise()
            .then(  function(data) {
                        assert(data instanceof PGDBPlayer, "computer promise result is not a player");
                        assert.equal(data, pgdbPlayer.computer(), "computer promise result is not computer");
                    },
                    function(err)  { assert.fail(err); })
            .done(  function()     { done(); });
    });
    it('should return unknown username', function () {
        assert.equal(pgdbPlayer.username(), "unknown");
    });
    it('should take and return a username', function (done) {
        var pgdbPlayerName = new PGDBPlayer();
        pgdbPlayerName.created().then(
            function(data) {
                assert.equal(pgdbPlayerName.username(), "unknown");
                pgdbPlayerName.setUsername("Jerry").then(
                    function(data) {
                        assert.equal(pgdbPlayerName.username(), "Jerry");
                    },
                    function(err) { assert.fail(err); }
                ).done(function() { done(); });
            },
            function(err) { assert.fail(err); }
        );
    });
    it('should reject finding unknown username', function (done) {
        pgdbPlayer.find("unknown")
            .then(  function() { assert.fail("rejected", "allowed"); },
                    function() { /* otherwise rejection gets thrown */ })
            .done(  function() { done(); });
    });
    it('should reject fetching username known not to exist', function (done) {
        var testUsername = 'test-user-unknown';
        var testPassword = 'xyz';
        pgdbPlayer.find(testUsername)
            .then(  function() { assert.fail("allowed", "rejected"); },
                    function() { /* otherwise rejection gets thrown */ })
            .done(  function() { done(); });
    });
    it('should have a player named "computer"', function(done) {
        pgdbPlayer.find('computer').fail(
            function(err) { assert.fail("cannot find computer " + err); }
        ).done(function() { done(); });
    });
});
