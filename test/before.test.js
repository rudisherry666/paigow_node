// Run before all tests, just run once.

var AWSWrapper = require('../models/db/awswrapper'),
    PGDB = require('../models/db/pgdb'),
    PGServerApp = require('../pgserverapp');

var pgServerApp, awsWrapper;

before(function(done) {

    // Prefix the DB tables with 'test-' so we don't clobber the real tables.
    PGDB.prototype.setPrefix('test-');

    // Clear all the tables (which will use the prefix above) so we have a
    // clean database when we're done.  This returns a promise when they're
    // all really gone, and that's when we call 'done()' to start the tests.
    awsWrapper = new AWSWrapper();
    awsWrapper.tableDeleteMany(/^test-.*$/).done(function() {
        pgServerApp = new PGServerApp();
        pgServerApp.init();
        pgServerApp.run();
        done();
    });
});

after(function(done) {
    // Stop the server
    if (pgServerApp) pgServerApp.stop();

    // Clean up all the tables with this prefix.
    awsWrapper.tableDeleteMany(/^test-.*$/).then(
        function() {},
        function() {}
    ).done(function() { done(); });

});
