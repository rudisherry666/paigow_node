var Before = require('../before.test'),
    Q = require('q'),
    AWSWrapper = require('../../models/db/awswrapper'),
    assert = require('assert');

console.log("test: db.AWSWrapper");

describe('AWSWrapper', function() {
    var awsWrapper1, awsWrapper2;

    before(function(done) {
        awsWrapper1 = new AWSWrapper('test1');
        awsWrapper2 = new AWSWrapper('test2');
        done();
    });

    it('should use the same DB', function () {
        assert.equal(awsWrapper1.DB(), awsWrapper2.DB());
    });

    it('should be able to create a table', function(done) {
        awsWrapper1.tableCreate('test-table-create', 'myKey')
            .then(  function() {},
                    function() { assert.fail(err); })
            .done(function() { done(); });
    });

    it('should throw on bad table params', function() {
        assert.throws(function() { awsWrapper1.tableCreate(); }, Error);
        assert.throws(function() { awsWrapper1.tableCreate('test-table'); }, Error);
        assert.throws(function() { awsWrapper1.tableCreate(5, 'myKey'); }, Error);
        assert.throws(function() { awsWrapper1.tableCreate('test-table', {}); }, Error);
    });

    it('should be able to delete a table', function(done) {
        awsWrapper1.tableCreate('test-table-delete', 'myKey').then(
            function() {
                awsWrapper1.tableDelete('test-table').then(
                    function() {},
                    function(err) { assert.fail(err); }
                ).done(function() { done(); });
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });

    it('should be able to delete a table that doesn\'t exist', function(done) {
        awsWrapper1.tableDelete('test-table-never-created').then(
            function() {},
            function(err) { assert.fail(err); }
        ).done(function() { done(); });
    });

    it('should list tables it has created', function(done) {
        var tableName = 'test-table-created-list';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                awsWrapper1.tableList().then(
                    function(tableNames) {
                        assert(tableNames.indexOf(tableName) >= 0);
                    },
                    function(err) { assert.fail(err); }
                ).done(function() { done(); });
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });

    it('should be OK with creating tables that already exist', function(done) {
        var tableName = 'test-table-created';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                awsWrapper1.tableCreate(tableName, 'myKey').then(
                    function() {},
                    function(err) { assert.fail(err); }
                ).done(function() { done(); });
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });

    it('should correctly not re-create tables.', function(done) {
        var tableName = 'test-table-created-multiple';
        Q.when([
            awsWrapper1.tableCreate(tableName, 'myKey'),
            awsWrapper1.tableCreate(tableName, 'myKey'),
            awsWrapper1.tableCreate(tableName, 'myKey')
        ]).then(
            function(data) { },
            function(err)  { assert.fail(err); }
        ).done(function()  { done(); } );
    });

    it('should correctly handle creating tables that are created then deleted.', function(done) {
        var tableName = 'test-table-create-delete-create';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function(data) {
                awsWrapper1.tableDelete(tableName).then(
                    function(data) {
                        awsWrapper1.tableCreate(tableName, 'myKey').then(
                            function(data) {
                                awsWrapper1.tableStatus(tableName).then(
                                    function(status) {
                                        assert.equal(status, 'ACTIVE');
                                    },
                                    function(err)  { assert.fail(err); }
                                ).done(function()  { done(); } );
                            },
                            function(err)  { assert.fail(err); done(); }
                        );
                    },
                    function(err) { assert.fail(err); done(); }
                );
            },
            function(err) { assert.fail(err); done(); }
        );
    });

    it('should correctly handle creating tables that are deleted then created immediately.', function(done) {
        var tableName = 'test-table-create-delete-create-quick';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function(data) {
                var deletePromise = awsWrapper1.tableDelete(tableName);
                var createPromise = awsWrapper1.tableCreate(tableName, 'myKey');
                Q.when([deletePromise, createPromise]).then(
                    function() {
                        awsWrapper1.tableStatus(tableName).then(
                            function(status) {
                                assert.equal(status, 'ACTIVE');
                            },
                            function(err)  { assert.fail(err); }
                        ).done(function()  { done(); } );
                    },
                    function(err) { assert.fail(err); done(); }
                );
            },
            function(err) { assert.fail(err); done(); }
        );
    });

    it('should not leave any tables with a certain prefix', function(done) {
        var tableName = 'testx-table-create-prefix';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                var regex = /^testx.*$/;
                awsWrapper1.tableDeleteMany(regex).then(
                    function() {
                        awsWrapper1.tableList().then(
                            function(tableNames) {
                                for (var ti = 0; ti < tableNames.length; ti++) {
                                    assert(!regex.test(tableName[ti]), "AWSWrapper.tableDeleteMany left a matching table");
                                }
                            },
                            function(err) { assert.fail(err); }
                        ).done(function() { done(); });
                    },
                    function() { assert.fail(err); done(); }
                );
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });

    it('should return an empty array when getting all results in an empty table', function(done) {
        var tableName = 'test-table-scan-not-found';
        var keyName = 'myKey';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                awsWrapper1.keyItemFind(tableName, {keyAttributeName: keyName}).then(
                    function(data) {
                        assert.equal(typeof data, "object");
                        assert(data instanceof Array, "find returned non-Array");
                        assert.equal(data.length, 0);
                    },
                    function(err)  { assert.fail(err); }
                ).done(function()  { done(); });
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });

    it('should return a one-length array when getting all results in a table with one item', function(done) {
        var tableName = 'test-table-return-one-item';
        var keyName = 'myKey';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                var itemToAdd = {};
                itemToAdd[keyName] = "foo";
                awsWrapper1.itemAdd(tableName, {
                    keyAttributeName: keyName,
                    item: itemToAdd
                }).then(
                    function() {
                        awsWrapper1.keyItemFind(tableName, {keyAttributeName: keyName, keyAttributeValue: itemToAdd[keyName]}).then(
                            function(data) {
                                assert.equal(typeof data, "object");
                                assert(data instanceof Array, "find returned non-Array");
                                assert.equal(data.length, 1);
                                assert.equal(typeof data[0], "object");
                                assert.deepEqual(data[0], itemToAdd);
                            },
                            function(err)  { assert.fail(err); }
                        ).done(function()  { done(); });
                    },
                    function() {
                        assert.fail(err);
                        done();
                    }
                );
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });

    it('should return not-found when searching for a specific item', function(done) {
        var tableName = 'test-table-return-not-found';
        var keyName = 'myKey';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                awsWrapper1.keyItemFind(tableName, {keyAttributeName: keyName, keyAttributeValue: 'foo'}).then(
                    function()    { assert.fail("did not reject with not-found"); },
                    function(err) { assert.equal(err, "not-found"); }
                ).done(function() { done(); });
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });
    it('should allow adding an item and but not again', function(done) {
        var tableName = 'test-table-test-add';
        var keyName = 'myKey';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                var item = {};
                item[keyName] = 'hello';
                awsWrapper1.itemAdd(tableName, {keyAttributeName: keyName, item:item}).then(
                    function(data) {
                        assert.equal(item, data);
                        awsWrapper1.itemAdd(tableName, {keyAttributeName: keyName, item:item}).then(
                            function(data) { assert.fail( "allowed adding again"); },
                            function(err)  { assert.equal(err, "already-exists"); }
                        ).done(function()  { done(); });
                    },
                    function(err)  {
                        assert.fail("rejected adding item: " + err);
                    }
                );
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });
    it('should allow adding an item and updating it', function(done) {
        var tableName = 'test-table-test-add-update';
        var keyName = 'myKey';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                var item = { foo: "bar" };
                item[keyName] = 'hello';
                awsWrapper1.itemAdd(tableName, {keyAttributeName: keyName, item:item}).then(
                    function(data) {
                        assert.equal(item, data);
                        item.foo = "mumble";
                        awsWrapper1.itemUpdate(tableName, {keyAttributeName: keyName, item:item}).then(
                            function(data)  { assert.equal(data, item); },
                            function(err) { assert.fail(err); }
                        ).done(function()  { done(); });
                    },
                    function(err)  {
                        assert.fail("rejected adding item: " + err);
                        done();
                    }
                );
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });
    it('should correctly set an array value', function(done) {
        var tableName = 'test-table-test-add-array';
        var keyName = 'myKey';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                var item = { myKey: 'test', otherKey: ['hello', 'darling'] };
                awsWrapper1.itemAdd(tableName, {keyAttributeName: keyName, item:item}).then(
                    function(data) { assert.equal(item, data); },
                    function(err)  { assert.fail("rejected adding array: " + err); }
                ).done(function()  { done(); });
            },
            function() {
                assert.fail(err);
                done();
            }
        );
    });
});
