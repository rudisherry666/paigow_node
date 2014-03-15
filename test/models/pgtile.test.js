var before = require('../before.test'),
    assert = require('assert'),
    PGTile = require('../../static/js/classes/pgtile');

console.log("test: PGTile");

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
    it ('should return the correct name', function() {
        var pgTile = new PGTile(PGTile.prototype.TILE_INDEX.MIXED_SEVEN_1);
        assert.equal(pgTile.name(), "mixed seven");
        pgTile = new PGTile(PGTile.prototype.TILE_INDEX.GEE_JOON_2);
        assert.equal(pgTile.name(), "gee joon");
    });
    it('should have a ranking', function() {
        var pgTile = new PGTile(PGTile.prototype.TILE_INDEX.HIGH_TEN_2);
        assert(pgTile.tileRank() >= 0);
        assert(pgTile.pairRank() >= 0);
    });
    it('should return a deck with 32 tiles', function() {
        var deck = PGTile.prototype.deck();
        assert.equal(typeof deck, "object");
        assert.equal(deck.length, 32);
    });
    it('should return a deck with exactly two of several tile types', function() {
        var deck = PGTile.prototype.deck();
        var numTeens = 0, numMixedFives = 0;
        for (var di = 0; di < deck.length; di++) {
            var pgTile = deck[di];
            switch (pgTile.name()) {
                case "teen": numTeens++; break;
                case "mixed five": numMixedFives++; break;
            }
        }
        assert.equal(numTeens, 2);
        assert.equal(numMixedFives, 2);
    });
});
