var assert = require('assert'),
    PGTile = require('../models/pgtile'),
    PGHand = require('../models/pghand');

describe('PGHand', function() {
    var tileEleven = new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1),
        tileEight = new PGTile(PGTile.prototype.TILE_INDEX.MIXED_EIGHT_1),
        tileDay = new PGTile(PGTile.prototype.TILE_INDEX.DAY_2),
        tileFour = new PGTile(PGTile.prototype.TILE_INDEX.HARMONY_FOUR_1);
    it('should return a PGHand object', function() {
        var pgHand = new PGHand(tileEleven, tileEight);
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
            pgHand = new PGHand(TileFour, { _index: 1});
        });
    });
    it('should have a ranking', function() {
        var pgHand = new PGHand(tileFour, tileEight);
        assert(pgHand.rank() >= 0);
    });
});
