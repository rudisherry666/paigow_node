var assert = require('assert'),
    DeferSeq = require('../../utils/deferseq');

console.log("test: DeferSeq");

describe('DeferSeq', function() {

    it('should add a function and execute it', function(done) {
        var paramIn = 'hello';
        DeferSeq.add('test1', function doMe(defer, err, param) {
            assert.equal(err, null);
            assert.equal(param, paramIn);
            defer.resolve();
            done();
        }, paramIn);
    });

    it('should execute in order', function(done) {
        var firstDone = false;
        function doMeFirst(defer, err, param) {
            firstDone = true;
            defer.resolve();
        }
        function doMeSecond(defer, err, param) {
            assert(firstDone, "second done before first finished!");
            defer.resolve();
            done();
        }
        DeferSeq.add('test2', doMeFirst, null);
        DeferSeq.add('test2', doMeSecond, null);
    });
});
