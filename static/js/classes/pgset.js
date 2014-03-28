/*
*
* @class PGSet
*
* This file defines the PGSet JS class: four tiles already set into two hands.
* This does not make value judgements over what *should* be done with the
* four tiles, it only contains utilities for comparing with other sets.
*/

// Sneaky way to make this either a require module or a Node module
var PGTile,
    PGHand;
if (typeof module !== "undefined") {
    console.log("required!");
    PGTile = require("./pgtile");
    PGHand = require("./pghand");
}

/*
* @constructor PGSet
*
* The constructor for PGSet, takes the two chars.
*
*/
function PGSet(hand1, hand2) {
    if (hand1 instanceof Array) {
        if (hand1.length !== 2) throw "PGSet constructor given array of length " + hand1.length;
        hand2 = hand1[1];
        hand1 = hand1[0];
    }
    if (!hand1 || !hand2) throw "PGSet constructor not given both hands";
    if (!(hand1 instanceof PGHand) || !(hand2 instanceof PGHand)) throw "PGSet constructor given param that's not a hand";

    // Make it so hand1 is the higher hand
    switch (hand1.compare(hand2)) {
        case 1:
        case 0:
            this._hand1 = hand1;
            this._hand2 = hand2;
        break;

        default:
            this._hand2 = hand1;
            this._hand1 = hand2;
        break;
    }
}

PGSet.prototype._obj = function() {
    var chars = this._tile1.handChar() + this._tile2.handChar();
    return HANDS[chars];
};

/*
* @method ranks
*
* Return an array of the ranking of the hands of this set
*
*/
PGSet.prototype.ranks = function() {
    return [ this._hand1.rank(), this._hand2.rank() ];
};

/*
* @method hands
*
* Return the array of hands of this set
*
*/
PGSet.prototype.hands = function() {
    return [ this._hand1, this._hand2 ];
};

/*
* @method compare
*
* Returns the canonical comparison: -1 if it's loses to the param, 0 if push, 1 if it wins agains the param.
*
*
* @param hand the other hand to compare against
*
*/
PGSet.prototype.compare = function(set) {
    if (!set) throw "PGSet.compare given set hand to compare";
    var myRanks = this.ranks();
    var hisRanks = set.ranks();
    if (myRanks[0] > hisRanks[0] && myRanks[1] > hisRanks[1])
        return 1;
    else if (myRanks[0] < hisRanks[0] && myRanks[1] < hisRanks[1])
        return -1;
    else
        return 0;
};

// Sneaky way to make this either a require module or a Node module
if (typeof module === "undefined") {
    define(["./pghand", "./pgtile"], function(hand, tile) {
        PGHand = hand;
        PGTile = tile;
        return PGSet;
    });
} else
    module.exports = PGSet;
