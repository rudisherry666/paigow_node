var before = require('../before.test'),
    assert = require('assert'),
    PGDBGame = require('../../models/db/pgdbgame');

console.log("test: PGDBGame");

describe('PGDBGame', function() {

    it('should return a PGDBGame object', function() {
        var pgdbGame = new PGDBGame();
        assert.notEqual(pgdbGame, null);
    });
});
