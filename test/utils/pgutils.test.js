var assert = require('assert'),
    PGUtils = require('../../utils/pgutils');

console.log("test: PGUtils");

describe('PGUtils', function() {

    it('should return a resolved defer', function(done) {
        PGUtils.resolvedDefer().promise
            .fail( function(err) { assert.fail(err); })
            .done( function()    { done(); });
    });
});
