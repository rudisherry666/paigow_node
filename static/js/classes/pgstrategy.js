/*
*
* @class PGStrategy
*
* This file defines the PGStrategy JS class, used to decide what hands to
* play given the tiles.
*
*/

// Sneaky way to make this either a require module or a Node module
var isInBrowser = (typeof module === "undefined");

var PGTile,
    PGHand,
    PGSet;

if (!isInBrowser) {
    PGTile = require("./pgtile");
    PGHand = require("./pghand");
    PGSet = require("./pgset");
}

// Different ways we can auto-set;
var sUseNumericalAutoSet = false;

function pgStrategyLog(msg) {
    console.log(msg);
}

function switchTiles(set, index1, index2) {
    temp = set.tiles[index1];
    set.tiles[index1] = set.tiles[index2];
    set.tiles[index2] = temp;
}

function reorderTilesWithinHands(set) {
    if (set.tiles[1].beats(set.tiles[0])) {
        switchTiles(set, 0, 1);
    }
    if (set.tiles[3].beats(set.tiles[2])) {
        switchTiles(set, 2, 3);
    }
}

function reorderHandsForSetting(set, ordering) {
    if (ordering == 2) {
        switchTiles(set, 1, 2);
    } else if (ordering == 3) {
        switchTiles(set, 1, 3);
    }
    var hand1, hand2 = set.hands();
    if (hand2.beats(hand1)) {
        switchTiles(set, 0, 2);
        switchTiles(set, 1, 3);
    }
    reorderTilesWithinHands(set);
}

function chooseOrdering(sum1, diff1, sum2, diff2) {
    if (diff1 < diff2) {
        return 1;
    } else if (diff2 < diff1) {
        return -1;
    } else if (sum1 > sum2) {
        return 1;
    } else if (sum2 > sum1) {
        return -1;
    } else {
        return 0;
    }
}

// routines to check if one set has something and the other does not;
function whichSetHasIt(set1, set2, tst) {
    function hasIt(what) {
        return what[tst].call(what);
    }
    var set1HasIt = hasIt(set1.hands()[0]) || hasIt(set1.hands()[1]);
    var set2HasIt = hasIt(set2.hands()[0]) || hasIt(set2.hands()[1]);

    if (set1HasIt && !set2HasIt) {
        return 1;
    } else if (set2HasIt && !set1HasIt) {
        return 2;
    } else {
        return undefined;
    }
}

// convenience: check if the last two tiles in this set match certain;
// values, for use when deciding if we should split pairs;
function lastTwoTilesAreIn(set, values) {
    return set.tiles[2].valueIsIn(values) && set.tiles[3].valueIsIn(values);
}

// take care of special hands;
function orderingForSpecialHands(set) {
    pgStrategyLog("\norder for set " + set);

    // we'll be moving tiles around; create a temp set.;
    locSet = PGSet.create(set.tiles);

    // always use two pairs;
    var ordering = locSet.orderingWithTwoPair();
    pgStrategyLog("   order for two pairs " + ordering);
    if (ordering) return ordering;

    // if we have a pair, there are exceptions;
    ordering = locSet.orderingWithPair();
    pgStrategyLog("   order for one pairs " + ordering);
    if (ordering) {
        switchIt = false;

        // get the tile with the pair;
        reorderHandsForSetting(locSet, ordering);
        pairTile = locSet.tiles[0];

        // we never split pairs of 4s, 5s, 10s or 11s;
        if (pairTile.tileValue == 4 ||
             pairTile.tileValue == 5 ||
             pairTile.tileValue == 10 ||
             pairTile.tileValue == 11) {
            return ordering;
        }

        // we split teens/days if the other two tiles are both seven or higher;
        // TBD: would we really want this in the 3-hand, with 8/9?;
        //      Teen-bo/seven seems a safer bet than wong/gong;
        if (pairTile.isTeenOrDay() && lastTwoTilesAreIn(set, (7, 8, 9))) {
            switchIt = true;

        // we split nines if the other two are;
        // both within (ten, teen, day);
        } else if (pairTile.tileValue == 9 && lastTwoTilesAreIn(set, (2, 12, 10))) {
            switchIt = true;

        // we split eights if the other two are;
        // both within (elevens, teen, day);
        } else if (pairTile.tileValue == 8 && lastTwoTilesAreIn(set, (2, 12, 11))) {
            switchIt = true;

        // we split sixes and sevens if the other two are teen/day;
        } else if ((pairTile.tileValue == 7 || pairTile.tileValue == 6) && lastTwoTilesAreIn(set, (2, 12))) {
            switchIt = true;

        // we split gee joon if the other two are in (five, six) or (teen, day);
        // note we don't want to split them if one is five/six and the other is teen/day;;
        // only if both are five/six or both are teen/day.;
        } else if ((pairTile.tileValue == 3) && (lastTwoTilesAreIn(set, (2, 12)) || lastTwoTilesAreIn(set, (5, 6)))) {
            switchIt = true;
        }

        // if the ordering was 1, then the first two or the last;
        // two are the pair, and we can just switch the middle;
        // two tiles (ordering <-- 2).  If the ordering was 2 or three,;
        // then the pair wasn't already there, so we use the;
        // tiles in their original order (ordering <-- 1).  We can;
        // tell by the ordering: if it's 1, then the first two and;
        // last two are pairs.;
        if (switchIt) {
            if (ordering == 1) {
                ordering = 2;
            } else {
                ordering = 1;
            }
        }
    }

    return ordering;
}

