/*
*
* @class PGTile
*
*     This file defines the PGTile jS class.
*
*     PGTiles contains one or more dots on each half, and they can be red or white.
*     The sequence and color of dots are denoted by a single character stored in
*     the PGTile, and accessors are used to get those sequence.
* 
*     A 'dot' decribes the relative location and color of dots
*     on a tile.  The paigow tiles are a mix of two halves, and
*     each pattern on a half is represented by the following
*     letters (thus a tile has two letters):
* 
*     (a) single red dot on top: red 2
*     (b) four red dots on top: red 1, 3, 7, 8
*     (c) two white dots on top: white 1, 3
*     (d) three white dots on top: white 3, 5, 7
*     (e) five white dots on top: white 1, 3, 5, 7, 8
*     (f) six white dots on top: white 1, 3, 4, 6, 9, 10
*     (g) mixed six dots on top: white 1, 4, 9; red 3, 6, 10
*     (h) single red dot on bottom: red 19
*     (i) four red dots on bottom: red 13, 14, 18, 20
*     (j) two white dots on bottom: white 18, 20
*     (k) three white dots on bottom 11, 16, 20
*     (l) five white dots on bottom: white 11, 12, 16, 18, 20
*     (m) six white dots on bottom: white 11, 12, 15, 17, 18, 20
*     (n) mixed six dots on bottom: white 1, 15, 18; red 12, 17, 20
* 
*/

var PGDot = require('./pgdot');

/*
* @attribute sequence
*
* Used for display purposes when generating HTML.
* These are the red and white locations of all the dots for
* each of the dotSequences. Each letter implies a set of red
* dot locations (by number) and a set of white dot locations
* (by number), in two lists.
*/
var dotSequences = {
    'A': { 'red': [2], 'white': [] },
    'B': { 'red': [1,3,7,8], 'white': [] },
    'C': { 'red': [], 'white': [1,3] },
    'D': { 'red': [], 'white': [3,5,9] },
    'E': { 'red': [], 'white': [1,3,5,9,10] },
    'F': { 'red': [], 'white': [1,3,4,6,9,10] },
    'G': { 'red': [1,4,9], 'white': [3,6,10] },
    'H': { 'red': [19], 'white': [] },
    'I': { 'red': [13,14,18,20], 'white': [] },
    'J': { 'red': [], 'white': [18,20] },
    'K': { 'red': [], 'white': [12,16,18] },
    'L': { 'red': [], 'white': [11,12,16,18,20] },
    'M': { 'red': [], 'white': [11,12,15,17,18,20] },
    'N': { 'red': [12,17,20], 'white': [11,15,18] },
};

/* @attribute dotSequenceMap
*
* Used for display purposes when generating HTML.
* These are the charcodes that map from an index into the entire
* deck of tiles to the dotSequences that define the number, location
* and color of dots.  The set of dotSequences for each tile are:
*
*     teen: gn
*     day: ah
*     high eight: bi
*     harmony four: ak
*     high ten: el
*     long six: dk
*     low four: cj
*     eleven: fl
*     low ten: bm
*     high seven: am
*     low six: al
*     mixed nine: bl, dm
*     mixed eight: dl, cm
*     mixed seven: bk, cl
*     mixed five: bh, ck
*     gee joon: ch, bj
*/
var dotSequenceMap = [
    'GN', 'GN',     // teen
    'AH', 'AH',     // day
    'BI', 'BI',     // high eight
    'AK', 'AK',     // harmony four
    'EL', 'EL',     // high ten
    'DK', 'DK',     // long six
    'CJ', 'CJ',     // low four
    'FL', 'FL',     // eleven
    'BM', 'BM',     // low ten
    'AM', 'AM',     // high seven
    'AL', 'AL',     // low six
    'BL', 'DM',     // mixed nine
    'DL', 'CM',     // mixed eight
    'BK', 'CL',     // mixed seven
    'BH', 'CK',     // mixed five
    'CH', 'BJ'      // two gee joon tiles
];

/*
* @constructor
*
* @param index index into the set of possible tiles
* @color color of the dot: 'red' or 'white'
*
*/
function PGTile(index) {
    if (index < PGTile.prototype.TILE_INDEX.TEEN_1 || index > PGTile.prototype.TILE_INDEX.GEE_JOON_2) throw "PGTile: bad constructor param " + index;
    this._index = index;
}

/*
* @method json
*
* return the json object representing this, suitable for sending to the client.
*
*/
PGTile.prototype.json = function() {
    var self = this;
    var dotsInHalf;
    function jsonOfHalf(half) {
        dotsInHalf = [];
        var dots = self._dotsOfHalf(half);
        for (var di = 0; di < dots.length; di++)
            dotsInHalf.push(dots[di].json());
        return dotsInHalf;
    }
    return {
        top: jsonOfHalf('top'),
        bottom: jsonOfHalf('bottom')
    };
};

/*
* @method handChar
*
* Return the char relative to the hand table ranking
*
*/
PGTile.prototype.handChar = function() {
    return String.fromCharCode(97 + Math.floor((this._index)/2));
};

