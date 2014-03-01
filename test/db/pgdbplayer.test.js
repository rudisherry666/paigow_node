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

    it('should return unknown username', function () {
        playerLog.debug('should return unknown username');
        assert.equal(pgdbPlayer.currentUsername(), "unknown");
    });
    it('should reject fetching unknown username', function (done) {
        playerLog.debug('should reject fetching unknown username');
        pgdbPlayer.fetchUsername("unknown")
            .then(  function() { assert.fail("rejected", "allowed"); },
                    function() { /* otherwise rejection gets thrown */ })
            .done(  function() { done(); });
    });
    it('should reject fetching username known not to exist', function (done) {
        playerLog.debug('should reject fetching username known not to exist');
        var testUsername = 'test-user-unknown';
        var testPassword = 'xyz';
        pgdbPlayer.fetchUsername(testUsername)
            .then(  function() { assert.fail("allowed", "rejected"); },
                    function() { /* otherwise rejection gets thrown */ })
            .done(  function() { done(); });
    });
    it ('should allow registering a username', function(done) {
        playerLog.debug('should allow registering a username');
        var testUsername = 'test-user-register';
        var testPassword = 'xyz';
        pgdbPlayer.deleteUser(testUsername)
            .then(  function() {
                pgdbPlayer.registerNewUser(testUsername, testPassword)
                    .then(  function(data) { assert.equal(data.username, testUsername); },
                            function(err)  { assert.fail(err); })
                    .done(  function()     { done(); });
            }
        );
    });
    it ('should recognize an existing username', function(done) {
        playerLog.debug('should recognize an existing username');
        var testUsername = 'test-user-existing';
        var testPassword = 'xyz';
        pgdbPlayer.deleteUser(testUsername).done(
            function() {
                pgdbPlayer.registerNewUser(testUsername, testPassword).then(
                  function(data) {
                    assert.equal(data.username, testUsername);
                    pgdbPlayer.verifyPostedUsernameAndPassword(testUsername, testPassword)
                        .then(  function(data) { assert.equal(data.username, testUsername); },
                                function(err)  { assert.fail(err); })
                        .done(  function()     { done(); });
                },
                function(err) { assert.fail(err); done(); });
            }
        );
    });
    it ('should reject re-registering a username', function(done) {
        playerLog.debug('should reject re-registering a username');
        var testUsername = 'test-user-reregister';
        var testPassword = 'xyz';
        pgdbPlayer.deleteUser(testUsername).then(
            function(data) {
                pgdbPlayer.registerNewUser(testUsername, testPassword).then(
                    function(data) {
                        assert.equal(data.username, testUsername);
                        pgdbPlayer.registerNewUser(testUsername, testPassword)
                            .then(  function(data) { assert.fail("allowed", "rejected"); },
                                    function(err)  { /* otherwise rejection gets thrown */ })
                            .done(  function() { done(); });
                    },
                    function(err) {
                        assert.fail(err);
                        done();
                    });
            },
            function(err) {
                assert.fail(err);
                done();
            }
        );
    });
});