// return 1 or 2 if one of the sets has one of [ pair, highNine, gong, wong ];
// and the other doesn't (or has a later-occuring one).  This assumes that;
// we have already tested and there isn't an only-way.;
function whichHasSpecialHands(set1, set2) {
    pgStrategyLog("testing for pairs...");
    ordering = whichSetHasIt(set1, set2, 'isPair');
    if (ordering) {
        pgStrategyLog("one pair has it: set" + ordering);
        return ordering;
    }

    pgStrategyLog("testing for high nine...");
    ordering = whichSetHasIt(set1, set2, 'isHighNine');
    if (ordering) {
        pgStrategyLog("one pair has it: set" + ordering);
        return ordering;
    }

    pgStrategyLog("testing for gong...");
    ordering = whichSetHasIt(set1, set2, 'isGong');
    if (ordering) {
        pgStrategyLog("one pair has it: set" + ordering);
        return ordering;
    }

    pgStrategyLog("testing for wong...");
    ordering = whichSetHasIt(set1, set2, 'isWong');
    if (ordering) {
        pgStrategyLog("one pair has it: set" + ordering);
        return ordering;
    }

    return undefined;
}

// we have two sets that are not only way. choose between them.;
function firstSetIsBetter(set1, set2) {

    // check for only way between these two sets;
    pgStrategyLog("\nTesting set " + set1 + " against ");
    pgStrategyLog("        set " + set2);

    if (set1.compare(set2) > 0) {
        pgStrategyLog(" ... set1 is only way");
        return true;
    } else if (set2.compare(set1) > 0) {
        pgStrategyLog(" ... set2 is only way");
        return false;
    }

    pgStrategyLog(" ... no only way, using heuristics");

    ordering = whichHasSpecialHands(set1, set2);
    if (ordering) {
        pgStrategyLog("one pair has it: set" + ordering);
        return ordering == 1;
    }

    // Even it out numerically.
    sd1 = set1.sumAndDiff();
    sd2 = set2.sumAndDiff();
    pgStrategyLog(" ...sum and diff1: " + sd1.sum + "  " + sd1.diff + " " + sd1.valueDiff);
    pgStrategyLog(" ...sum and diff2: " + sd2.sum + "  " + sd2.diff + " " + sd2.valueDiff);

    if ('valueDiff' in sd1 && 'valueDiff' in sd2 && sd1.valueDiff !== sd2.valueDiff) {
        pgStrategyLog("... using value diffs of " + sd1.valueDiff + " and " + sd2.valueDiff);
        return (sd1.valueDiff < sd2.valudDiff);
    }

    // no only way: check for diffs;
    //return set1.sumAndDiff().diff < set2.sumAndDiff().diff;
    // no only way: check for sums;
    return set1.sumAndDiff().sum > set2.sumAndDiff().sum;
}

