var Q = require('q'),
    assert = require('assert'),
    DeferSeq = require('../../utils/deferseq');

console.log("test: DeferSeq");

describe('DeferSeq', function() {

    it('should add a function and execute it with the correct param', function(done) {
        var paramIn = 'hello';
        DeferSeq.add('test1', function doMe(err, param) {
            assert.equal(err, null);
            assert.equal(param, paramIn);
            return "foo";
        }, paramIn).then(
            function(data) { assert.equal(data, "foo"); },
            function(err)  { assert.fail("failed when function correctly returned a value"); }
        ).done(function() {
            done();
        });
    });

    it('should correctly reject when a function throws', function(done) {
        var paramIn = 'hello';
        DeferSeq.add('test1', function doMe(err, param) {
            assert.equal(err, null);
            assert.equal(param, paramIn);
            throw new Error("foo");
        }, paramIn).then(
            function(data) { assert.fail("succeeded when the function threw"); },
            function(err)  { assert(err instanceof Error, "wrong error came back"); }
        ).done(function() {
            done();
        });
    });

    it('should execute in order, which requires a promise', function(done) {
        var firstDone = false;
        function doMeFirst2(err, param) {
            var defer = Q.defer();
            setTimeout(function() {
                firstDone = true;
                defer.resolve("first");
            }, 100);
            return defer.promise;
        }
        function doMeSecond2(err, param) {
            assert(firstDone, "second done before first finished!");
            done();
            return "second";
        }
        DeferSeq.add('test2', doMeFirst2, null);
        DeferSeq.add('test2', doMeSecond2, null);
    });

});
