var before = require('../before.test'),
    PGDBPlayerRoute = require('../../routes/pgrouteplayer'),
    assert = require('assert'),
    http = require('http');

console.log("test: routes.PGRoutePlayer");

describe('GET /player', function(){

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
    
    // it('should allow register', function(done) {
    //     var testUsername = 'test-player-register';
    //     var req = http.request({
    //         host: '0.0.0.0',
    //         port: 8088,
    //         path: "/player",
    //         method: "POST"
    //     });
    //     req.write(JSON.stringify({username: testUserName, password: 'xyz', state: 'registering'}));
    // });


});
