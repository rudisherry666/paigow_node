var PGDBPlayer = require('../../models/db/pgdbplayer'),
    assert = require('assert');


describe('PGDBPlayer', function() {

    var pgdbPlayer = new PGDBPlayer();

    it('should have a DB', function () {
        assert(Boolean(pgdbPlayer.DB()));
    });
    it('should return unknown username', function () {
        assert.equal(pgdbPlayer.currentUsername(), "unknown");
    });
    it('should reject fetching unknown username', function (done) {
        pgdbPlayer.fetchUsername("unknown")
            .then(  function() { assert.fail("rejected", "allowed"); },
                    function() { /* otherwise rejection gets thrown */ })
            .done(  function() { done(); });
    });
    it('should reject fetching username known not to exist', function (done) {
        pgdbPlayer.fetchUsername("unkxnownxxx")
            .then(  function() { assert.fail("allowed", "rejected"); },
                    function() { /* otherwise rejection gets thrown */ })
            .done(  function() { done(); });
    });
    it ('should allow registering a username', function(done) {
        pgdbPlayer.deleteUser("test_user")
            .then(  function() {
                pgdbPlayer.registerNewUser("test_user", "xyz")
                    .then(  function(username) { assert.equal(username, "test_user"); },
                            function(err)      { assert(false); })
                    .done(  function() { done(); });
            }
        );
    });
    it ('should reject re-registering a username', function(done) {
        pgdbPlayer.deleteUser("test_user")
            .then(  function() {
                pgdbPlayer.registerNewUser("test_user", "xyz").then(
                    function(username) {
                        assert.equal(username, "test_user");
                        pgdbPlayer.registerNewUser("test_user", "xyz")
                            .then(  function(username) { assert.fail("allowed", "rejected"); },
                                    function(err)      { /* otherwise rejection gets thrown */ })
                            .done(  function() { done(); });
                    },
                    function(err) {
                        assert.fail("rejected", "allowed");
                        done();
                    });
            }
        );
    });
});
