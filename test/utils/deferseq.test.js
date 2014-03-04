var assert = require('assert'),
    DeferSeq = require('../../utils/deferseq');

console.log("test: DeferSeq");

describe('DeferSeq', function() {

    it('should add a function and execute it', function(done) {
        // This will time out if it's not done.
        function doMe() { done(); }
        DeferSeq.add('test', doMe);
    });
});
