// Run before all tests, just run once.

var PGLog = require('../utils/pglog'),
    AWSWrapper = require('../models/db/awswrapper'),
    PGDB = require('../models/db/pgdb'),
    PGServerApp = require('../pgserverapp');

var pgServerApp, awsWrapper, pgLog;

before(function(done) {
    pgLog = new PGLog("test", 'debug');
    pgLog.debug("before all hook called");

    // Prefix the DB tables with 'test-' so we don't clobber the real tables.
    PGDB.prototype.setPrefix('test-');

    // Clear all the tables (which will use the prefix above) so we have a
    // clean database when we're done.  This returns a promise when they're
    // all really gone, and that's when we call 'done()' to start the tests.
    awsWrapper = new AWSWrapper();
    awsWrapper.tableDeleteMany(/^test-.*$/).done(function() {
        pgServerApp = new PGServerApp();
        pgServerApp.init(true);
        pgServerApp.run();
        pgLog.debug("----------------- BEFORE DONE -----------------");
        done();
    });
});

after(function(done) {
    pgLog.debug("----------------- AFTER BEGINS -----------------");

    // Stop the server
    if (pgServerApp) pgServerApp.stop();

    // Clean up all the tables with this prefix.
    awsWrapper.tableDeleteMany(/^test-.*$/).then(
        function() {},
        function() {}
    ).done(function() { done(); });

});
