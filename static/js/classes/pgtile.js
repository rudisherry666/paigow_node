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

/*
* @attribute HAND_CHARS
*
* Mapping from value to individual char to go with the array of hand values.
* See pghand.js _rankings for the mapping from double-chars to hand ranks.
*
*/
PGTile.prototype.HAND_CHAR = {
    TEEN:         'a',
    DAY:          'b',
    HIGH_EIGHT:   'c',
    HARMONY_FOUR: 'd',
    HIGH_TEN:     'e',
    LONG_SIX:     'f',
    LOW_FOUR:     'g',
    ELEVEN:       'h',
    TEN:          'i',
    SEVEN:        'j',
    SIX:          'k',
    MIXED_NINE:   'l',
    MIXED_EIGHT:  'm',
    MIXED_SEVEN:  'n',
    MIXED_FIVE:   'o',
    GEE_JOON:     'p'
};

/*
* @attribute tilenames
*
* For convenience, names for the tile indexes for the indexes when creating them.  These are
* indexes into the 'tiles' array below.
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
    TEN_1:          16,
    TEN_2:          17,
    SEVEN_1:        18,
    SEVEN_2:        19,
    SIX_1:          20,
    SIX_2:          21,
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
* These define the tiles, given the index.  The index into this array should match 
* the name given by TILE_INDEX.
*/

PGTile.prototype.TILE_NAME = {
    TEEN:         'teen',
    DAY:          'day',
    HIGH_EIGHT:   'high eight',
    HARMONY_FOUR: 'harmony four',
    HIGH_TEN:     'high ten',
    LONG_SIX:     'long six',
    LOW_FOUR:     'low four',
    ELEVEN:       'eleven',
    TEN:          'ten',
    SEVEN:        'seven',
    SIX:          'six',
    MIXED_NINE:   'mixed nine',
    MIXED_EIGHT:  'mixed eight',
    MIXED_SEVEN:  'mixed seven',
    MIXED_FIVE:   'mixed five',
    GEE_JOON:     'gee joon'
};

