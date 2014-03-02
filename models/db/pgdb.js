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

    // This is what gets updated by 'set' and retrieved by 'get'.
    this._props = {};

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
    var prefix = "PGDB.find('" + self.fullTableName() + "') ";
    self._log.debug(prefix + "called");

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
    var prefix = "PGDB.delete('" + self.fullTableName() + "') ";
    self._log.debug(prefix + "called");

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
    var prefix = "PGDB.add('" + self.fullTableName() + "') ";
    self._log.debug(prefix + "called");

    var options = {
        item: item,
        keyAttributeName: self._keyAttributeName
    };
    var promise = self._awsWrapper.itemAdd(self.fullTableName(), options);

    // Make sure we keep track of what was set, if it succeeded.
    promise.then(function(data) {
        for (var propName in item)
            self._props[propName] = item[propName];
    });
    return promise;
};

/*
* Add an item, assumed string, assumed key
*
*/
PGDB.prototype.update = function(item, options) {
    var self = this;
    var prefix = "PGDB.update('" + self.fullTableName() + "') ";
    self._log.debug(prefix + "called");

    // Set the props now, but reset them if we fail.
    var oldProps;
    if (!options || !options.internal) {
        oldProps = self._props;
        self._props = item;
    }

    var updateOptions = {
        item: self._props,
        keyAttributeName: self._keyAttributeName
    };
    var promise = self._awsWrapper.itemUpdate(self.fullTableName(), updateOptions);

    // Make sure we keep track of what was set, if it succeeded.
    if (!options || !options.internal) {
        promise.fail(function(data) { self._props = oldProps; });
    }
    return promise;
};

/*
* Get a property
*
*/
PGDB.prototype.get = function(propName) {
    var self = this;
    var prefix = "PGDB.get('" + self.fullTableName() + "', " + propName + "') ";
    self._log.debug(prefix + "called");

    return self._props[propName];
};

/*
* Set a property
*
*/
PGDB.prototype.set = function(propName, propVal) {
    var self = this;
    var prefix = "PGDB.set('" + self.fullTableName() + "', " + propName + "') ";
    self._log.debug(prefix + "called");

    // Reset the props but in the internal call we don't have to update
    // all the props.  Also we set the value so retrieval will get it,
    // but we'll unset it if the update failed.
    var promise;
    if (self._props[propName] !== propVal) {
        self._log.debug(prefix + "new value: " + propVal);
        var oldVal = self._props[propName];
        if (typeof propVal === "undefined")
            delete self._props[propName];
        else
            self._props[propName] = propVal;
        promise = self.update(self._props, {internal:true});
        promise.fail( function(data) {
            self._log.error(prefix + "new value FAILED");
            if (typeof oldVal === "undefined")
                delete self._props[propName];
            else
                self._props[propName] = oldVal;
        });
    } else {
        self._log.debug(prefix + "unchanged");
        var defer = Q.defer();
        defer.resolve();
        promise = defer.promise;
    }

    return promise;
};

module.exports = PGDB;
