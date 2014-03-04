/*
* @class DeferSeq
*
* Sequential defer wrapper.  This allows chaining of defers and will execute the
* functions in the order they're added, classified by a single key.  The functions
* are called with three parameters: the defer they need to resolve or reject,
* any error from the previous defer for this key, and input params they specify.
*/

var Q = require('q'),
    PGLog = require('./pglog'),
    PGUtils = require('./pgutils');

var dsPGLog = new PGLog('deferseq', 'debug');

// The keys for this defer.
var dsKeys = {};

// Pull a defer off the list, because it's done; it had better be the first on the list.
// The 'defer' param is paranoia: if our logic is correct it will always be first on 
// the list, but let's be extra-careful.
function removeDoneDefer(key, defer) {
    var prefix = "removeDoneDefer('" + key + "') ";

    function removeFatal(err) {
        dsPGLog.fatal(prefix + err + "!");
        throw new Error(prefix + err);
    }
    var keyDefers = dsKeys[key];

    if (!keyDefers) removeFatal("no key for removing defer");
    if (keyDefers.length < 1) removeFatal("no defers on list for removing defer");
    if (keyDefers[0] !== defer) removeFatal("trying to remove non-first on the list");

    // Remove it from the list.  We've already verified it's first, so use shift.
    keyDefers.shift();
}

// Add a function for a key

module.exports = {

    /*
    * @method add
    *
    * @param key {string} the key for this, to be put in the list of that key
    * @param {func(defer, err, params)} the function to be called when it's time
    * @param params {anything} the params to call the function with
    */
    add: function(key, func, params) {

        dsPGLog.debug("add called");

        // Every func gets a new defer.
        var defer = Q.defer();

        // Get the defers for this key, or create them if they don't exist.
        var keyDefers = dsKeys[key];
        if (!keyDefers)
            keyDefers = dsKeys[key] = [];

        dsPGLog.debug("already " + keyDefers.length + " defers on list");

        // Get the previous defer so we can trigger executing this func when it's done.
        var lastDefer = keyDefers.length > 0 ? keyDefers[keyDefers.length-1] : null;
        if (!lastDefer)
            lastDefer = PGUtils.resolvedDefer();

        // Add this defer to the defer list.
        keyDefers.push(defer);

        // When this defer is done, the first thing we do is take it off the list.
        // We have to use .then() rather than done because all the then()s get
        // executed before done.  We want to it on rejection or success.
        defer.promise.then(
            function() { removeDoneDefer(key, defer); },
            function() { removeDoneDefer(key, defer); }
        );

        // Set up to execute this function when the previous defer is done.
        lastDefer.promise.then(
            function(data) {
                func(defer, null, params);
            },
            function(err) {
                dsPGLog.error("rejected defer from '" + key + "': " + err);
                func(defer, err, params);
            }
        );
    }
};