function autoSetHeuristic(set) {
    var ordering = orderingForSpecialHands(set);
    if (ordering) return ordering;
    return autoSetNumerical(set);
}

function autoSetNumerical(set) {
    pgStrategyLog("\nautoSetNumerical BEGIN");

    pickedOrdering = undefined;

    // create sets with the three possible combinations.  We'll be re-arranging;
    // one of these to create sets so make them editable lists.;
    var tiles = set.tiles;
    pgStrategyLog(" ... tiles: [ " + tiles[0].name + ", " + tiles[1].name + ", " + tiles[2].name + ", " + tiles[3].name + " ]");
    tiles1 = [ tiles[0], tiles[1], tiles[2], tiles[3] ];
    tiles2 = [ tiles[0], tiles[2], tiles[1], tiles[3] ];
    tiles3 = [ tiles[0], tiles[3], tiles[1], tiles[2] ];
    sets = (undefined, PGSet.create(tiles1), PGSet.create(tiles2), PGSet.create(tiles3));
    ordering = _pickedOrderingForSets(sets);

    // we founds something, re-order the tiles for it.;
    if (ordering > 0) {
        reorderHandsForSetting(set, ordering);
    } else {
        pgStrategyLog("WTF? autoSort didn't find anything?");
    }

    return ordering;
}


function PGStrategy(args) {
    if (isInBrowser) Object.call(this);

    var prefix = "PGStrategy constructor ";

    function pgStrategyFatal(err) {
        console.log(prefix + err);
        throw new Error(prefix + err);
    }

    var tiles;
    if (args instanceof Array) {
        tiles = args;
    } else {
        tiles = [];
        for (var arg in arguments)
            tiles.push(new PGTile(arguments[arg]));
    }
    if (tiles.length !== 4) pgStrategyFatal("wrong number of params");
    for (var ti = 0; ti < tiles.length; ti++) {
        if (!(tiles[ti] instanceof PGTile)) pgStrategyFatal("argument not a PGTile");
    }

    // Create the three possible variations of the hand.  Each PGSet contructor
    // will reorder the hands to be high then low, and each hand constructor will
    // reorder the tiles to be high then low.
    this._sets = [
        null,   // dummy so we can be 1-based to match scoring numbers.
        new PGSet(new PGHand(tiles[0], tiles[1]), new PGHand(tiles[2], tiles[3])),
        new PGSet(new PGHand(tiles[0], tiles[2]), new PGHand(tiles[3], tiles[1])),
        new PGSet(new PGHand(tiles[0], tiles[3]), new PGHand(tiles[1], tiles[2]))
    ];
}


// Sneaky way to make this either a require module or a Node module
if (!isInBrowser) {
    PGStrategy.prototype = {};
    PGStrategy.prototype.constructor = PGStrategy;
}

// PGStrategy.prototype.autoSet321 = function() {

//     ordering = this._pickedOrderingForSets();
//     if (ordering == 1) {
//         // first set is the best, find the next-best;
//         if (firstSetIsBetter(sets[1], sets[2])) {
//             sets = sets;
//         } else {
//             sets = [ sets[0], sets[2], sets[1] ];
//         }
//     } else if (ordering == 2) {
//         // second set is the best, find the next-best;
//         if (firstSetIsBetter(sets[0], sets[2])) {
//             sets = [ sets[1], sets[0], sets[2] ];
//         } else {
//             sets = [ sets[1], sets[2], sets[0] ];
//         }
//     } else {
//         // third set is the best, find the next-best;
//         if (firstSetIsBetter(sets[0], sets[1])) {
//             sets = [ sets[2], sets[0], sets[1] ];
//         } else {
//             sets = [ sets[2], sets[1], sets[0] ];
//         }
//     }

//     return sets;
// };

PGStrategy.prototype.bestSet = function() {
    return this._sets[this._pickedOrderingForSets()];
};

