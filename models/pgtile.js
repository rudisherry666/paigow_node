var PGDot = require('./pgdot');

/*
*
* @class PGDot
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

/*
* @attribute sequence
*
* Used for display purposes when generating HTML.
* These are the red and white locations of all the dots for
* each of the sequences. Each letter implies a set of red
* dot locations (by number) and a set of white dot locations
* (by number), in two lists.
*/
var sequences = {
    'a': { 'red': [2], 'white': [] },
    'b': { 'red': [1,3,7,8], 'white': [] },
    'c': { 'red': [], 'white': [1,3] },
    'd': { 'red': [], 'white': [3,5,9] },
    'e': { 'red': [], 'white': [1,3,5,9,10] },
    'f': { 'red': [], 'white': [1,3,4,6,9,10] },
    'g': { 'red': [1,4,9], 'white': [3,6,10] },
    'h': { 'red': [19], 'white': [] },
    'i': { 'red': [13,14,18,20], 'white': [] },
    'j': { 'red': [], 'white': [18,20] },
    'k': { 'red': [], 'white': [12,16,18] },
    'l': { 'red': [], 'white': [11,12,16,18,20] },
    'm': { 'red': [], 'white': [11,12,15,17,18,20] },
    'n': { 'red': [12,17,20], 'white': [11,15,18] },
};

/* @attribute charSequencMap
*
* Used for display purposes when generating HTML.
* These are the charcodes that map from an index into the entire
* deck of tiles to the sequences that define the number, location
* and color of dots.  The set of sequences for each tile are:
*
*     gee joon: ch, bj
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
*/
var charSequencMap = [
    'ch', 'bj',     // two gee joon tiles
    'gn', 'gn',     // teen
    'ah', 'ah',     // day
    'bi', 'bi',     // high eight
    'ak', 'ak',     // harmony four
    'el', 'el',     // high ten
    'dk', 'dk',     // long six
    'cj', 'cj',     // low four
    'fl', 'fl',     // eleven
    'bm', 'bm',     // low ten
    'am', 'am',     // high seven
    'al', 'al',     // low six
    'bl', 'dm',     // mixed nine
    'dl', 'cm',     // mixed eight
    'bk', 'cl',     // mixed seven
    'bh', 'ck'     // mixed five
];

/*
* @constructor
*
* @param index index into the set of possible tiles
* @color color of the dot: 'red' or 'white'
*
*/
function PGTile(index) {
    if (index < 0 || index >= charSequencMap.length) throw "PGTile: bad constructor param " + index;
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
}

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

    var charSeq = charSequencMap[this._index];
    if (!charSeq) throw "PGTile.dotSequenceOf: bad tile index " + this._index;
    // console.log("charSeq: " + charSeq);

    var char = charSeq[(half === 'top') ? 0 : 1];
    if (!char) throw "PGTile.dotSequenceOf: bad charSeq " + charSeq;
    // console.log("char: " + char);

    var tileSequences = sequences[char];
    if (!tileSequences) throw "PGTile.dotSequenceOf: bad char " + char;
    // console.log("tileSequences: " + tileSequences);

    var tileColorSequence = tileSequences[color];
    if (!tileColorSequence) throw "PGTile.dotSequenceOf: bad tileSequence for color " + color;
    // console.log("tileColorSequence: " + tileColorSequence);

    return tileColorSequence;
}

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
}

/*
* @method dotsOfHalf
*
* return an array of dots to used for creating the HTML, for top or bottom half
*
*/
PGTile.prototype._dotsOfHalf = function(half) {
    return [].concat(this._dotsOfSequence(this._dotSequenceOf('red', half), 'red'),
                     this._dotsOfSequence(this._dotSequenceOf('white', half), 'white'));
}


module.exports = PGTile;
