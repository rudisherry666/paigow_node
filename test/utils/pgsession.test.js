var assert = require('assert'),
    PGSession = require('../../utils/pgsession');

console.log("test: PGSession");

describe('PGSession', function() {
    var req = {
        session: {}
    };

    it('should return a PGSession object', function() {
        var session = PGSession.session(req);
        assert.notEqual(session, null);
    });
    it('should remember objects', function() {
        var session = PGSession.session(req);
        PGSession.set(req, 'foo', 'bar');
        assert.equal(PGSession.get(req, 'foo'), 'bar');
    });
});