/*
* @method compare
*
* Returns 1 if it beats the param, 0 if it's equal, -1 if it's lower.
*
* @param tile the tile to compare to
*/
PGTile.prototype.compare = function(tile) {
    if (!tile) throw "PGTile.compare given null tile to compare";
    var myRank = this.rank();
    var hisRank = tile.rank();
    if (myRank > hisRank)
        return 1;
    else if (myRank < hisRank)
        return -1;
    else
        return 0;
};

/*
* @method rank
*
* returns the rank of this hand, the higher the better.
*/
PGTile.prototype.rank = function() {
    // TODO
    return 1;
};

/*
* @method dotSequenceOf
*
* return the dot sequence for the given color for this tile
*
* @param color 'red' or 'white'
* @param half which half: 'top' or 'bottom'
*/
PGTile.prototype._dotSequenceOf = function(color, half) {
    // console.log("dotSequenceOf(" + color + ", " + half + ")");
    if (color !== 'red' && color !== 'white') throw "PGTile.dotSequenceOf: bad color " + color;
    if (half !== 'top' && half !== 'bottom')  throw "PGTile.dotSequenceOf: bad half " + half;

    var charSeq = dotSequenceMap[this._index];
    if (!charSeq) throw "PGTile.dotSequenceOf: bad tile index " + this._index;
    // console.log("charSeq: " + charSeq);

    var char = charSeq[(half === 'top') ? 0 : 1];
    if (!char) throw "PGTile.dotSequenceOf: bad charSeq " + charSeq;
    // console.log("char: " + char);

    var tileSequences = dotSequences[char];
    if (!tileSequences) throw "PGTile.dotSequenceOf: bad char " + char;
    // console.log("tileSequences: " + tileSequences);

    var tileColorSequence = tileSequences[color];
    if (!tileColorSequence) throw "PGTile.dotSequenceOf: bad tileSequence for color " + color;
    // console.log("tileColorSequence: " + tileColorSequence);

    return tileColorSequence;
};

/*
* @method _dotsOfSequence
* @private
*/
PGTile.prototype._dotsOfSequence = function(sequence, color) {
    if (color !== 'red' && color !== 'white') throw "PGTile._dotsOfSequence: bad color " + color;
    var dots = [];
    for (var si = 0; si < sequence.length; si++) {
        // console.log("pushing " + color + " dot");
        dots.push(new PGDot(sequence[si], color));
    }
    return dots;
};

/*
* @method dotsOfHalf
*
* return an array of dots to used for creating the HTML, for top or bottom half
*
*/
PGTile.prototype._dotsOfHalf = function(half) {
    return [].concat(this._dotsOfSequence(this._dotSequenceOf('red', half), 'red'),
                     this._dotsOfSequence(this._dotSequenceOf('white', half), 'white'));
};

/*
* @attribute tilenames
*
* For convenience, the tile indexes for the indexes when creating them.  These are in the prototype but I don't know of a better way.
*
*/
PGTile.prototype.TILE_INDEX = {
    TEEN_1:         0,
    TEEN_2:         1,
    DAY_1:          2,
    DAY_2:          3,
    HIGH_EIGHT_1:   4,
    HIGH_EIGHT_2:   5,
    HARMONY_FOUR_1: 6,
    HARMONY_FOUR_2: 7,
    HIGH_TEN_1:     8,
    HIGH_TEN_2:     9,
    LONG_SIX_1:     10,
    LONG_SIX_2:     11,
    LOW_FOUR_1:     12,
    LOW_FOUR_2:     13,
    ELEVEN_1:       14,
    ELEVEN_2:       15,
    LOW_TEN_1:      16,
    LOW_TEN_2:      17,
    SEVEN_1:        18,
    SEVEN_2:        19,
    LOW_SIX_1:      20,
    LOW_SIX_2:      21,
    MIXED_NINE_1:   22,
    MIXED_NINE_2:   23,
    MIXED_EIGHT_1:  24,
    MIXED_EIGHT_2:  25,
    MIXED_SEVEN_1:  26,
    MIXED_SEVEN_2:  27,
    MIXED_FIVE_1:   28,
    MIXED_FIVE_2:   29,
    GEE_JOON_1:     30,
    GEE_JOON_2:     31
};

/*
* @attribute tileCHARS
*
* For convenience, the tile chars for the indexes when looking at hands
*
*/

PGTile.prototype.TILE_CHARS = {
    TEEN:         'a',
    DAY:          'b',
    HIGH_EIGHT:   'c',
    HARMONY_FOUR: 'd',
    HIGH_TEN:     'e',
    LONG_SIX:     'f',
    LOW_FOUR:     'g',
    ELEVEN:       'h',
    LOW_TEN:      'i',
    SEVEN:        'j',
    LOW_SIX:      'k',
    MIXED_NINE:   'l',
    MIXED_EIGHT:  'm',
    MIXED_SEVEN:  'n',
    MIXED_FIVE:   'o',
    GEE_JOON:     'p'
};

module.exports = PGTile;
