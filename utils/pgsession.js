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

// One hour after last touch, session runs out: every call is a touch.
function touchSession(session) {
    session.lastTouch = Date.now();
}

// Check every 5 minutes
function checkSessionsForTimeout(e) {
    var now = Date.now();

    var sessionIDs = Object.keys(pgSessions);
    for (var si = 0; si < sessionIDs.length; si++) {
        sessionID = sessionIDs[si];
        var lastTouch = pgSessions[sessionID].lastTouch;
        if (!lastTouch) {
            pgSessionLog.error("Session without lastTouch: " + sessionID);
            lastTouch = 0;
        }
        if ((now - lastTouch) > (60 * 60 * 1000)) {
            pgSessionLog.log("Session timeout: " + sessionID);
            delete pgSessions[sessionID];
        }
    }
    setTimeout(checkSessionsForTimeout, 5 * 60 * 1000);
}
checkSessionsForTimeout();

// It's a singleton so everything is PGSession.blah(sessionID, whatever)
module.exports = {

    // Given req.session, create a new session or get the old.
    session: function(req) {

        if (!req.session) throw new Error("no req.session to use!");
        var session = sessionFromReq(req);
        if (session) {
            touchSession(session);
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
        touchSession(session);
        return session.key;
    },

    set: function(req, key, value) {
        var session = this.session(req);
        if (!session) throw new Error("no session for set");
        touchSession(session);
        session.key = value;
    }
};
