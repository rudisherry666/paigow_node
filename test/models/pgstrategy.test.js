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
        assert.throws(function() { pgStrategy = new PGStrategy(tileDay); });
        assert.throws(function() { pgStrategy = new PGStrategy('eleven'); });
        assert.throws(function() { pgStrategy = new PGStrategy([tileEleven]); });
        assert.throws(function() { pgStrategy = new PGStrategy([tileFour, { _index: 1}]); });
    });

    it('should sort only-way correctly', function() {
        pgStrategy = new PGStrategy("eleven", "low four", "high eight", "mixed five");  // should be 9-9
        var pgSet = pgStrategy.bestSet();
        assert(pgSet instanceof PGSet, "best set not a set");
        var hands = pgSet.hands();
        assert(hands instanceof Array, "best set hands not an array");
        assert(hands[0] instanceof PGHand, "first hand not a hand");
        assert.equal(hands[0].tiles()[0].name(), "high eight");
        assert.equal(hands[0].tiles()[1].name(), "eleven");
        assert.equal(hands[1].tiles()[0].name(), "low four");
        assert.equal(hands[1].tiles()[1].name(), "mixed five");

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

//     function testX321SetOrdering(self) {
//         set1 = PGSet.createWithTileNames(("low ten", "mixed nine", "harmony four", "low four"));
//         set2 = PGSet.createWithTileNames(("low six", "low six", "low ten", "high seven"));
//         self.assertFalse(firstSetIsBetter(set1, set2));

//         set1 = PGSet.createWithTileNames(("eleven", "mixed five", "high eight", "high seven"));
//         set2 = PGSet.createWithTileNames(("low ten", "mixed nine", "high ten", "mixed five"));
//         self.assertFalse(firstSetIsBetter(set1, set2));

//     function specialOrderingForHighPair(self, teenOrDay) {
//         // test reordering to get pair;
//         set = PGSet.createWithTileNames((teenOrDay, "eleven", "high eight", teenOrDay));
//         self.assertEqual(orderingForSpecialHands(set), 1);

//         // test no reordering to get pair;
//         set = PGSet.createWithTileNames(("eleven", teenOrDay, "high eight", teenOrDay));
//         self.assertEqual(orderingForSpecialHands(set), 1);

//         // test no reorder to split pair;
//         set = PGSet.createWithTileNames(("mixed nine", teenOrDay, "high eight", teenOrDay));
//         self.assertEqual(orderingForSpecialHands(set), 1);

//         // test reorder to split pair;
//         set = PGSet.createWithTileNames(("mixed nine", "high eight", teenOrDay, teenOrDay));
//         self.assertEqual(orderingForSpecialHands(set), 2);

//     function specialOrderingForHighPair(self) {
//         self.specialOrderingForTeenPair("teen");
//         self.specialOrderingForTeenPair("day");

//     function testSpecialOrderingForOtherPairs(self) {
//         // test reorder sevens to split pair;
//         set = PGSet.createWithTileNames(("mixed seven", "mixed seven", "teen", "day"));
//         self.assertEqual(orderingForSpecialHands(set), 2);

//         // test no reorder sevens to split pair;
//         set = PGSet.createWithTileNames(("mixed seven", "teen", "mixed seven", "day"));
//         self.assertEqual(orderingForSpecialHands(set), 1);

//         // test reorder eights to make pair;
//         set = PGSet.createWithTileNames(("mixed eight", "low ten", "mixed eight", "day"));
//         self.assertEqual(orderingForSpecialHands(set), 2);

//         // test no reorder eights to make pair;
//         set = PGSet.createWithTileNames(("low ten", "day", "mixed eight", "mixed eight"));
//         self.assertEqual(orderingForSpecialHands(set), 1);

//         // test reorder nines to make pair;
//         set = PGSet.createWithTileNames(("low ten", "day", "mixed nine", "mixed nine"));
//         self.assertEqual(orderingForSpecialHands(set), 2);

//         // test geen joon splitting and not;
//         set = PGSet.createWithTileNames(("gee joon", "gee joon", "long six", "low six"));
//         self.assertEqual(orderingForSpecialHands(set), 2);
//         set = PGSet.createWithTileNames(("gee joon", "gee joon", "long six", "mixed seven"));
//         self.assertEqual(orderingForSpecialHands(set), 1);
});
