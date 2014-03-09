var before = require('../before.test'),
    assert = require('assert'),
    PGTile = require('../../models/pgtile'),
    PGHand = require('../../models/pghand');

console.log("test: PGHand");

describe('PGHand', function() {
    var tileEleven = new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1),
        tileEight = new PGTile(PGTile.prototype.TILE_INDEX.MIXED_EIGHT_1),
        tileDay = new PGTile(PGTile.prototype.TILE_INDEX.DAY_2),
        tileFour = new PGTile(PGTile.prototype.TILE_INDEX.HARMONY_FOUR_1);
    it('should return a PGHand object', function() {
        var pgHand = new PGHand(tileEleven, tileEight);
        assert.notEqual(pgHand, null);
        pgHand = new PGHand([tileEleven, tileEight]);
        assert.notEqual(pgHand, null);
    });
    it('should throw on bad constructor params', function() {
        var pgHand;
        assert.throws(function() {
            pgHand = new PGHand(tileDay);
        });
        assert.throws(function() {
            pgHand = new PGHand('Hello world');
        });
        assert.throws(function() {
            pgHand = new PGHand([tileEleven]);
        });
        assert.throws(function() {
            pgHand = new PGHand(TileFour, { _index: 1});
        });
    });
    it('should return a tiles array', function() {
        var pgHand = new PGHand(tileFour, tileDay);
        var tiles = pgHand.tiles();
        assert(tiles instanceof Array);
        assert(tiles.length === 2);
        assert.equal(tiles[0], tileDay);
        assert.equal(tiles[1], tileFour);
    });
    it('should have a rank and value', function() {
        var pgHand = new PGHand(tileFour, tileEight);
        assert(pgHand.rank() >= 0);
        assert.equal(pgHand.value(), 2);
        assert.equal(pgHand.name(), "2");
        pgHand = new PGHand(tileEight, tileDay);
        assert(pgHand.rank() >= 0);
        assert.equal(pgHand.name(), "gong");
    });
});
