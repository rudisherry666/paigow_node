var PGDBPlayer = require('../../models/db/pgdbplayer'),
    assert = require('assert');


describe('PGDBPlayer', function() {

    var pgdbPlayer;
    before(function () {
        pgdbPlayer = new PGDBPlayer();
    });

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
        var testUsername = 'test-user-unknown';
        var testPassword = 'xyz';
        pgdbPlayer.fetchUsername(testUsername)
            .then(  function() { assert.fail("allowed", "rejected"); },
                    function() { /* otherwise rejection gets thrown */ })
            .done(  function() { done(); });
    });
    it ('should allow registering a username', function(done) {
        var testUsername = 'test-user-register';
        var testPassword = 'xyz';
        pgdbPlayer.deleteUser(testUsername)
            .then(  function() {
                pgdbPlayer.registerNewUser(testUsername, testPassword)
                    .then(  function(username) { assert.equal(username, testUsername); },
                            function(err)      { assert(false); })
                    .done(  function() { done(); });
            }
        );
    });
    it ('should recognize an existing username', function(done) {
        var testUsername = 'test-user-existing';
        var testPassword = 'xyz';
        pgdbPlayer.deleteUser(testUsername)
            .done(  function() {
                pgdbPlayer.registerNewUser(testUsername, testPassword)
                    .then(  function(username) {
                                assert.equal(username, testUsername);
                                pgdbPlayer.verifyPostedUsernameAndPassword(testUsername, testPassword)
                                    .then(  function(userData) {
                                                assert.equal(userData.username, testUsername);
                                            },
                                            function(err){
                                                assert(false);
                                            })
                                    .done(  function() {
                                                done();
                                            });
                            },
                            function(err) {
                                assert(false);
                                done();
                            });
            }
        );
    });
    it ('should reject re-registering a username', function(done) {
        var testUsername = 'test-user-reregister';
        var testPassword = 'xyz';
        pgdbPlayer.deleteUser(testUsername)
            .then(  function() {
                pgdbPlayer.registerNewUser(testUsername, testPassword).then(
                    function(username) {
                        assert.equal(username, testUsername);
                        pgdbPlayer.registerNewUser(testUsername, testPassword)
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
