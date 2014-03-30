var before = require('../before.test'),
    assert = require('assert'),
    PGTile = require('../../static/js/classes/pgtile'),
    PGHand = require('../../static/js/classes/pghand'),
    PGSet = require('../../static/js/classes/pgset');

console.log("test: PGSet");

describe('PGSet', function() {
    var tileEleven = new PGTile(PGTile.prototype.TILE_INDEX.ELEVEN_1),
        tileEight = new PGTile(PGTile.prototype.TILE_INDEX.MIXED_EIGHT_1),
        hand1 = new PGHand(tileEleven, tileEight),
        tileDay = new PGTile(PGTile.prototype.TILE_INDEX.DAY_2),
        tileFour = new PGTile(PGTile.prototype.TILE_INDEX.HARMONY_FOUR_1),
        hand2 = new PGHand(tileDay, tileFour);

    it('should take hands as params', function() {
        var pgSet = new PGSet(hand1, hand2);
        assert.notEqual(pgSet, null);
        pgSet = new PGSet([hand1, hand2]);
        assert.notEqual(pgSet, null);
    });

    it('should take tiles as params', function() {
        var pgSet = new PGSet(tileEleven, tileEight, tileDay, tileFour);
        assert.notEqual(pgSet, null);
        pgSet = new PGSet("eleven", "high eight", "day", "low four");
        assert.notEqual(pgSet, null);
    });

    it('should throw on bad constructor params', function() {
        var pgSet;
        assert.throws(function() { pgSet = new PGSet(tileDay);       });
        assert.throws(function() { pgSet = new PGSet('Hello world'); });
        assert.throws(function() { pgSet = new PGSet([tileEleven]);  });
        assert.throws(function() { pgSet = new PGSet(tileFour, { _index: 1}); });
    });

    it('should return a hands array', function() {
        var pgSet = new PGSet(hand1, hand2);
        var hands = pgSet.hands();
        assert(hands instanceof Array);
        assert(hands.length === 2);
        assert.equal(hands[0], hand1);
        assert.equal(hands[1], hand2);
    });

    it('should return switch the hands to get the right order', function() {
        var pgSet = new PGSet(hand2, hand1);
        var hands = pgSet.hands();
        assert(hands instanceof Array);
        assert(hands.length === 2);
        assert.equal(hands[0], hand1);
        assert.equal(hands[1], hand2);
    });

    it('should return ranks', function() {
        var pgSet = new PGSet(hand2, hand1);
        var ranks = pgSet.ranks();
        assert(ranks instanceof Array);
        assert(ranks.length === 2);
        assert.equal(ranks[0], hand1.rank());
        assert.equal(ranks[1], hand2.rank());
    });

    it('should compare correctly', function() {
        var hand3 = new PGHand(tileEleven, tileDay),
            hand4 = new PGHand(tileEight, tileFour),
            hand5 = new PGHand(tileEleven, tileFour),
            hand6 = new PGHand(tileEight, tileDay);
        var pgSet1 = new PGSet(hand1, hand2),
            pgSet2 = new PGSet(hand3, hand4),
            pgSet3 = new PGSet(hand5, hand6);
        assert.equal(pgSet1.compare(pgSet2),  1);
        assert.equal(pgSet1.compare(pgSet3),  0);
        assert.equal(pgSet2.compare(pgSet3), -1);
    });

    it('should have sum and diff correct', function() {
        var hand1 = new PGHand("eleven", "low four");
        var hand2 = new PGHand("gee joon-1", "gee joon-2");
        var pgSet = new PGSet(hand1, hand2);
        var sad = pgSet.sumAndDiff();
        assert.equal(sad.sum, (hand1.rank() + hand2.rank()));
        assert.equal(sad.diff, (hand2.rank() - hand1.rank()));
        assert.equal(sad.valDiff, undefined);

        hand1 = new PGHand("eleven", "low four");
        hand2 = new PGHand("ten", "high eight");
        pgSet = new PGSet(hand1, hand2);
        sad = pgSet.sumAndDiff();
        assert.equal(sad.valDiff, 3);
    });
});
