/*
* @class PGDB
*
* Dynamo DB wrapper for paigow, base class
*
*/


// Get the SDK and make sure it's set to the right thing.
var PGLog = require('../../utils/pglog'),
    Q = require('q'),
    AWSWrapper = require('./awswrapper');

// One global prefix; all tables will be prefixed with this name.
// This is used for tests usually.
var gDBPrefix = "";

/*
* @constructor PGDB
*
*/
function PGDB(tableName, keyAttributeName) {
    this._log = new PGLog("PGDB", 'debug');
    if (!tableName) throw new Error("PBDB: no table name!");
    if (!keyAttributeName) throw new Error("PBDB: no keyAttribute name!");
    this._awsWrapper = new AWSWrapper();
    this._tableName = tableName;
    this._keyAttributeName = keyAttributeName;

    this._init();
}

/*
* Return the promise that's resolved when it's created
*
* @method created
*/
PGDB.prototype.created = function() {
    return this._initPromise;
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
    return gDBPrefix + this._tableName;
};

/*
* Initialize the table
*
* @method init
*
* @param keyAttributeName {string}: assumed to be string and HASH
* @return promise that resolves to 'this'
*/
PGDB.prototype._init = function() {
    var self = this;
    self._log.debug("PGDB._init called for '" + self.fullTableName() + "'");

    var defer = Q.defer();

    // Create the AttributeName from the input Attributes.
    self._awsWrapper.tableCreate(self.fullTableName(), self._keyAttributeName).then(
        function() { defer.resolve(self); },
        function(err) { defer.reject(err); }
    );

    // Nothing happens until this promise is done.
    this._initPromise = defer.promise;
};

/*
* Find an item, assumed string, assumed key, assumed equal
*
*/
PGDB.prototype.find = function(keyValue) {
    var self = this;
    self._log.debug("PGDB.find called for '" + self.fullTableName() + "'");

    var options = { keyAttributeName: self._keyAttributeName };
    if (keyValue) options.keyAttributeValue = keyValue;
    return self._awsWrapper.keyItemFind(self.fullTableName(), options);
};

/*
* Delete an item, assumed string, assumed key
*
*/
PGDB.prototype.delete = function(keyValue) {
    var self = this;
    self._log.debug("delete");

    var options = { keyAttributeName: self._keyAttributeName };
    if (keyValue) options.keyAttributeValue = keyValue;
    return self._awsWrapper.keyItemDelete(self.fullTableName(), options);
};

/*
* Add an item, assumed string, assumed key
*
*/
PGDB.prototype.add = function(item) {
    var self = this;
    self._log.debug("add");

    var options = {
        item: item,
        keyAttributeName: self._keyAttributeName
    };
    return self._awsWrapper.itemAdd(self.fullTableName(), options);
};

module.exports = PGDB;
