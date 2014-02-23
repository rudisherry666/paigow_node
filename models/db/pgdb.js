/*
* @class PGDB
*
* Dynamo DB wrapper for paigow, base class
*
*/


// Get the SDK and make sure it's set to the right thing.
var Q = require('q'),
    AWS = require('aws-sdk');

// Don't need to do this.
// AWS.config.update({ accessKeyId: "myKeyId", secretAccessKey: "secretKey", region: "us-east-1" });

// One global gDB, subclasses use it.
var gDB;
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_ENDPOINT)
    console.log("ERROR cannot start dynamoDB: environment variables are not set up!");
else
    gDB = new AWS.DynamoDB({ endpoint: new AWS.Endpoint(process.env.AWS_ENDPOINT) });

// One global prefix; all tables will be prefixed with this name.
// This is used for tests usually.
var gDBPrefix = "";

/*
* @constructor PGDB
*
*/
function PGDB() {
    this._DB = gDB;
}

/*
* Return the gDB used (more for testing than anything else)
*
* @method gDB
*
*/
PGDB.prototype.DB = function() {
    return this._DB;
};

/*
* Set a prefix for all tables for this DB connection.  This is used for
* testing, to allow testing without clobbering real tables.
*
* @method setPrefix
*
*/
PGDB.prototype.setPrefix = function(prefix) {
    gDBPrefix = prefix;
};

/*
* Return the full name for a table, uses the prefix.
*
* @method fullTableName
*
* @param tableName
*
*/
PGDB.prototype.fullTableName = function(tableName) {
    return gDBPrefix + tableName;
};

/*
* Drop all the tables, with the current prefix.
*
* @method clearAll
*
*/
PGDB.prototype.clearAll = function() {
    if (!this._DB) throw new Error("PGDB.clearAll without DB!");

    var self = this;

    // This is the array of defers created, one per table we're deleting.  They
    // get resolved when the table really is deleted.
    var defers = [];

    // This function keeps resetting until a table is really gone.
    function checkForTableReallyGone(tableName, defer) {
        self._DB.describeTable({ TableName: self._tableName}, function(err, data) {
            if (err && err.code && err.code === 'ResourceNotFoundException') {
                console.log("PGDB.clearAll.checkForTableReallyGone('" + tableName + "'): it's gone!");
                // It's gone!  Don't re-register to get called again.
            } else if (err) {
                // Uh-oh, an error trying, that's bad.
                console.log("PGDB.clearAll.checkForTableReallyGone('" + tableName + "'): FATAL: " + err);
                defer.reject(err);
            } else {
                // Not gone, try again later.
                console.log("PGDB.clearAll.checkForTableReallyGone('" + tableName + "'): not gone yet!");
                setTimeout(function() { checkForTableReallyGone(tableName, defer); }, 100);
            }
        });
    }

    // This function gets called for each table we want to delete.
    function deleteTable(tableName) {
        var defer = Q.defer();
        defers.push(defer);
        console.log("PGDB.clearAll.deleteTable('" + tableName + "')");
        self._DB.deleteTable({TableName:tableName}, function(err, data) {
            if (err) {
                // May already be gone; that's OK.
                if (err.code && err.code === 'ResourceNotFoundException') {
                    console.log("PGDB.clearAll.deleteTable('" + tableName + "'): already gone!");
                    defer.resolve();
                } else {
                    console.log("PGDB.clearAll.deleteTable('" + tableName + "'): FATAL error describing: " + err);
                    defer.reject(err);
                }
            } else {
                // We have to wait until this table is really gone; deleteTable
                // just puts it in the 'DELETING' state.
                console.log("PGDB.clearAll.deleteTable('" + tableName + "'): starting to check");
                setTimeout(function() { checkForTableReallyGone(tableName, defer); }, 100);
            }
        });
    }

    this._DB.listTables(function(err, data) {
        if (err) throw new Error("PBDB.clearAll listTables threw: " + err);
        if (!data || !data.TableNames) throw new Error("PBDB.clearAll listTables found no tables!");

        // Go through all the tables that have this prefix (or all of them if there is no prefix)
        // and delete them.  For each we call delete, we'll have to wiat until it's really deleted
        // before we return the promise.
        for (var ti = 0; ti < data.TableNames.length; ti++) {
            var tableName = data.TableNames[ti];
            if (!gDBPrefix || tableName.indexOf(gDBPrefix) === 0)
                deleteTable(tableName);
        }
    });

    console.log("PGDB.clearAll(): found " + defers.length + " tables.");
    return Q.all(defers);
};

module.exports = PGDB;
