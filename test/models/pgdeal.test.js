var before = require('../before.test'),
    assert = require('assert'),
    PGTile = require('../../static/js/classes/pgtile'),
    PGDeal = require('../../models/pgdeal');

console.log("test: PGDeal");

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
    it('should have two hands in the right order', function() {
        var pgDeal = new PGDeal([tileEleven, tileEight, tileDay, tileFour]);
        var hands = pgDeal.hands();
        assert(hands instanceof Array);
        assert(hands.length === 2);
        var handTiles = hands[0].tiles();
        assert(handTiles[0].name() === tileEleven.name());
        assert(handTiles[1].name() === tileEight.name());
    });
});