var tiles = [
    { tileName: PGTile.prototype.TILE_NAME.TEEN,            handChar: PGTile.prototype.HAND_CHAR.TEEN,            divClass: 'pgtile-teen',            tileRank:15, pairRank:14 },
    { tileName: PGTile.prototype.TILE_NAME.TEEN,            handChar: PGTile.prototype.HAND_CHAR.TEEN,            divClass: 'pgtile-teen',            tileRank:15, pairRank:14 },
    { tileName: PGTile.prototype.TILE_NAME.DAY,             handChar: PGTile.prototype.HAND_CHAR.DAY,             divClass: 'pgtile-day',             tileRank:14, pairRank:13 },
    { tileName: PGTile.prototype.TILE_NAME.DAY,             handChar: PGTile.prototype.HAND_CHAR.DAY,             divClass: 'pgtile-day',             tileRank:14, pairRank:13 },
    { tileName: PGTile.prototype.TILE_NAME.HIGH_EIGHT,      handChar: PGTile.prototype.HAND_CHAR.HIGH_EIGHT,      divClass: 'pgtile-high-eight',      tileRank:13, pairRank:12 },
    { tileName: PGTile.prototype.TILE_NAME.HIGH_EIGHT,      handChar: PGTile.prototype.HAND_CHAR.HIGH_EIGHT,      divClass: 'pgtile-high-eight',      tileRank:13, pairRank:12 },
    { tileName: PGTile.prototype.TILE_NAME.HARMONY_FOUR,    handChar: PGTile.prototype.HAND_CHAR.HARMONY_FOUR,    divClass: 'pgtile-harmony-four',    tileRank:12, pairRank:11 },
    { tileName: PGTile.prototype.TILE_NAME.HARMONY_FOUR,    handChar: PGTile.prototype.HAND_CHAR.HARMONY_FOUR,    divClass: 'pgtile-harmony-four',    tileRank:12, pairRank:11 },
    { tileName: PGTile.prototype.TILE_NAME.HIGH_TEN,        handChar: PGTile.prototype.HAND_CHAR.HIGH_TEN,        divClass: 'pgtile-high-ten',        tileRank:11, pairRank:10 },
    { tileName: PGTile.prototype.TILE_NAME.HIGH_TEN,        handChar: PGTile.prototype.HAND_CHAR.HIGH_TEN,        divClass: 'pgtile-high-ten',        tileRank:11, pairRank:10 },
    { tileName: PGTile.prototype.TILE_NAME.LONG_SIX,        handChar: PGTile.prototype.HAND_CHAR.LONG_SIX,        divClass: 'pgtile-long-six',        tileRank:10, pairRank: 9 },
    { tileName: PGTile.prototype.TILE_NAME.LONG_SIX,        handChar: PGTile.prototype.HAND_CHAR.LONG_SIX,        divClass: 'pgtile-long-six',        tileRank:10, pairRank: 9 },
    { tileName: PGTile.prototype.TILE_NAME.LOW_FOUR,        handChar: PGTile.prototype.HAND_CHAR.LOW_FOUR,        divClass: 'pgtile-low-four',        tileRank: 9, pairRank: 8 },
    { tileName: PGTile.prototype.TILE_NAME.LOW_FOUR,        handChar: PGTile.prototype.HAND_CHAR.LOW_FOUR,        divClass: 'pgtile-low-four',        tileRank: 9, pairRank: 8 },
    { tileName: PGTile.prototype.TILE_NAME.ELEVEN,          handChar: PGTile.prototype.HAND_CHAR.ELEVEN,          divClass: 'pgtile-eleven',          tileRank: 8, pairRank: 7 },
    { tileName: PGTile.prototype.TILE_NAME.ELEVEN,          handChar: PGTile.prototype.HAND_CHAR.ELEVEN,          divClass: 'pgtile-eleven',          tileRank: 8, pairRank: 7 },
    { tileName: PGTile.prototype.TILE_NAME.TEN,             handChar: PGTile.prototype.HAND_CHAR.TEN,             divClass: 'pgtile-ten',             tileRank: 7, pairRank: 6 },
    { tileName: PGTile.prototype.TILE_NAME.TEN,             handChar: PGTile.prototype.HAND_CHAR.TEN,             divClass: 'pgtile-ten',             tileRank: 7, pairRank: 6 },
    { tileName: PGTile.prototype.TILE_NAME.SEVEN,           handChar: PGTile.prototype.HAND_CHAR.SEVEN,           divClass: 'pgtile-seven',           tileRank: 6, pairRank: 5 },
    { tileName: PGTile.prototype.TILE_NAME.SEVEN,           handChar: PGTile.prototype.HAND_CHAR.SEVEN,           divClass: 'pgtile-seven',           tileRank: 6, pairRank: 5 },
    { tileName: PGTile.prototype.TILE_NAME.SIX,             handChar: PGTile.prototype.HAND_CHAR.SIX,             divClass: 'pgtile-six',             tileRank: 5, pairRank: 4 },
    { tileName: PGTile.prototype.TILE_NAME.SIX,             handChar: PGTile.prototype.HAND_CHAR.SIX,             divClass: 'pgtile-six',             tileRank: 5, pairRank: 4 },
    { tileName: PGTile.prototype.TILE_NAME.MIXED_NINE,      handChar: PGTile.prototype.HAND_CHAR.MIXED_NINE,      divClass: 'pgtile-mixed-nine-1',    tileRank: 4, pairRank: 3 },
    { tileName: PGTile.prototype.TILE_NAME.MIXED_NINE,      handChar: PGTile.prototype.HAND_CHAR.MIXED_NINE,      divClass: 'pgtile-mixed-nine-2',    tileRank: 4, pairRank: 3 },
    { tileName: PGTile.prototype.TILE_NAME.MIXED_EIGHT,     handChar: PGTile.prototype.HAND_CHAR.MIXED_EIGHT,     divClass: 'pgtile-mixed-eight-1',   tileRank: 3, pairRank: 2 },
    { tileName: PGTile.prototype.TILE_NAME.MIXED_EIGHT,     handChar: PGTile.prototype.HAND_CHAR.MIXED_EIGHT,     divClass: 'pgtile-mixed-eight-2',   tileRank: 3, pairRank: 2 },
    { tileName: PGTile.prototype.TILE_NAME.MIXED_SEVEN,     handChar: PGTile.prototype.HAND_CHAR.MIXED_SEVEN,     divClass: 'pgtile-mixed-seven-1',   tileRank: 2, pairRank: 1 },
    { tileName: PGTile.prototype.TILE_NAME.MIXED_SEVEN,     handChar: PGTile.prototype.HAND_CHAR.MIXED_SEVEN,     divClass: 'pgtile-mixed-seven-2',   tileRank: 2, pairRank: 1 },
    { tileName: PGTile.prototype.TILE_NAME.MIXED_FIVE,      handChar: PGTile.prototype.HAND_CHAR.MIXED_FIVE,      divClass: 'pgtile-mixed-five-1',    tileRank: 1, pairRank: 0 },
    { tileName: PGTile.prototype.TILE_NAME.MIXED_FIVE,      handChar: PGTile.prototype.HAND_CHAR.MIXED_FIVE,      divClass: 'pgtile-mixed-five-2',     tileRank: 1, pairRank: 0 },
    { tileName: PGTile.prototype.TILE_NAME.GEE_JOON,        handChar: PGTile.prototype.HAND_CHAR.GEE_JOON,        divClass: 'pgtile-gee-joon-1',      tileRank: 0, pairRank:15 },
    { tileName: PGTile.prototype.TILE_NAME.GEE_JOON,        handChar: PGTile.prototype.HAND_CHAR.GEE_JOON,        divClass: 'pgtile-gee-joon-2',      tileRank: 0, pairRank:15 }
];


