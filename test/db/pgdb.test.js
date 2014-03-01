var Before = require('../before.test'),
    PGDB = require('../../models/db/pgdb'),
    assert = require('assert');

console.log("test: db.PGDB");

describe('PGDB', function() {
    var pgdb1, pgdb2;

    before(function(done) {
        pgdb1 = new PGDB('test1', 'key1');
        pgdb2 = new PGDB('test2', 'key2');
        done();
    });

    it('should have the right table-name prefix', function () {
        assert.equal(pgdb1.fullTableName(), 'test-test1');
        assert.equal(pgdb2.fullTableName(), 'test-test2');
    });

});
