/*
* @class PGDB
*
* Dynamo DB wrapper for paigow, base class
*
*/


// Get the SDK and make sure it's set to the right thing.
var AWS = require('aws-sdk');

// Don't need to do this.
// AWS.config.update({ accessKeyId: "myKeyId", secretAccessKey: "secretKey", region: "us-east-1" });

// One global DB, subclasses use it.
var DB;
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_ENDPOINT)
    console.log("ERROR cannot start dynamoDB: environment variables are not set up!");
else
    DB = new AWS.DynamoDB({ endpoint: new AWS.Endpoint(process.env.AWS_ENDPOINT) });

/*
* @constructor PGDB
*
*/
function PGDB() {
    this._DB = DB;
}

/*
* Return the DB used (more for testing than anything else)
*
* @method DB
*
*/
PGDB.prototype.DB = function() {
    return this._DB;
};

module.exports = PGDB;
