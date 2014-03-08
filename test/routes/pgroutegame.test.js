var Q = require('q'),
    assert = require('assert'),
    http = require('http'),
    Before = require('../before.test'),
    AWSWrapper = require('../../models/db/awswrapper'),
    PGDBPlayer = require('../../models/db/pgdbplayer'),
    PGDBGame = require('../../models/db/pgdbgame'),
    PGLog = require('../../utils/pglog');

console.log("test: routes.PGRouteGame");

describe('GET /game', function() {

    var pgLog = new PGLog('tstRtGame', 'debug');

    var pgdbPlayer1;
    var computer;

    before(function(done) {
        pgLog.debug("before: deleting all tables");
        var awsWrapper = new AWSWrapper();
        awsWrapper.tableDelete("test-Games").then(
            function(data) { done(); },
            function(err)  { assert.fail("cant delete test-Games: " + err); }
        );
    });

    it('should return a 200 status code', function (done) {
        pgLog.debug("test: should return a 200 status code");
        http.get({ host: '0.0.0.0', port: 8088, path: "/games" }, function(res) {
            assert.deepEqual(res.statusCode, 200);
        }).on('finish', function() {
            done();
        });
    });

});
