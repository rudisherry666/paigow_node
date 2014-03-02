var Before = require('../before.test'),
    AWSWrapper = require('../../models/db/awswrapper'),
    PGDBPlayer = require('../../models/db/pgdbplayer'),
    PGDBPlayerRoute = require('../../routes/pgrouteplayer'),
    assert = require('assert'),
    http = require('http');

console.log("test: routes.PGRoutePlayer");

describe('GET /player', function() {

    before(function(done) {
        var awsWrapper = new AWSWrapper();
        awsWrapper.tableDelete("test-Players").then(
            function(data) {
                // Make sure the table is created.
                var p = new PGDBPlayer();
                p.created().done(function() { done(); });
            },
            function(err)  {
                assert.fail("cannt delete test-Players: " + err);
                done();
            }
        );
    });

    it('should return a 200 status code', function (done){
        http.get({ host: '0.0.0.0', port: 8088, path: "/player" }, function(res) {
            assert.deepEqual(res.statusCode, 200);
        }).on('finish', function() {
            done();
        });
    });

    it('should return an unknown user', function (done) {
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
        var testUsername = 'test-player-register';
        var req = http.request({
            host: '0.0.0.0',
            port: 8088,
            path: "/player",
            method: "POST",
            headers: { 'content-type': 'application/json' , 'accept': 'application/json' }
        });
        req.write(JSON.stringify({username: testUsername, password: 'xyz', state: 'registering'}));
        req
            .on('finish',function() { done(); } )
            .on('close', function() { assert.fail("closed not ended!"); done(); } )
            .on('error', function() { assert.fail(err); done(); } );
        req.end();
    });


});
