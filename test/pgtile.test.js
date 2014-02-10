var assert = require('assert'),
    PGTile = require('../models/pgtile.js');

describe('PGTile', function() {
    it('should return a PGTile object', function() {
        var pgTile = new PGTile(PGTile.prototype.GEE_JOON_1);
        assert.notEqual(pgTile, null);
    });
    it('should throw on bad constructor params', function() {
        var pgTile;
        assert.throws(function() {
            pgTile = new PGTile(PGTile.prototype.GEE_JOON_1 - 1);
        });
        assert.throws(function() {
            pgTile = new PGTile(PGTile.prototype.MIXED_FIVE_2 + 1);
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
    it('should return the correct number of dots', function() {
        var pgTile = new PGTile(2); // teen
        assert.equal(pgTile._dotsOfHalf('top').length, 6);
        assert.equal(pgTile._dotsOfHalf('bottom').length, 6);
        pgTile = new PGTile(4); // day
        assert.equal(pgTile._dotsOfHalf('bottom').length, 1);
    });
    it('should return a good json object', function() {
        var pgTile = new PGTile(2); // teen
        var tileJSON = pgTile.json();
        assert.equal(tileJSON.top.length, 6);
        assert.equal(tileJSON.bottom.length, 6);
    });
});
