var AWSWrapper = require('../../models/db/awswrapper'),
    assert = require('assert');

console.log("test: db.AWSWrapper");

describe('PGDB', function() {
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
        awsWrapper1.tableCreate('test-table', 'myKey')
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
        awsWrapper1.tableCreate('test-table', 'myKey').then(
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
        var tableName = 'test-table-created';
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
    it('should not leave any tables with a certain prefix', function(done) {
        var tableName = 'test-table-create-prefix';
        awsWrapper1.tableCreate(tableName, 'myKey').then(
            function() {
                var regex = /^test.*$/;
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
});
