/*
*
* @class PGDBPlayer
*
* This file defines the PGDBPlayer class.
*
* A player is a person that plays.
*/

// Module dependencies.
var Q = require('q'),
    PGDB = require('./pgdb'),
    util = require('util'),
    PasswordHash = require('password-hash');

/*
* @constructor PGDBPlayer
* @extends PGDB
*
*/

function PGDBPlayer() {
    PGDB.call(this, 'Players');
    var self = this;

    // Original username is 'unknown'.
    this._username = "unknown";

    // Initialize the table, with username as the hash string.
    this.init('username');
}

// Extend from PGDB.
util.inherits(PGDBPlayer, PGDB);

PGDBPlayer.prototype.fetchUsername = function(username) {
    var self = this;
    var defer = Q.defer();

    console.log("PGDBPlayer:fetchUsername('" + username + "')");

    self._initPromise.then(
        function() {
            try {
                // Do we have a username?  If not, we don't need to look.
                if (!username || username === "unknown") {
                    console.log("PGDBPlayer:fetchUsername('" + username + "') unknown: rejected");
                    defer.reject("unknown!");
                } else {
                    // We have a username: the only time we're initialized with a username that is
                    // not unknown is when it's rememberd in the session cookie -- we don't need
                    // to check against the password, we only need to remember it.
                    self._DB.query({
                        TableName: self.fullTableName(),
                        ConsistentRead: true,
                        Select: "ALL_ATTRIBUTES",
                        KeyConditions: {
                            'username' : {
                                AttributeValueList: [{'S': username}],
                                ComparisonOperator: 'EQ'
                            }
                        }
                    }, function(err, data) {
                        console.log("PGDBPlayer:fetchUsername('" + username + "') returned from DB.query");
                        if (err) {
                            console.log("PGDBPlayer:fetchUsername('" + username + "') FATAL error: " + err);
                            defer.reject("bad-err " + err);
                        } else if (data.Count === 0) {
                            // Can't find the user
                            console.log("PGDBPlayer:fetchUsername('" + username + "') not-found");
                            defer.reject("not-found");
                        } else if (data.Count > 1) {
                            // Can't find the user
                            console.log("PGDBPlayer:fetchUsername('" + username + "') FATAL: returned " + data.Count + " users!");
                            defer.reject("too-many-found");
                        } else if (!data.Items || !(data.Items instanceof Array) || (data.Items.length !== 1)) {
                            console.log("PGDBPlayer:fetchUsername('" + username + "') FATAL: Items don't match count!");
                            defer.reject("aws-sdk-corrupted");
                        } else {
                            var item = data.Items[0];
                            if (!item.username || (typeof item.username !== "object") || !item.hashedPassword || (typeof item.hashedPassword !== "object")) {
                                console.log("PGDBPlayer:fetchUsername('" + username + "') FATAL: no username or password in returned item!");
                                defer.reject("item-corrupted");
                            } else if (!item.username.S || !item.hashedPassword.S) {
                                console.log("PGDBPlayer:fetchUsername('" + username + "') FATAL: empty username or password in returned item!");
                                defer.reject("empty-username");
                            } else {
                                // Success!  This is the user, remember it.
                                console.log("PGDBPlayer:fetchUsername('" + username + "') success");
                                defer.resolve({username: item.username.S, hashedPassword: item.hashedPassword.S});
                            }
                        }
                    });
                }
            } catch(exc) {
                console.log("PGDBPlayer:fetchUsername('" + username + "') caught exception: " + exc);
                defer.reject(exc);
            }
        },
        function(err) {
            // initPromise failed: we can't do any DB stuff.
            defer.reject(err);
        }
    );


    return defer.promise;
};

PGDBPlayer.prototype.verifySessionUsername = function(username) {
    var self = this;
    var fetchPromise = self.fetchUsername(username);

    // We get first dibs on the promise; we return the same promise but by
    // the time our caller does a .then() on it, we've already done ours.
    // If there was a problem and it was rejected, we don't care, but our
    // client should handle the rejection.
    fetchPromise.then(function(user) {
        self._username = username;
    });

    return fetchPromise;
};

