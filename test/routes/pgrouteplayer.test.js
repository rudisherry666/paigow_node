var Q = require('q'),
    assert = require('assert'),
    http = require('http'),
    Before = require('../before.test'),
    AWSWrapper = require('../../models/db/awswrapper'),
    PGDBPlayer = require('../../models/db/pgdbplayer'),
    PGDBPlayerRoute = require('../../routes/pgrouteplayer'),
    PGLog = require('../../utils/pglog');

console.log("test: routes.PGRoutePlayer");

describe('GET /player', function() {

    var pgLog = new PGLog('tstRtPlayer', 'debug');

    before(function(done) {
        pgLog.debug("before: deleting all tables");
        var awsWrapper = new AWSWrapper();
        awsWrapper.tableDelete("test-Players").then(
            function(data) {
                // Make sure the table is created.
                var p = new PGDBPlayer();
                p.created().done(function() {
                    pgLog.debug("before: done, success");
                    var wr = new AWSWrapper();
                    wr.tableStatus('test-Players').then(
                        function(status) { pgLog.debug(status); done(); },
                        function(err) { assert.fail(err); }
                    );
                });
            },
            function(err)  {
                assert.fail("cant delete test-Players: " + err);
                pgLog.debug("before: done, fail");
                done();
            }
        );
    });

    it('should return a 200 status code', function (done) {
        pgLog.debug("test: should return a 200 status code");
        http.get({ host: '0.0.0.0', port: 8088, path: "/player" }, function(res) {
            assert.deepEqual(res.statusCode, 200);
        }).on('finish', function() {
            done();
        });
    });

    it('should return an unknown user', function (done) {
        pgLog.debug("test: should return an unknown user");
        var retVal = "";    // Build up the response, it may come in more than one data chunk.
        http.get({ host: '0.0.0.0', port: 8088, path: "/player" }, function(res) {
            res
                .on('data', function(chunk) {
                    retVal += String(chunk);
                })
                .on('end',   function() {
                    try {
                        var obj = JSON.parse(retVal);
                        assert.equal(obj.username, "unknown");
                    } catch (err) {
                        assert.fail("Exception: " + err);
                    }
                    done();
                })
                .on('close', function() {
                    assert.fail("close called"); done();
                })
                .on('error', function(err) {
                    assert.fail(err); done();
                } );
        }).on('error', function(err) {
            assert.fail(err);
            done();
        }).on('finish', function() {
            // Don't call 'done'; this happens before res.on('end') above.
        });
    });

    it('should allow registering a new user', function(done) {
        pgLog.debug("test: should allow registering a new user");
        var testUsername = 'test-player-register';
        var req = http.request({
            host: '0.0.0.0',
            port: 8088,
            path: "/player",
            method: "POST",
            headers: { 'content-type': 'application/json' , 'accept': 'application/json' }
        }, function(res) {
            res
                .on('data',  function() { })
                .on('end',   function() { done(); })
                .on('close', function() { assert.fail("closed not ended!"); done(); })
                .on('error', function(err) { assert.fail(err); done(); });
        });
        req.write(JSON.stringify({username: testUsername, password: 'xyz', state: 'registering'}));
        req.end();
    });
    it ('should reject re-registering a username', function(done) {
        var defer = Q.defer();
        pgLog.debug("test: should allow registering a new user");
        var testUsername = 'test-player-re-register';
        var req = http.request({
            host: '0.0.0.0',
            port: 8088,
            path: "/player",
            method: "POST",
            headers: { 'content-type': 'application/json' , 'accept': 'application/json' }
        }, function(res) {
            res
                .on('data',  function() { })
                .on('end',   function() { defer.resolve(); })
                .on('close', function() { assert.fail("closed not ended!"); defer.reject(); })
                .on('error', function(err) { assert.fail(err); defer.reject(err); });
        });
        req.write(JSON.stringify({username: testUsername, password: 'xyz', state: 'registering'}));
        req.end();

        defer.promise.then(
            function(data) {
                var req2 = http.request({
                    host: '0.0.0.0',
                    port: 8088,
                    path: "/player",
                    method: "POST",
                    headers: { 'content-type': 'application/json' , 'accept': 'application/json' }
                }, function(res) {
                    res
                        .on('data',  function() { })
                        .on('end',   function() { done(); })
                        .on('close', function() { assert.fail("closed not ended!"); done(); })
                        .on('error', function(err) { assert.fail(err); done(err); });
                });
                req2.write(JSON.stringify({username: testUsername, password: 'xyz', state: 'registering'}));
                req2.end();
            },
            function(err) {
                assert.fail(err);
                done();
            }
        );
    });
});
