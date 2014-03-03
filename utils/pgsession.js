/*
*
* @class PGSession
*
* Poor-man's session management.
*/

var crypto = require('crypto'),
    Q = require('q'),
    PGLog = require('./pglog');

// This is a map from some randomized string to the session object.
var pgSessions = {};

var pgSessionLog = new PGLog("pgsession", 'debug');

function sessionFromReq(req) {
    if (req.session.sessionID) {
        if (pgSessions[req.session.sessionID])
            return pgSessions[req.session.sessionID];
        else
            delete req.session.sessionID;
    }
    return null;
}

// It's a singleton so everything is PGSession.blah(sessionID, whatever)
module.exports = {

    // Given req.session, create a new session or get the old.
    session: function(req) {

        if (!req.session) throw new Error("no req.session to use!");
        var session = sessionFromReq(req);
        if (session) {
            pgSessionLog.debug("found existing session");
            return session;
        }

        // Expired or new session.  Create a new one, empty.  This will throw
        // if it can't get the bytes.  Too bad.
        var sessionID = crypto.randomBytes(32).toString('base64');
        pgSessionLog.debug("new sessionID: " + sessionID);
        req.session.sessionID = sessionID;
        pgSessions[sessionID] = {};
        return pgSessions[sessionID];
    },

    get: function(req, key) {
        var session = this.session(req);
        if (!session) throw new Error("no session for get");
        return session.key;
    },

    set: function(req, key, value) {
        var session = this.session(req);
        if (!session) throw new Error("no session for set");
        session.key = value;
    }
};
