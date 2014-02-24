/*
* @class AWSWrapper
*
* Dynamo DB wrapper , base class
*
*/


// Get the SDK and make sure it's set to the right thing.
var Q = require('q'),
    AWS = require('aws-sdk');

// Don't need to do this.
// AWS.config.update({ accessKeyId: "myKeyId", secretAccessKey: "secretKey", region: "us-east-1" });

// One global awsDB, subclasses use it.
var awsDB;
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_ENDPOINT)
    console.log("ERROR cannot start dynamoDB: environment variables are not set up!");
else
    awsDB = new AWS.DynamoDB({ endpoint: new AWS.Endpoint(process.env.AWS_ENDPOINT) });

// One global prefix; all tables will be prefixed with this name.
// This is used for tests usually.
var gDBPrefix = "";

/*
* @constructor PGDB
*
*/
function AWSWrapper() {
    this._DB = awsDB;
}

/*
* Return the awsDB used (more for testing than anything else).  Global function.
*
* @method awsDB
*
*/
AWSWrapper.prototype.DB = function() {
    return this._DB;
};

/*
* Describe a table, returning a promise that is resolved with a the table status.
* Promise is rejected on an error (that isn't 'table-doesn't-exist).
*
* @method tableExists
* @ param tableName {string}
*
*/
AWSWrapper.prototype.tableStatus = function(tableName) {
    var self = this;
    var defer = Q.defer();

    if (!awsDB) throw new Error("AWSWrapper.tableStatus: no DB!");

    self._DB.describeTable({TableName: tableName}, function(err, data) {
        if (!err) {
            // Table exists, we're good. unless there is an issue with the returned data.
            if (data && data.Table && data.Table.TableStatus) {
                defer.resolve(data.Table.TableStatus);
            } else {
                throw new Error('FATAL tableStatus(' + tableName + ') err: returned data does not include status.');
            }
        } else if (err.code && err.code === 'ResourceNotFoundException') {
            // Table doesn't exist, that's OK, we "extend" the aws set of statuses
            defer.resolve("MISSING");
        } else {
            // Hmm, error other than no-table: that's really bad.
            throw new Error('FATAL tableStatus(' + tableName + ') err: ' + err);
        }
    });

    return defer.promise;
};


/*
* Create a table, returning a promise that is resolved when it's created successfully
* with the status of the table.
*
* Promise is rejected on an error.
*
* For pre-existing tables, no check is made for whether or not the key attributes
* match what is passed in.
*
* @method tableCreate
* @param tableName {string} name of the table
* @param keyAttributeName {string} assumed to be string and HASH
*
*/
AWSWrapper.prototype.tableCreate = function(tableName, keyAttributeName) {
    var self = this;
    var defer = Q.defer();

    // console.log("AWSWrapper.tableCreate('" + tableName + "')");

    if (!awsDB) throw new Error("AWSWrapper.tableCreate: no DB!");
    if (!tableName || (typeof tableName !== "string")) throw new Error("AWSWrapper.tableCreate: bad tableName!");
    if (!keyAttributeName || (typeof keyAttributeName !== "string")) throw new Error("AWSWrapper.tableCreate: bad keyAttributeName!");

    // If the table already exists, we're done.
    var existsPromise = self.tableStatus(tableName);
    existsPromise.then(
        function(status) {
            switch (status) {
                case "CREATING":
                case "UPDATING":
                case "ACTIVE":
                    // It already exists: return this status.
                    defer.resolve(status);
                break;

                case "DELETING":
                    // Bleah, we can't do anything until it's finished deleting.
                    self._waitForDeletToFinish(tableName, defer).then(
                        function(status) {
                            self._createTable(tableName, keyAttributeName).then(
                                function(status) { defer.resolve(status); },
                                function(err)    { defer.reject(err);     }
                            );
                        },
                        function(err) {
                            defer.reject(err);
                        }
                    );
                break;

                case "MISSING":
                    // It doesn't exist: create it and return its status.
                    self._createTable(tableName, keyAttributeName).then(
                        function(status) { defer.resolve(status); },
                        function(err)    { defer.reject(err);     }
                    );
                break;
            }
        },
        function(err) {
            // Bleah, can't even describe the table.
            defer.reject(err);
        });

    return defer.promise;
};

/*
* Delete a table, returning a promise that's resolved when it's gone.
*
* @method tableDelete
* @param tableName
*/
AWSWrapper.prototype.tableDelete = function(tableName) {
    var self = this;
    var defer = Q.defer();

    if (!awsDB) throw new Error("AWSWrapper.tableDelete: no DB!");

    awsDB.deleteTable({TableName:tableName}, function(err, data) {
        if (err) {
            // May already be gone; that's OK.
            if (err.code && err.code === 'ResourceNotFoundException') {
                // console.log("AWSWrapper.clearAll.deleteTable('" + tableName + "'): already gone!");
                defer.resolve();
            } else {
                throw new Error("AWSWrapper.clearAll.deleteTable('" + tableName + "'): FATAL error describing: " + err);
            }
        } else {
            // No error, resolve when it's gone.
            self._waitForDeletToFinish(tableName, defer);
        }
    });

    return defer.promise;
};

