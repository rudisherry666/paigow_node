var PGDBPlayer = require('../../models/db/pgdbplayer'),
    assert = require('assert');


describe('PGDBPlayer', function() {

    it('should return unknown username', function () {
        var pgdbPlayer = new PGDBPlayer();
        assert.equal(pgdbPlayer.currentUsername(), "unknown");
    });

});
