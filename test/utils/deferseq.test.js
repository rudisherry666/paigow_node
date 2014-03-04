var assert = require('assert'),
    DeferSeq = require('../../utils/deferseq');

console.log("test: DeferSeq");

describe('DeferSeq', function() {

    it('should add a function and execute it with the correct param', function(done) {
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
        function doMeFirst2(defer, err, param) {
            firstDone = true;
            defer.resolve();
        }
        function doMeSecond2(defer, err, param) {
            assert(firstDone, "second done before first finished!");
            defer.resolve();
            done();
        }
        DeferSeq.add('test2', doMeFirst2, null);
        DeferSeq.add('test2', doMeSecond2, null);
    });

    it('should pass error correctly from previous function', function(done) {
        function doMeFirst3(defer, err, param) {
            defer.reject("doMeFirst3");
        }
        function doMeSecond3(defer, err, param) {
            assert.equal(err, "doMeFirst3");
            defer.resolve();
            done();
        }
        DeferSeq.add('test2', doMeFirst3, null);
        DeferSeq.add('test2', doMeSecond3, null);
    });
});
