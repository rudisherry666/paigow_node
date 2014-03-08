var assert = require('assert'),
    PGUtils = require('../../utils/pgutils');

console.log("test: PGUtils");

describe('PGUtils', function() {

    it('should return a resolved defer', function() {
        PGUtils.resolvedDefer().promise.then(
            function(data) { assert.equal("PGUtils resolved defer", data); },
            function(err)  { assert.fail(err); });
    });
});
