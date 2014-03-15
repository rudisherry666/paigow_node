var Q = require('q'),
    Before = require('../../before.test'),
    PGDB = require('../../../models/db/pgdb'),
    assert = require('assert');

console.log("test: db.PGDB");

describe('PGDB', function() {
    var pgdb1, pgdb2;

    before(function(done) {
        pgdb1 = new PGDB('test1', 'key1');
        pgdb2 = new PGDB('test2', 'key2');
        Q.all([pgdb1.created(), pgdb2.created()]).then(
            function(data) { },
            function(err)  { assert.fail("before hook fail: " + err); }
        ).done(function()  { done(); });
    });

    it('should have the right table-name prefix', function () {
        assert.equal(pgdb1.fullTableName(), 'test-test1');
        assert.equal(pgdb2.fullTableName(), 'test-test2');
    });

    it('should allow adding an item', function(done) {
        pgdb1.add({key1: 'foo'}).then(
            function(data) { },
            function(err)  { assert.fail("cannot add an item: " + err); }
        ).done(function()  { done(); });
    });

    it('should find an added item', function(done) {
        var item = {key1: 'foo2'};
        pgdb1.add(item)
            .then(function(data) { return pgdb1.find('foo2'); })
            .then(function(data) {
                assert.equal(typeof data, "object");
                assert(data instanceof Array, "find returned non-Array");
                assert.equal(data.length, 1);
                assert.equal(typeof data[0], "object");
                assert.deepEqual(data[0], item);
            })
            .fail(function(err)  { assert.fail(err); })
            .done(function()     { done(); });
    });

    it('should allow deleting an added item', function(done) {
        var deleteItemVal = "fooDelete";
        pgdb1.add({key1: deleteItemVal})
            .then(function(data) { return pgdb1.delete(deleteItemVal); })
            .fail(function(err)  { assert.fail(err); })
            .done(function()  { done(); });
    });

    it('should allow adding single properties', function(done) {
        var item = { key1: "add-prop" };
        var finalItem = {
            key1: "add-prop",
            foo2: "added"
        };
        pgdb1.add(item)
            .then(function(data) { return  pgdb1.set("foo2", "added"); })
            .then(function(data) { return pgdb1.find('add-prop'); })
            .then(function(data) { assert.deepEqual(data[0], finalItem); })
            .fail(function(err)  { assert.fail(err); })
            .done(function()  { done(); });
    });
});
