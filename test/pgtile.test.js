var assert = require('assert'),
    PGTile = require('../models/pgtile.js');

describe('PGTile', function() {
    it('should return a PGTile object', function() {
        var pgTile = new PGTile(PGTile.prototype.TILE_INDEX.GEE_JOON_1);
        assert.notEqual(pgTile, null);
    });
    it('should throw on bad constructor params', function() {
        var pgTile;
        assert.throws(function() {
            pgTile = new PGTile(-1);
        });
        assert.throws(function() {
            pgTile = new PGTile(32);
        });
    });
    it('should throw on bad sequence getter', function() {
        var pgTile = new PGTile(PGTile.prototype.ELEVEN);
        assert.throws(function() {
            var sequence = pgTile.dotSequenceOf('blue', 'top');
        });
        assert.throws(function() {
            var sequence = pgTile.dotSequenceOf('red', 'left');
        });
        assert.throws(function() {
            var sequence = pgTile.dots('left');
        });
    });
    it('should return a good json object', function() {
        var pgTile = new PGTile(PGTile.prototype.TILE_INDEX.TEEN_2); // teen
        var tileJSON = pgTile.json();
        assert(Boolean(tileJSON));
    });
    it ('should return the correct char', function() {
        var pgTile = new PGTile(PGTile.prototype.TILE_INDEX.MIXED_SEVEN_1);
        assert.equal(pgTile.handChar(), PGTile.prototype.TILE_CHARS.MIXED_SEVEN);
        pgTile = new PGTile(PGTile.prototype.TILE_INDEX.GEE_JOON_2);
        assert.equal(pgTile.handChar(), PGTile.prototype.TILE_CHARS.GEE_JOON);
    });
    it('should have a ranking', function() {
        var pgTile = new PGTile(PGTile.prototype.TILE_INDEX.HIGH_TEN_2);
        assert(pgTile.tileRank() >= 0);
        assert(pgTile.pairRank() >= 0);
    });
});
