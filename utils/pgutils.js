/*
* @class PGUtils
*
* Misc utils.
*/

var Q = require('q');

// A defer that's already resolved so we don't have to keep creating it.
// Resolve it with something that identifies it as ours in case some
// coding error things it's something else.
var utilsResolvedDefer = Q.defer();
utilsResolvedDefer.resolve("PGUtils resolved defer");

module.exports = {
    resolvedDefer: function() {
        return utilsResolvedDefer;
    }
};

