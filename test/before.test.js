// Run before all tests, just run once.

var AWSWrapper = require('../models/db/awswrapper'),
    PGDB = require('../models/db/pgdb'),
    PGServerApp = require('../pgserverapp');

var pgServerApp;

before(function(done) {

    // Prefix the DB tables with 'test-' so we don't clobber the real tables.
    PGDB.prototype.setPrefix('test-');

    // Clear all the tables (which will use the prefix above) so we have a
    // clean database when we're done.  This returns a promise when they're
    // all really gone, and that's when we call 'done()' to start the tests.
    var awsWrapper = new AWSWrapper();
    awsWrapper.tableDeleteMany(/^test-$/).done(function() {
        pgServerApp = new PGServerApp();
        pgServerApp.init();
        pgServerApp.run();
        done();
    });
});

after(function() {
    if (pgServerApp) pgServerApp.stop();
});