/*
* @constructor
*
* @param index {string or number} if number, index into the set of possible tiles. If string, name of tile plus optional "-#" where # is 1 or 2
* @color color of the dot: 'red' or 'white'
*
*/
function PGTile(tileSelector) {
    var index;

    var prefix = "PGTile constructor ";
    function pgTileSelectorFatal(str) {
        // console.log(prefix + str);
        throw new Error(prefix + str);
    }

    if (typeof tileSelector === "number") {
        index = tileSelector;
    } else if (typeof tileSelector === "string") {
        // The string is '<name>[-(0|1)]{0-1}'
        index = -1;
        var name;
        var which;

        // Find out if there are hyphens
        var s = tileSelector.split("-");
        if (s.length === 2) {
            // Yes, there's a hyphen.  Get the name and which (1st or 2nd)
            name = s[0];
            which = parseInt(s[1], 10);
            if (which !== 1 && which !== 2) pgTileSelectorFatal("bad which in string");
        } else if (s.length === 1) {
            // No hyphen: assume the first.
            name = s[0];
            which = 1;
        } else {
            // Too many hyphens!
            pgTileSelectorFatal("too many hyphens in string");
        }

        // We have the name, search the list.
        for (var ti = 0; ti < tiles.length; ti++) {
            if (tiles[ti].tileName === name) {
                index = ti + (which-1);
                break;                
            }
        }

    } else
        throw new Error("PGTile constructor given bad param type");

    if (index < PGTile.prototype.TILE_INDEX.TEEN_1 || index > PGTile.prototype.TILE_INDEX.GEE_JOON_2) pgTileSelectorFatal("bad numeric constructor param " + index);
    this._index = index;
    this._obj = tiles[index];
}

/*
* @method json
*
* return the json object representing this, suitable for sending to the client.
*
*/
PGTile.prototype.json = function() {
    return JSON.stringify(tiles[this._index]);
};

/* @method deck
*
* return an array of PGTiles that make up a deck of tiles
*
*/
PGTile.prototype.deck = function() {
    var deck = [];
    for (var ti in PGTile.prototype.TILE_INDEX)
        deck.push(new PGTile(PGTile.prototype.TILE_INDEX[ti]));
    return deck;
};

/*
* @method name
*
* Return the char relative to the hand table ranking
*
*/
PGTile.prototype.name = function() {
    return tiles[this._index].tileName;
};

/*
* @method tileClassname
*
* Return the class for display purposes
*
*/
PGTile.prototype.divClass = function() {
    return tiles[this._index].divClass;
};

/*
* @method handChar
*
* Return the hand-char used to determine the hand table ranking
*
*/
PGTile.prototype.handChar = function() {
    return tiles[this._index].handChar;
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
    var myRank = this.tileRank();
    var hisRank = tile.tileRank();
    if (myRank > hisRank)
        return 1;
    else if (myRank < hisRank)
        return -1;
    else
        return 0;
};

/*
* @method tileRank
*
* returns the rank of this tile, the higher the better.
*/
PGTile.prototype.tileRank = function() {
    return tiles[this._index].tileRank;
};

/*
* @method pairRank
*
* returns the rank of a pair of this tile, the higher the better.
*/
PGTile.prototype.pairRank = function() {
    return tiles[this._index].pairRank;
};

// Sneaky way to make this either a require module or a Node module
if (typeof module === "undefined") {
    define([], function() {
        return PGTile;
    });
} else
    module.exports = PGTile;
