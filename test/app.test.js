var before = require('./before.test'),
    assert = require('assert'),
    http = require('http');

console.log("test:app");

describe('GET /', function(){

    it('should return a 200 status code', function (done){
        http.get({ host: '0.0.0.0', port: 8088 }, function(res) {
            assert.deepEqual(res.statusCode, 200);
            done();
        }).on('error', function(e) {
            throw new Error(e);
        });
    });

});