PGDBPlayer.prototype.verifyPostedUsernameAndPassword = function(postedUsername, postedPassword) {
    var self = this;
    var defer = Q.defer();

    self._initPromise.then(
        function() {
            // I guess our old username isn't valid.
            delete self._username;

            // Fetch it and check the password.
            self.fetchUsername(postedUsername).then(
                function(userInDB) {
                    console.log("PGDBPlayer:verifyPostedUsernameAndPassword('" + postedUsername + "') returned from fetchUsername");
                    console.log("PGDBPlayer:verifyPostedUsernameAndPassword('" + postedUsername + "') fetchUserName returned: " + JSON.stringify(userInDB));
                    if (userInDB.username === postedUsername) {
                        console.log("PGDBPlayer:verifyPostedUsernameAndPassword('" + postedUsername + "') matching name");
                        if (PasswordHash.verify(postedPassword, userInDB.hashedPassword)) {
                            console.log("PGDBPlayer:verifyPostedUsernameAndPassword('" + postedUsername + "') password match success");
                            self._username = postedUsername;
                            defer.resolve({username: postedUsername, password: postedPassword});
                        } else {
                            console.log("PGDBPlayer:verifyPostedUsernameAndPassword('" + postedUsername + "') password mismatch");
                            defer.reject();
                        }
                    } else {
                        console.log("PGDBPlayer:verifyPostedUsernameAndPassword('" + postedUsername + "') FATAL username mismatch");
                        defer.reject();
                    }
                },
                function(err) {
                    console.log("PGDBPlayer:verifyPostedUsernameAndPassword('" + postedUsername + "') fetchUsername err: " + err);
                    defer.reject();
                });
        },
        function(err) {
            // initPromise failed: we can't do any DB stuff.
            defer.reject(err);
        }
    );

    return defer.promise;
};

/*
* @method registerNewUser
*
* @param postedUsername {string} the name of the user
* @param postedPassword {string} the password
*
* Returns a promise that, if resolved, means the user has been saved.
* If rejected, 'err' param to .fail() it has several possible values:
*     "name-exists": the name already exist
*     "fetch-error ...": some internal error looking to see if it was duplicate, prefix plus error
*     "save-error ...": some internal error trying to add the new users, prefix plus error.
*/
PGDBPlayer.prototype.registerNewUser = function(postedUsername, postedPassword) {
    var self = this;
    var defer = Q.defer();

    console.log("PGDBPlayer.registerNewUser('" + postedUsername + "')");

    self._initPromise.then(
        function() {
            try {
                // Can't have duplicates.
                // TODO: use 'Exists' in the 'Expected' property to avoid duplicates
                self.fetchUsername(postedUsername).then(
                    function() {
                        console.log("PGDBPlayer.registerNewUser rejected: name exists");
                        defer.reject("name-exists");
                    },
                    function(err) {
                        if (err === "not-found") {
                            // Good, we didn't find it, we can add it.
                            try {
                                self._DB.putItem({
                                    TableName: self.fullTableName(),
                                    Item: {
                                        username: { 'S': postedUsername },
                                        hashedPassword: { 'S': PasswordHash.generate(postedPassword) }
                                    }
                                }, function(err, data) {
                                    if (err) {
                                        console.log("FATAL error trying to add username " + postedUsername + ": " + err);
                                        defer.reject("save-error " + err);
                                    } else {
                                        // Success!
                                        defer.resolve(postedUsername);
                                    }
                                });
                            } catch(exc2) {
                                console.log("DB.putItem threw exc " + exc2);
                            }
                        } else {
                            // Uh-oh, some other kind of error, bad news.
                            console.log("FATAL error trying to fetch username " + postedUsername + ": " + err);
                            defer.reject("fetch-error " + err);
                        }
                    }
                );
            } catch(exc) {
                console.log("registerNewUser threw: " + exc);
            }
        },
        function(err) {
            // initPromise failed: we can't do any DB stuff.
            defer.reject(err);
        }
    );

    return defer.promise;
};

PGDBPlayer.prototype.deleteUser = function(username) {
    var self = this;
    var defer = Q.defer();


    console.log("PGDBPlayer.deleteUser('" + username + "')");

    self._initPromise.then(
        function() {
            try {
                self._DB.deleteItem({
                    TableName: self.fullTableName(),
                    Key: {
                        username: { 'S': username },
                    }
                }, function(err, data) {
                    defer.resolve();
                });
            } catch(exc) {
                console.log("PGDBPlayer.deleteUser threw: " + exc);
            }
        },
        function(err) {
            // initPromise failed: we can't do any DB stuff.
            defer.reject(err);
        }
    );

    return defer.promise;
};

PGDBPlayer.prototype.currentUsername = function() {
    return this._username;
};

module.exports = PGDBPlayer;
