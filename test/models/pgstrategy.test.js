var before = require('../before.test'),
    assert = require('assert'),

    PGTile     = require('../../static/js/classes/pgtile'),
    PGHand     = require('../../static/js/classes/pghand'),
    PGSet      = require('../../static/js/classes/pgset'),
    PGStrategy = require('../../static/js/classes/pgstrategy');

console.log("test: PGStrategy");

describe('PGStrategy', function() {
    var tileEleven = new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1),
        tileEight = new PGTile(PGTile.prototype.TILE_INDEX.MIXED_EIGHT_1),
        tileDay = new PGTile(PGTile.prototype.TILE_INDEX.DAY_2),
        tileFour = new PGTile(PGTile.prototype.TILE_INDEX.HARMONY_FOUR_1);

    it('should return a PGStrategy object', function() {
        pgStrategy = new PGStrategy(tileEleven, tileEight, tileDay, tileFour);
        assert.notEqual(pgStrategy, null);
        pgSet = new PGStrategy([tileEleven, tileEight, tileDay, tileFour]);
        assert.notEqual(pgStrategy, null);
        pgStrategy = new PGStrategy("day", "ten-1", "mixed five-2", "eleven");
        assert.notEqual(pgStrategy, null);
    });

    it('should throw on bad constructor params', function() {
        var pgStrategy;
        assert.throws(function() {
            pgStrategy = new PGStrategy(tileDay);
        });
        assert.throws(function() {
            pgStrategy = new PGStrategy('Hello world');
        });
        assert.throws(function() {
            pgStrategy = new PGStrategy([tileEleven]);
        });
        assert.throws(function() {
            pgStrategy = new PGStrategy([tileFour, { _index: 1}]);
        });
    });

    it('should sort various hands correctly', function() {
        var pgStrategy = new PGStrategy("day", "ten-1", "mixed five-2", "eleven");
//         set = PGSet.createWithTileNames(("day", "low ten", "mixed five", "eleven"));
//         self.assertEqual(autoSetNumerical(set), 2);
//         set = PGSet.createWithTileNames(("low four", "low ten", "eleven", "low six"));
//         self.assertEqual(autoSetNumerical(set), 2);
//         set = PGSet.createWithTileNames(("teen", "low six", "harmony four", "long six"));
//         self.assertEqual(autoSetNumerical(set), 1);
//         set = PGSet.createWithTileNames(("low four", "mixed nine", "high eight", "mixed eight"));
//         self.assertEqual(autoSetNumerical(set), 1);
//         set = PGSet.createWithTileNames(("teen", "low ten", "eleven", "mixed nine"));
//         self.assertEqual(autoSetNumerical(set), 3);
//         set = PGSet.createWithTileNames(("low ten", "mixed nine", "day", "high ten"));
//         self.assertEqual(autoSetNumerical(set), 3);
    });

    // it('should return a hands array', function() {
    //     var pgSet = new PGStrategy(hand1, hand2);
    //     var hands = pgSet.hands();
    //     assert(hands instanceof Array);
    //     assert(hands.length === 2);
    //     assert.equal(hands[0], hand1);
    //     assert.equal(hands[1], hand2);
    // });
    // it('should return switch the hands to get the right order', function() {
    //     var pgSet = new PGStrategy(hand2, hand1);
    //     var hands = pgSet.hands();
    //     assert(hands instanceof Array);
    //     assert(hands.length === 2);
    //     assert.equal(hands[0], hand1);
    //     assert.equal(hands[1], hand2);
    // });
    // it('should return ranks', function() {
    //     var pgSet = new PGStrategy(hand2, hand1);
    //     var ranks = pgSet.ranks();
    //     assert(ranks instanceof Array);
    //     assert(ranks.length === 2);
    //     assert.equal(ranks[0], hand1.rank());
    //     assert.equal(ranks[1], hand2.rank());
    // });
    // it('should compare correctly', function() {
    //     var hand3 = new PGHand(tileEleven, tileDay),
    //         hand4 = new PGHand(tileEight, tileFour),
    //         hand5 = new PGHand(tileEleven, tileFour),
    //         hand6 = new PGHand(tileEight, tileDay);
    //     var pgSet1 = new PGStrategy(hand1, hand2),
    //         pgSet2 = new PGStrategy(hand3, hand4),
    //         pgSet3 = new PGStrategy(hand5, hand6);
    //     assert.equal(pgSet1.compare(pgSet2),  1);
    //     assert.equal(pgSet1.compare(pgSet3),  0);
    //     assert.equal(pgSet2.compare(pgSet3), -1);
    // });
});
