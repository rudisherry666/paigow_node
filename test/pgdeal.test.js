var assert = require('assert'),
    PGTile = require('../models/pgtile'),
    PGDeal = require('../models/pgdeal');

describe('PGDeal', function() {
    var tileEleven = new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1),
        tileEight = new PGTile(PGTile.prototype.TILE_INDEX.MIXED_EIGHT_1),
        tileDay = new PGTile(PGTile.prototype.TILE_INDEX.DAY_2),
        tileFour = new PGTile(PGTile.prototype.TILE_INDEX.HARMONY_FOUR_1);
    it('should return a PGDeal object', function() {
        var pgDeal = new PGDeal([tileEleven, tileEight, tileDay, tileFour]);
        assert.notEqual(pgDeal, null);
        pgDeal = new PGDeal(tileEleven, tileEight, tileDay, tileFour);
        assert.notEqual(pgDeal, null);
    });
    it('should throw on bad constructor params', function() {
        var pgDeal;
        assert.throws(function() {
            pgDeal = new PGDeal(tileDay);
        });
        assert.throws(function() {
            pgDeal = new PGDeal([tileDay]);
        });
        assert.throws(function() {
            pgDeal = new PGDeal();
        });
    });
});
