/*
*
* @class PGSet
*
* This file defines the PGSet JS class: four tiles already set into two hands.
* This does not make value judgements over what *should* be done with the
* four tiles, it only contains utilities for comparing with other sets.
*/

// Sneaky way to make this either a require module or a Node module
var isInBrowser = (typeof module === "undefined");

var PGTile,
    PGHand;

if (!isInBrowser) {
    PGTile = require("./pgtile");
    PGHand = require("./pghand");
}

/*
* @constructor PGSet
*
* The constructor for PGSet, takes the two hands, or four tiles, or four tile names.
*
*/
function PGSet(arg) {
    var prefix = "PGSet constructor ";

    function pgSetFatal(err) {
        console.log(prefix + err);
        throw new Error(prefix + err);
    }

    // If we're given a set, return it.
    if (arg instanceof PGSet) {
        return arg;
    }

    var hand1, hand2;
    var inputs;
    if (arg instanceof Array) {
        inputs = arg;
    } else {
        inputs = arguments;
    }
    switch (inputs.length) {
        case 2:
            hand1 = inputs[0];
            hand2 = inputs[1];
        break;

        case 4:
            hand1 = new PGHand(inputs[0], inputs[1]);
            hand2 = new PGHand(inputs[2], inputs[3]);
        break;

        default:
            pgSetFatal("wrong number of params");
        break;
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

// Sneaky way to make this either a require module or a Node module
if (!isInBrowser) {
    PGSet.prototype = {};
    PGSet.prototype.constructor = PGSet;
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
* @method tiles
*
* Return the array of hands of this set
*
*/
PGSet.prototype.tiles = function() {
    return this._hand1.tiles().concat(this._hand2.tiles());
};

/*
* @method sumAndDiff
*
* Return an object of the sum and diff of the two hands
*
*/
PGSet.prototype.sumAndDiff = function() {
    var hand1Rank = this._hand1.rank(),
        hand2Rank = this._hand2.rank(),
        hand1Value = this._hand1.value(),
        hand2Value = this._hand2.value();
    var sad = {
        sum:  hand1Rank + hand2Rank,
        diff: hand1Rank - hand2Rank,
    };
    if (hand1Value <= 9 && hand2Value <= 9)
        sad.valDiff = hand1Value - hand2Value;
    return sad;
};

/*
* @method toString
*
* Better for looking at things
*
*/
PGSet.prototype.toString = function() {
    return "[ " + this._hand1.tiles()[0].name() +
            " " + this._hand1.tiles()[1].name() +
            " " + this._hand2.tiles()[0].name() +
            " " + this._hand2.tiles()[1].name() + " ]";
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
if (isInBrowser) {
    define(["./pghand", "./pgtile"], function(hand, tile) {
        PGHand = hand;
        PGTile = tile;
        return PGSet;
    });
} else
    module.exports = PGSet;