PGStrategy.prototype._pickedOrderingForSets = function() {
    pgStrategyLog("\npickedOrderingForSets BEGIN...");

    pickedOrdering = undefined;

    var sets = this._sets;

    // convenience vars to test various combinations;
    var s1beats2 = firstSetIsBetter(sets[1], sets[2]),
        s2beats1 = firstSetIsBetter(sets[2], sets[1]),
        s1beats3 = firstSetIsBetter(sets[1], sets[3]),
        s3beats1 = firstSetIsBetter(sets[3], sets[1]),
        s2beats3 = firstSetIsBetter(sets[2], sets[3]),
        s3beats2 = firstSetIsBetter(sets[3], sets[2]);

    // see if there is an only-way in there;
    if (s1beats2 && s1beats3) {
        pickedOrdering = 1;
        console.log("" + sets[1] + " is only way for this set");
    } else if (s2beats1 && s2beats3) {
        pickedOrdering = 2;
        console.log("" + sets[2] + " is only way for this set");
    } else if (s3beats1 && s3beats2) {
        pickedOrdering = 3;
        console.log("" + sets[3] + " is only way for this set");
    } else {

        // nope, no only way.  See if there is any set we can remove;
        // so we can just compare the other two;
        ignore1 = s2beats1 || s3beats1;
        ignore2 = s1beats2 || s3beats2;
        ignore3 = s2beats3 || s1beats3;

        pgStrategyLog("    ignore1: " + ignore1);
        pgStrategyLog("    ignore2: " + ignore2);
        pgStrategyLog("    ignore3: " + ignore3);

        if (ignore1) {
            if (firstSetIsBetter(sets[2], sets[3])) {
                pickedOrdering = 2;
            } else {
                pickedOrdering = 3;
            }
        } else if (ignore2) {
            if (firstSetIsBetter(sets[1], sets[3])) {
                pickedOrdering = 1;
            } else {
                pickedOrdering = 3;
            }
        } else if (ignore3) {
            if (firstSetIsBetter(sets[1], sets[2])) {
                pickedOrdering = 1;
            } else {
                pickedOrdering = 2;
            }
        } else {
            // bleah, need 3-way comparison, no only ways between.;
            // use the "has" to find the one or ones with pairs etc.;

            // choose the one with the smallest difference.;
            var sd1 = sets[1].sumAndDiff();
            var sd2 = sets[2].sumAndDiff();
            var sd3 = sets[3].sumAndDiff();
            if (sd1.diff < sd2.diff && sd1.diff < sd3.diff) {
                pickedOrdering = 1;
            } else if (sd2.diff < sd1.diff && sd2.diff < sd3.diff) {
                pickedOrdering = 2;
            } else if (sd3.diff < sd1.diff && sd3.diff < sd2.diff) {
                pickedOrdering = 3;
            } else {
                pgStrategyLog(" no diff winner, will ordering one or two.");

                // double-bleah: there was evidently a diff tie.;
                // We can't then go to the largest sum because two with a diff;
                // tie, where one sum is larger, would be an only way.  So therefore;
                // the two with the smallest diff must be the same.  Therefore,;
                // since there are two of them, either 1 or 2 has to be it: just;
                // compare those.;
                if (firstSetIsBetter(sets[1], sets[2])) {
                    pickedOrdering = 1;
                } else {
                    pickedOrdering = 2;
                }
            }
        }
    }

    pgStrategyLog("pickedOrderingForSets END returns " + pickedOrdering + "\n");
    return pickedOrdering;
};


// // ----------------------------------------------------;
// // Test PGStrategy class;

// from django.test import TestCase;

// class PGStrategyTest(TestCase) {

//     // we need the set of tiles in the test database;
//     fixtures = [ 'pgtile.json' ];

//     function testAutoSet(self) {
//         //PGStrategyLogging.logging = true;
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


// Sneaky way to make this either a require module or a Node module
if (isInBrowser) {
    define(["./pgtile", "./pghand", "./pgset"], function(tile, hand, set) {
        PGTile = tile;
        PGHand = hand;
        PGSet = set;
        return PGStrategy;
    });
} else
    module.exports = PGStrategy;
