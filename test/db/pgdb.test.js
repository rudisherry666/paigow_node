var PGDB = require('../../models/db/pgdb'),
    assert = require('assert');


describe('PGDB', function() {

    it('should use the same DB', function () {
        var pgdb1 = new PGDB();
        assert(Boolean(pgdb1));
        var pgdb2 = new PGDB();
        assert(Boolean(pgdb2));
        assert.equal(pgdb1.DB(), pgdb2.DB());
    });

});
