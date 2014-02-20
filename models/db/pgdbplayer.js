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
    PGDB.call(this);
    var self = this;

    self._tableName = 'Players';
    self.init();
}

// Extend from PGDB.
util.inherits(PGDBPlayer, PGDB);


PGDBPlayer.prototype.init = function() {
    var defer = Q.defer();

    // Find out if we have a table, by describing it.
    var self = this;
    self._DB.describeTable({ TableName: self._tableName}, function(err, data) {
        if (err) {
            if (err.code && err.code === 'ResourceNotFoundException') {
                // We don't have the table: create it.
                self._DB.createTable({
                    TableName: self._tableName,
                    AttributeDefinitions: [
                        { AttributeName: 'username', AttributeType: "S" }
                    ],
                    KeySchema: [
                        { AttributeName: 'username', KeyType: "HASH" }
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    }
                }, function(err, data) {
                    if (err) {
                        console.log('FATAL Players table createTable: ' + err);
                        defer.reject();
                    } else {
                        console.log("PGDBPlayer created player table, status is " + data.TableDescription.TableStatus);
                        defer.resolve();
                    }
                });
            } else {
                // Hmm, some other error: that's _really_ bad.
                console.log('FATAL Players table describeTable unrecognized error: ' + err);
                defer.reject();
            }
        } else {
            // We have a table!
            console.log("PGDBPlayer found existing player table, status is " + data.Table.TableStatus);
            defer.resolve();

            // See if we have a user of this name
        }
    });

    return defer.promise;
};

PGDBPlayer.prototype.fetchUsername = function(username) {
    var defer = Q.defer();

        // Do we have a username?  If not, we don't need to look.
    if (!username || username === "unknown")
        defer.reject("unknown");
    else {
        // We have a username: the only time we're initialized with a username that is
        // not unknown is when it's rememberd in the session cookie -- we don't need
        // to check against the password, we only need to remember it.
        self._DB.query({
            TableName: self._tableName,
            ConsistentRead: true,
            Select: "ALL_ATTRIBUTES",
            KeyConditions: {
                'username' : {
                    AttributeValueList: [{'S': username}],
                    ComparisonOperator: 'EQ'
                }
            }
        }, function(err, data) {
            if (err) {
                if (err.code && err.code === 'ResourceNotFoundException') {
                    // Can't find the user: could have been deleted.
                    console.log("PGDBPlayer cannot find " + username);
                    defer.reject("not-found");
                } else {
                    console.log('FATAL Players trying to find user: ' + username);
                    defer.reject("bad-err " + err);
                }
            } else {
                // Success!  This is the user, remember it.
                defer.resolve(data);
            }
        });
    }

    return defer;
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

    // I guess our old username isn't valid.
    delete self._username;

    // Fetch it and check the password.
    self.fetchUsername(username).then(function(userInDB) {
        if (user.username === postedUsername)
            if (PasswordHash.verify(postedPassword, userInDB.hashedPassword)) {
                self._username = postedUsername;
                defer.resolve(self._username);
            } else {
                console.log("Bad password entered for username " + postedUsername);
                defer.reject();
            }
        else {
            console.log("FATAL UH-OH: internal logic found user: " + JSON.stringify(userInDB) + " that didn't match username: " + postedUsername);
            defer.reject();
        }
    }).fail(function() { defer.reject(); });

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

    // Can't have duplicates.
    // TODO: use 'Exists' in the 'Expected' property to avoid duplicates
    self.fetchUsername(postedUsername).then( function() { defer.reject("name-exists"); }).fail(function(err) {
        if (err === "not-found") {
            // Good, we didn't find it, we can add it.
            self._DB.putItem({
                TableName: self._tableName,
                Item: {
                    username: { 'S': postedUserName },
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
        } else {
            // Uh-oh, some other kind of error, bad news.
            console.log("FATAL error trying to fetch username " + postedUsername + ": " + err);
            defer.reject("fetch-error " + err);
        }
    });

    return defer;
};

PGDBPlayer.prototype.getCurrentUsername = function() {
    return this._username;
};



// // var PGPlayerModels = Backbone.DynamoDB.Collection.extend({
// //     model: PGPlayerModel,
// //     url: '/players'
// // });

// module.exports = {
//     // Get the player that's in the session: make sure it matches something
//     // in the database.
//     getSessionPlayer: function(req) {
//         console.log("Getting player");
//         var defer = q.defer();
//         if (!req.session.username || req.session.username === "unknown") {
//             console.log("No player, rejected");
//             defer.reject();
//         } else {
//             console.log("Using player username: " + req.session.username);
//             var pgPlayerModel = new PGPlayerModel({username: req.session.username});
//             pgPlayerModel.fetch({
//                 dynamodb: {
//                     ConsistentRead: true
//                 },
//                 success: function(pgPlayer, response) {
//                     defer.resolve(pgPlayer);
//                 },
//                 error: function(pgPlayer, response) {
//                     // response = {code: 'NotFound'} if the user was not found
//                     console.log("Cannot fetch 1: " + response.code);
//                     defer.reject(response.code);
//                 }
//             });
//         }
//         return defer.promise;
//     },

//     // User has sent username and password: does it match?
//     matchSessionPlayer: function(postedPlayer) {
//         console.log("Checking player: " + JSON.stringify(postedPlayer));
//         var defer = q.defer();
//         if (    !postedPlayer ||
//                 !postedPlayer.username ||
//                 postedPlayer.username === "unknown" ||
//                 !postedPlayer.password)
//             defer.reject();
//         else {
//             var pgPlayerModel = new PGPlayerModel({username: player.username});
//             pgPlayerModel.fetch({
//                 dynamodb: {
//                     ConsistentRead: true
//                 },
//                 success: function(pgPlayer, response) {
//                     if (PasswordHash.verify(postedPlayer.password, pgPlayer.hashedPassword))
//                         defer.resolve(pgPlayer);
//                     else
//                         defer.reject("password does not match");
//                 },
//                 error: function(pgPlayer, response) {
//                     // response = {code: 'NotFound'} if the user was not found
//                     console.log("Cannot fetch 2: " + response.code);
//                     defer.reject(response.code);
//                 }
//             });
//         }
//         return defer.promise;
//     },

//     setSessionPlayer: function(newPGPlayer) {
//         var pgPlayer = {
//             username: newPGPlayer.username,
//             hashedPassword: PasswordHash.generate(newPGPlayer.password)
//         };
//         console.log("Saving player: " + JSON.stringify(pgPlayer));
//         var defer = q.defer();
//         var pgPlayerModel = new PGPlayerModel(pgPlayer);
//         pgPlayerModel.save({}, {
//             success: function(pgPlayer, response) {
//                 // req.session.username = pgPlayer.username;
//                 defer.resolve(pgPlayer);
//             },
//             error: function(pgPlayer, response) {
//                 console.log("Cannot save: " + JSON.stringify(response));
//                 defer.reject(response.code);
//             }
//         });
//         return defer.promise;
//     }
// };

module.exports = PGDBPlayer;
