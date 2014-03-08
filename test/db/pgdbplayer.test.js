var PGLog = require('../../utils/pglog'),
    Before = require('../before.test'),
    PGDBPlayer = require('../../models/db/pgdbplayer'),
    assert = require('assert');

console.log("test: db.PGDBPlayer");

var playerLog = new PGLog('Test', 'debug');

describe('PGDBPlayer', function() {
    var pgdbPlayer;
    before(function(done) {
        pgdbPlayer = new PGDBPlayer();
        pgdbPlayer.created().then(
            function(data) { done(); },
            function(err)  { assert.fail(err); done(); }
        );
    });

    it('should have a specific computer player', function (done) {
        pgdbPlayer.computer()
            .then(  function(data) { assert(data instanceof PGDBPlayer, "computer is not a player"); },
                    function(err) { assert.fail(err); })
            .done(  function()    { done(); });
    });
    it('should return unknown username', function () {
        assert.equal(pgdbPlayer.username(), "unknown");
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