/*
* Return a promise that resolves to an array of the names all the tables whose names match regex.
*
* @method tableList
* @param tableNameRegEx optional {regex} if falsy, then all tables are listed; otherwise
* only tables with a name matching this regex are listed.
*
*/
AWSWrapper.prototype.tableList = function(tableNameRegex) {

    if (!awsDB) throw new Error("AWSWrapper.tableList without DB!");

    // No regex means match any table.
    tableNameRegex = tableNameRegex || /^.*$/;

    var self = this;
    var defer = Q.defer();

    awsDB.listTables(function(err, data) {
        if (err) throw new Error("FATAL AWSWrapper.tableList err: " + err);
        if (!data || !data.TableNames) throw new Error("FATAL AWSWrapper.tableList listTables found no tables!");

        // Go through all the tables that have this prefix (or all of them if there is no prefix)
        // and delete them.  For each we call delete, we'll have to wiat until it's really deleted
        // before we return the promise.
        var tableNames = [];
        for (var ti = 0; ti < data.TableNames.length; ti++) {
            var tableName = data.TableNames[ti];
            if (tableNameRegex.test(tableName)) {
                tableNames.push(tableName);
            }
        }

        defer.resolve(tableNames);
    });

    return defer.promise;
};

/*
* Drop all the tables that match regex.
*
* @method tableDeleteMany
* @param tableNameRegEx optional {regex} if falsy, then all tables are dropped; otherwise
* only tables with a name matching this regex are dropped.
*
*/
AWSWrapper.prototype.tableDeleteMany = function(tableNameRegex) {

    if (!awsDB) throw new Error("AWSWrapper.tableDeleteMany without DB!");

    // No regex means match any table.
    tableNameRegex = tableNameRegex || /^.*$/;

    var self = this;

    // This is the array of defers created, one per table we're deleting.  They
    // each get resolved when the table really is deleted, and we return a promise
    // that's resolved when they're all resolved / rejected when the first is
    // rejected.
    var defer = Q.defer();

    self.tableList(tableNameRegex).then(
        function(tableNames) {
            var defers = [];
            for (var ti = 0; ti < tableNames.length; ti++)
                defers.push(self.tableDelete(tableNames[ti]));
            Q.all(defers).then(
                function(xxx) { defer.resolve(xxx); },
                function(err) { defer.reject(err);  }
            );
        },
        function(err) {
            defer.reject(err);
        }
    );

    return defer.promise;
};

/*
*  This table is known not to exist: create it
*/
AWSWrapper.prototype._createTable = function(tableName, keyAttributeName) {
    var self = this;

    var defer = Q.defer();

    self._DB.createTable({
        TableName: tableName,
        AttributeDefinitions: [ { AttributeName: keyAttributeName, AttributeType: "S" } ],
        KeySchema:            [ { AttributeName: keyAttributeName, KeyType: "HASH" } ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    }, function(err, data) {
        if (err) {
            // Uh-oh, can't create the table: that's bad
            throw new Error('FATAL _createTable(' + tableName + ') err: ' + err);
        } else if (data && data.TableDescription && data.TableDescription.TableStatus) {
            self._waitForCreateToFinish(tableName, defer);
        } else {
            // Uh-oh, return value not what we expect.
            throw new Error('FATAL _createTable(' + tableName + ') err: no table status to return');
        }
    });

    return defer.promise;
};

/*
* Return a promise that's resolved when a table is finished being created.
* "ACTIVE" means it's done; "CREATING" means it's not done; anything
* else is an error.
*/
AWSWrapper.prototype._waitForCreateToFinish = function(tableName, defer) {
    var self = this;
    self.tableStatus(tableName).then(
        function(status) {
            if (status === "ACTIVE")
                defer.resolve(status);
            else if (status == "CREATING")
                setTimeout(function() { self._waitForDeletToFinish(tableName, defer); }, 100);
            else
                throw new Error("AWSWrapper._waitForCreateToFinish: bad table status: " + status);
        },
        function(err) {
            throw new Error("AWSWrapper._waitForCreateToFinish: error getting status: " + err);
        }
    );
    return defer.promise;
};

/*
*   Return a promise that's resolved when a table is no longer "DELETING".
*/
AWSWrapper.prototype._waitForDeletToFinish = function(tableName, defer) {
    var self = this;
    self.tableStatus(tableName).then(
        function(status) {
            if (status === "MISSING")
                defer.resolve(status);
            else
                setTimeout(function() { self._waitForDeletToFinish(tableName, defer); }, 100);
        },
        function(err) {
            defer.reject(err);
        }
    );
    return defer.promise;
};


module.exports = AWSWrapper;
