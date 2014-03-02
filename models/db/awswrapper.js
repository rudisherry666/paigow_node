/*
* @class AWSWrapper
*
* Dynamo DB wrapper , base class
*
*/


// Get the SDK and make sure it's set to the right thing.
var PGLog = require('../../utils/pglog'),
    Q = require('q'),
    AWS = require('aws-sdk');

// Don't need to do this.
// AWS.config.update({ accessKeyId: "myKeyId", secretAccessKey: "secretKey", region: "us-east-1" });

// One global awsDB, subclasses use it.
var awsDB;

// When tables are created, we don't want to try to create them multiple times.  This is a map of
// table names to promises for tables that are in the process of creation; if a second request
// comes in for creating, then this promise is returned rather than calling the DB again.
var awsTablesBeingCreated = {};

/*
* @constructor PGDB
*
*/
function AWSWrapper() {
    this._log = new PGLog("AWS", 'verbose');
    if (!awsDB) {
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_ENDPOINT) {
            this._log.fatal("ERROR cannot start dynamoDB: environment variables are not set up!");
            throw new Error("ERROR cannot start dynamoDB: environment variables are not set up!");
        } else
            awsDB = new AWS.DynamoDB({ endpoint: new AWS.Endpoint(process.env.AWS_ENDPOINT) });
    }
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
    var prefix = "tableStatus('" + tableName + "') ";
    self._log.debug(prefix + "called");

    if (!awsDB) throw new Error("AWSWrapper.tableStatus: no DB!");

    var defer = Q.defer();

    self._DB.describeTable({TableName: tableName}, function(err, data) {
        if (!err) {
            // Table exists, we're good. unless there is an issue with the returned data.
            if (data && data.Table && data.Table.TableStatus) {
                self._log.debug(prefix + data.Table.TableStatus);
                defer.resolve(data.Table.TableStatus);
            } else {
                self._log.debug(prefix + " bad error: don't know data");
                throw new Error('FATAL tableStatus(' + tableName + ') err: returned data does not include status.');
            }
        } else if (err.code && err.code === 'ResourceNotFoundException') {
            // Table doesn't exist, that's OK, we "extend" the aws set of statuses
            self._log.debug(prefix + " MISSING ");
            defer.resolve("MISSING");
        } else {
            // Hmm, error other than no-table: that's really bad.
            self._log.debug(prefix + " bad error: " + err);
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
    var prefix = "AWSWrapper.tableCreate('" + tableName + "') ";
    self._log.debug(prefix + "called");

    // Any issues, we bail and throw.
    function tableCreateFatal(err) {
        var msg = prefix + " " + err + "!";
        self._log.fatal(msg);
        throw new Error(msg);
    }

    if (!awsDB) tableCreateFatal("no DB!");
    if (!tableName || (typeof tableName !== "string")) tableCreateFatal("bad tableName!");
    if (!keyAttributeName || (typeof keyAttributeName !== "string")) tableCreateFatal("bad keyAttributeName!");

    prefix = "AWSWrapper.tableCreate('" + tableName + "', '" + keyAttributeName + "') ";

    // If we're already creating this table, make sure it's the same key attribute and
    // return the promise for it.
    if (awsTablesBeingCreated[tableName]) {
        if (keyAttributeName !== awsTablesBeingCreated[tableName].keyAttributeName) tableCreateFatal("asked to create same table with different keyAttributeName");
        self._log.debug(prefix + "returning existing " + (awsTablesBeingCreated[tableName].defer.promise.inspect().state) + " promise");
        return awsTablesBeingCreated[tableName].defer.promise;
    }

    var defer = Q.defer();

    // Add this to the promise set.
    awsTablesBeingCreated[tableName] = {
        defer: defer,
        keyAttributeName: keyAttributeName
    };

    // If the table already exists, we're done.
    self.tableStatus(tableName).then(
        function(status) {
            switch (status) {
                case "CREATING":
                    // Not yet: wait until it's created.
                    self._log.debug(prefix + "table is still being created, waiting");
                    self._waitForCreateToFinish(tableName, defer);
                break;

                case "UPDATING":
                case "ACTIVE":
                    // It already exists: return this status (even if it's busy).
                    self._log.debug(prefix + "table is created!");
                    defer.resolve(status);
                break;

                case "DELETING":
                    // Bleah, we can't do anything until it's finished deleting.
                    self._log.debug(prefix + "table is being deleted, waiting");
                    self._waitForDeletToFinish(tableName, defer).then(
                        function(status) {
                            self._createTable(tableName, keyAttributeName, defer);
                        },
                        function(err) {
                            defer.reject(err);
                        }
                    );
                break;

                case "MISSING":
                    // It doesn't exist: create it and return its status.
                    self._log.debug(prefix + "table is missing: creating it");
                    self._createTable(tableName, keyAttributeName, defer);
                break;
            }
        },
        function(err) {
            // Bleah, can't even describe the table.
            self._log(prefix + "error from tableSatatus: " + err);
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
    var prefix = "AWSWrapper.tableDelete('" + tableName + "') ";
    self._log.debug(prefix + "called");

    // Any issues, we bail and throw.
    function tableDeleteFatal(err) {
        var msg = prefix + " " + err + "!";
        self._log.fatal(msg);
        throw new Error(msg);
    }

    if (!awsDB) tableDeleteFatal("no DB");
    if (!tableName || (typeof tableName !== "string")) tableDeleteFatal("bad tableName");

    // If there is a promise that this table is being created, reject it and remove it.
    if (awsTablesBeingCreated[tableName]) {
        self._log.debug(prefix + "removing existing promise");
        awsTablesBeingCreated[tableName].defer.reject();
        delete awsTablesBeingCreated[tableName];
    }

    var defer = Q.defer();

    awsDB.deleteTable({TableName:tableName}, function(err, data) {
        if (err) {
            // May already be gone; that's OK.
            if (err.code && err.code === 'ResourceNotFoundException') {
                self._log.debug(prefix + "already gone");
                defer.resolve();
            } else {
                tableDeleteFatal("bad error: " + error);
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
    var self = this;
    self._log.debug("tableList(" + tableNameRegex + ")");

    if (!awsDB) throw new Error("AWSWrapper.tableList without DB!");

    // No regex means match any table.
    tableNameRegex = tableNameRegex || /^.*$/;

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
    var self = this;
    self._log.debug("tableDeleteMany(" + tableNameRegex + ")");

    if (!awsDB) throw new Error("AWSWrapper.tableDeleteMany without DB!");

    // No regex means match any table.
    tableNameRegex = tableNameRegex || /^.*$/;

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
* Find an item, assuming key attribute, string and EQ.
*
* No items: rejected "not-found"
* More than one item: rejected "too-many-found"
* Exactly one item: might be "aws-sdk-corrupted" if doesn't look right
* Resolved with item normalized properties.
*
* @method keyItemFind
* @param tableName
* @param options 
*     * attributeName (assumed to be key)
*     * [attributeValue] (assumed to be EQ); if doesn't exist, finds all
*
*/
AWSWrapper.prototype.keyItemFind = function(tableName, options) {
    var self = this;
    var prefix = "AWSWrapper.keyItemFind('" + tableName + "') ";
    self._log.debug(prefix + "called");

    // Any issues, we bail and throw.
    function keyItemFindFatal(err) {
        var msg = prefix + " " + err + "!";
        self._log.fatal(msg);
        throw new Error(msg);
    }

    if (!awsDB) keyItemFindFatal("no DB");
    if (!tableName) keyItemFindFatal("no tablename");
    if (!options) keyItemFindFatal(err + "no options");
    if (!options.keyAttributeName) keyItemFindFatal(err + "no options.attributeName");

    prefix = "AWSWrapper.keyItemFind('" + tableName + "', '" + options.keyAttributeValue + "') ";

    var defer = Q.defer();

    // We return an array of items; initialize the array.
    var retVals = [];

    // This item is one to be returned: process it.
    function processOneItem(item) {
        // We return an object for this item.
        var oneVal = {};
        for (var itemProp in item) {
            var propItem = item[itemProp];

            // Each property in the the item has to be an object, with a string.
            if (typeof propItem !== "object") keyItemFindFatal("property '" + itemProp + "'is not object, it's " + typeof propItem);

            // For now we assume everything is a string.
            if (!propItem.S) keyItemFindFatal("property '" + itemProp + "' doesn't have 'S' property");

            // Add this property to the returned item.
            oneVal[itemProp] = propItem.S;
        }

        // The item has to have the keyAttribute.
        if (!oneVal[options.keyAttributeName])
            keyItemFindFatal("no keyAttribute '" + options.keyAttributeName + "'in one of the returned items");

        retVals.push(oneVal);
    }


    // This is the function that gets passed to the query.
    function scanFunc(err, data) {
        self._log.debug(prefix + "returned from DB.query");

        // Any error returned from the database is fatal.
        if (err) keyItemFindFatal(err);

        // If we can't find any, we just reject.
        if (data.Count === 0) {
            self._log.debug(prefix + " resolved empty");
            defer.resolve(retVals);
            return;
        }

        // If we find more than one given a value, this means the database is corrupt or we
        // managed to get two records with the same key: that's *really* bad.
        if (data.Count > 1 && options.keyAttributeValue)
            keyItemFindFatal("more than one record with '" + options.keyAttributeValue + "'");

        // If there isn't an Items array or its size doesn't match Count, something is really wrong.
        if (!data.Items || !(data.Items instanceof Array) || (data.Items.length !== data.Count)) {
            self._log.debug(JSON.stringify(data));
            keyItemFindFatal("Items don't match count!");
        }

        self._log.debug(prefix + "found " + data.Count + " items");

        // We'll return an array with the item values, stripping the types.
        for (var di = 0; di < data.Items.length; di++) {
            var item = data.Items[di];

            self._log.verbose("     " + JSON.stringify(item));

            // The item has to have the keyAttribute
            var foundKeyAttribute = false;

            // We return an object for this item.
            processOneItem(item);
        }

        // Done.
        self._log.verbose(prefix + "returned: " + JSON.stringify(retVals));
        defer.resolve(retVals);
    }

    function getFunc(err, data) {
        self._log.debug(prefix + "returned from DB.query");

        // Any error returned from the database is fatal.
        if (err) keyItemFindFatal(err);

        // It should return one or zero items.
        if (Object.keys(data).length === 0) {
            defer.reject("not-found");
            return;
        }

        self._log.verbose(JSON.stringify(data));

        // We're returning one item.
        if (!data.Item) keyItemFindFatal("no Item in single return");
        processOneItem(data.Item);

        defer.resolve(retVals);
    }

    if (options.keyAttributeValue) {
        // We're querying for a certain value
        self._log.verbose(prefix + "getting item...");

        // We're getting an item given the primary key
        var getOptions = {
            TableName: tableName,
            Key: {}
        };
        getOptions.Key[options.keyAttributeName] = { 'S': options.keyAttributeValue };

        self._DB.getItem(getOptions, getFunc);
    } else {
        // We're returning all the values.
        self._log.verbose(prefix + "scanning...");

        // Set up the query's basic params.
        var scanOptions = {
            TableName: tableName
        };

        self._DB.scan(scanOptions, scanFunc);
    }

    return defer.promise;
};

/*
* Delete an item, assuming key attribute, string and EQ.
*
* No items: resolved "did-not-exist"
* Item deleted successfully: resolved "deleted"
*
* @method keyItemDeleted
* @param tableName
* @param options 
*     * attributeName (assumed to be key)
*     * [attributeValue] (assumed to be EQ); if doesn't exist, deletes all
*
*/

AWSWrapper.prototype.keyItemDelete = function(tableName, options) {
    var self = this;
    var prefix = "AWSWrapper:keyItemDelete('" + tableName + "') ";
    self._log.debug(prefix + "called");

    // Any issues, we bail and throw.
    function keyItemDeleteFatal(err) {
        var msg = prefix + " " + err + "!";
        self._log.fatal(msg);
        throw new Error(msg);
    }

    if (!awsDB) keyItemDeleteFatal("no DB!");
    if (!tableName) keyItemDeleteFatal("no tablename");
    if (!options) keyItemDeleteFatal(err + "no options");
    if (!options.keyAttributeName) keyItemDeleteFatal(err + "no options.attributeName");

    prefix = "AWSWrapper:keyItemDelete('" + tableName + "', '" + options.keyAttributeValue + "') ";

    var defer = Q.defer();

    // This is the function that gets passed to the query.
    function deleteFunc(err, data) {
        self._log.debug(prefix + "returned from DB.deleteItem");

        // Any error returned from the database is fatal.
        if (err) keyItemDeleteFatal(err);

        defer.resolve("deleted");
    }

    // Set up the query.
    var deleteOptions = {
        TableName: tableName,
        Key: {}
    };
    deleteOptions.Key[options.keyAttributeName] = { "S": options.keyAttributeValue || "*" };

    self._log.debug(prefix + "calling deleteItem");
    self._DB.deleteItem(deleteOptions, deleteFunc);

    return defer.promise;
};


AWSWrapper.prototype.itemAdd = function(tableName, options) {
    var self = this;
    self._log.debug("itemAdd('" + tableName + "')");

    var prefix = "AWSWrapper:itemAdd('" + tableName + "')";

    // Any issues, we bail and throw.
    function itemAddFatal(err) {
        var msg = prefix + " " + err;
        self._log.fatal(msg);
        throw new Error(msg);
    }

    if (!awsDB) itemAddFatal("without DB!");
    if (!options) itemAddFatal("without options!");
    if (!options.keyAttributeName) itemAddFatal("without options.keyAttributeName!");
    if (!options.item) itemAddFatal("without options.item!");
    if (!options.item[options.keyAttributeName]) itemAddFatal("with item not containing key attribute!");
    if (typeof options.item[options.keyAttributeName] !== "string") itemAddFatal("with item key attribute not a string!");

    var defer = Q.defer();

    function itemAddFunc(err, data) {
        self._log.debug(prefix + "returned from DB.putItem");

        // Any error returned from the database is fatal.
        if (err) itemAddFatal(err);

        defer.resolve(options.item);

    }

    // Set up the basic query
    var putOptions = {
        TableName: tableName,
        Item: {}
    };

    // We have to go through the properties of the item and massage them.
    for (var iProp in options.item) {
        var val = options.item[iProp];
        if (typeof val !== "string") itemAddFatal(prefix + "item property not a string");
        putOptions.Item[iProp] = { 'S': val };
    }

    self._log.debug(prefix + "calling putItem");
    self._DB.putItem(putOptions, itemAddFunc);

    return defer.promise;
};



/*
*  This table is known not to exist: create it
*/
AWSWrapper.prototype._createTable = function(tableName, keyAttributeName, defer) {
    var self = this;

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
            if (status === "ACTIVE" || status === "UPDATING") {
                self._log.debug("_waitForCreateToFinish('" + tableName + "') done!");
                defer.resolve(status);
            } else if (status == "CREATING")
                setTimeout(function() { self._waitForCreateToFinish(tableName, defer); }, 500);
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
                setTimeout(function() { self._waitForDeletToFinish(tableName, defer); }, 500);
        },
        function(err) {
            defer.reject(err);
        }
    );
    return defer.promise;
};


module.exports = AWSWrapper;
