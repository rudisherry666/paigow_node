/*
*
* @class PGHand
*
* This file defines the PGHand jS class.
*
* A hand consists of two tiles, and a deal contains two hands.  Hands are ranked
* against each other; the order of the tiles do not matter.
*/

// Sneaky way to make this either a require module or a Node module
var PGTile;
if (typeof module !== "undefined") {
    PGTile = require("./pgtile");
}

/*
* @attribute HANDS
*
* This array defines all the atributes of all hands.  Each tile has a char code
* associated with it, so two chars define the hand; although the order does not
* matter, this table assumes alphabetical order for the tiles (which is, not
* coincidentally, the ranking of the tiles).  Note there are duplicates in the
* ranking values, which indicate the two different hands are ties (only the
* higher-ranking tile is used to determine ranking when there is a hand-value tie).
*/
var HANDS = {
/*  eleven        / mixed nine    */   'hl': { rank:   0, value:  0, name: "0" },
/*  low four      / low six       */   'gk': { rank:   1, value:  0, name: "0" },
/*  long six      / low four      */   'fg': { rank:   2, value:  0, name: "0" },
/*  high ten      / low ten       */   'ei': { rank:   3, value:  0, name: "0" },
/*  harmony four  / long six      */   'df': { rank:   4, value:  0, name: "0" },
/*  harmony four  / low six       */   'dk': { rank:   4, value:  0, name: "0" },
/*  low six       / mixed five    */   'ko': { rank:   5, value:  1, name: "1" },
/*  eleven        / low ten       */   'hi': { rank:   6, value:  1, name: "1" },
/*  low four      / high seven    */   'gj': { rank:   7, value:  1, name: "1" },
/*  low four      / mixed seven   */   'gn': { rank:   7, value:  1, name: "1" },
/*  long six      / mixed five    */   'fo': { rank:   8, value:  1, name: "1" },
/*  high ten      / eleven        */   'eh': { rank:   9, value:  1, name: "1" },
/*  harmony four  / high seven    */   'dj': { rank:  10, value:  1, name: "1" },
/*  harmony four  / mixed seven   */   'dn': { rank:  10, value:  1, name: "1" },
/*  mixed seven   / mixed five    */   'no': { rank:  11, value:  2, name: "2" },
/*  high seven    / mixed five    */   'jo': { rank:  12, value:  2, name: "2" },
/*  low four      / mixed eight   */   'gm': { rank:  13, value:  2, name: "2" },
/*  long six      / low six       */   'fk': { rank:  14, value:  2, name: "2" },
/*  harmony four  / mixed eight   */   'dm': { rank:  15, value:  2, name: "2" },
/*  high eight    / harmony four  */   'cd': { rank:  16, value:  2, name: "2" },
/*  high eight    / low four      */   'cg': { rank:  16, value:  2, name: "2" },
/*  day           / high ten      */   'be': { rank:  17, value:  2, name: "2" },
/*  day           / low ten       */   'bi': { rank:  17, value:  2, name: "2" },
/*  teen          / high ten      */   'ae': { rank:  18, value:  2, name: "2" },
/*  teen          / low ten       */   'ai': { rank:  18, value:  2, name: "2" },
/*  mixed seven   / gee joon      */   'np': { rank:  19, value:  3, name: "3" },
/*  mixed eight   / mixed five    */   'mo': { rank:  20, value:  3, name: "3" },
/*  low six       / mixed seven   */   'kn': { rank:  21, value:  3, name: "3" },
/*  high seven    / gee joon      */   'jp': { rank:  22, value:  3, name: "3" },
/*  high seven    / low six       */   'jk': { rank:  22, value:  3, name: "3" },
/*  low four      / mixed nine    */   'gl': { rank:  23, value:  3, name: "3" },
/*  long six      / high seven    */   'fj': { rank:  24, value:  3, name: "3" },
/*  long six      / mixed seven   */   'fn': { rank:  24, value:  3, name: "3" },
/*  harmony four  / mixed nine    */   'dl': { rank:  25, value:  3, name: "3" },
/*  high eight    / mixed five    */   'co': { rank:  26, value:  3, name: "3" },
/*  day           / eleven        */   'bh': { rank:  27, value:  3, name: "3" },
/*  teen          / eleven        */   'ah': { rank:  28, value:  3, name: "3" },
/*  mixed eight   / gee joon      */   'mp': { rank:  29, value:  4, name: "4" },
/*  mixed nine    / mixed five    */   'lo': { rank:  30, value:  4, name: "4" },
/*  low six       / mixed eight   */   'km': { rank:  31, value:  4, name: "4" },
/*  high seven    / mixed seven   */   'jn': { rank:  32, value:  4, name: "4" },
/*  low four      / low ten       */   'gi': { rank:  33, value:  4, name: "4" },
/*  long six      / mixed eight   */   'fm': { rank:  34, value:  4, name: "4" },
/*  high ten      / low four      */   'eg': { rank:  35, value:  4, name: "4" },
/*  harmony four  / high ten      */   'de': { rank:  36, value:  4, name: "4" },
/*  harmony four  / low ten       */   'di': { rank:  36, value:  4, name: "4" },
/*  high eight    / gee joon      */   'cp': { rank:  37, value:  4, name: "4" },
/*  high eight    / long six      */   'cf': { rank:  37, value:  4, name: "4" },
/*  high eight    / low six       */   'ck': { rank:  37, value:  4, name: "4" },
/*  teen          / day           */   'ab': { rank:  38, value:  4, name: "4" },
/*  mixed eight   / mixed seven   */   'mn': { rank:  39, value:  5, name: "5" },
/*  mixed nine    / gee joon      */   'lp': { rank:  40, value:  5, name: "5" },
/*  low six       / mixed nine    */   'kl': { rank:  41, value:  5, name: "5" },
/*  high seven    / mixed eight   */   'jm': { rank:  42, value:  5, name: "5" },
/*  low ten       / mixed five    */   'io': { rank:  43, value:  5, name: "5" },
/*  low four      / eleven        */   'gh': { rank:  44, value:  5, name: "5" },
/*  long six      / mixed nine    */   'fl': { rank:  45, value:  5, name: "5" },
/*  high ten      / mixed five    */   'eo': { rank:  46, value:  5, name: "5" },
/*  harmony four  / eleven        */   'dh': { rank:  47, value:  5, name: "5" },
/*  high eight    / high seven    */   'cj': { rank:  48, value:  5, name: "5" },
/*  high eight    / mixed seven   */   'cn': { rank:  48, value:  5, name: "5" },
/*  mixed nine    / mixed seven   */   'ln': { rank:  49, value:  6, name: "6" },
/*  high seven    / mixed nine    */   'jl': { rank:  50, value:  6, name: "6" },
/*  low ten       / gee joon      */   'ip': { rank:  51, value:  6, name: "6" },
/*  low ten       / low six       */   'ik': { rank:  51, value:  6, name: "6" },
/*  eleven        / mixed five    */   'ho': { rank:  52, value:  6, name: "6" },
/*  long six      / low ten       */   'fi': { rank:  53, value:  6, name: "6" },
/*  high ten      / gee joon      */   'ep': { rank:  54, value:  6, name: "6" },
/*  high ten      / long six      */   'ef': { rank:  54, value:  6, name: "6" },
/*  high ten      / low six       */   'ek': { rank:  54, value:  6, name: "6" },
/*  high eight    / mixed eight   */   'cm': { rank:  55, value:  6, name: "6" },
/*  day           / harmony four  */   'bd': { rank:  56, value:  6, name: "6" },
/*  day           / low four      */   'bg': { rank:  56, value:  6, name: "6" },
/*  teen          / harmony four  */   'ad': { rank:  57, value:  6, name: "6" },
/*  teen          / low four      */   'ag': { rank:  57, value:  6, name: "6" },
/*  mixed nine    / mixed eight   */   'lm': { rank:  58, value:  7, name: "7" },
/*  low ten       / high seven    */   'ij': { rank:  59, value:  7, name: "7" },
/*  low ten       / mixed seven   */   'in': { rank:  59, value:  7, name: "7" },
/*  eleven        / gee joon      */   'hp': { rank:  60, value:  7, name: "7" },
/*  eleven        / low six       */   'hk': { rank:  60, value:  7, name: "7" },
/*  low four      / gee joon      */   'gp': { rank:  61, value:  7, name: "7" },
/*  long six      / eleven        */   'fh': { rank:  62, value:  7, name: "7" },
/*  high ten      / high seven    */   'ej': { rank:  63, value:  7, name: "7" },
/*  high ten      / mixed seven   */   'en': { rank:  63, value:  7, name: "7" },
/*  harmony four  / gee joon      */   'dp': { rank:  64, value:  7, name: "7" },
/*  high eight    / mixed nine    */   'cl': { rank:  65, value:  7, name: "7" },
/*  day           / mixed five    */   'bo': { rank:  66, value:  7, name: "7" },
/*  teen          / mixed five    */   'ao': { rank:  67, value:  7, name: "7" },
/*  mixed five    / gee joon      */   'op': { rank:  68, value:  8, name: "8" },
/*  low ten       / mixed eight   */   'im': { rank:  69, value:  8, name: "8" },
/*  eleven        / high seven    */   'hj': { rank:  70, value:  8, name: "8" },
/*  eleven        / mixed seven   */   'hn': { rank:  70, value:  8, name: "8" },
/*  high ten      / mixed eight   */   'em': { rank:  71, value:  8, name: "8" },
/*  harmony four  / low four      */   'dg': { rank:  72, value:  8, name: "8" },
/*  high eight    / high ten      */   'ce': { rank:  73, value:  8, name: "8" },
/*  high eight    / low ten       */   'ci': { rank:  73, value:  8, name: "8" },
/*  day           / gee joon      */   'bp': { rank:  74, value:  8, name: "8" },
/*  day           / long six      */   'bf': { rank:  74, value:  8, name: "8" },
/*  day           / low six       */   'bk': { rank:  74, value:  8, name: "8" },
/*  teen          / gee joon      */   'ap': { rank:  75, value:  8, name: "8" },
/*  teen          / long six      */   'af': { rank:  75, value:  8, name: "8" },
/*  teen          / low six       */   'ak': { rank:  75, value:  8, name: "8" },
/*  low six       / gee joon      */   'kp': { rank:  76, value:  9, name: "9" },
/*  low ten       / mixed nine    */   'il': { rank:  77, value:  9, name: "9" },
/*  eleven        / mixed eight   */   'hm': { rank:  78, value:  9, name: "9" },
/*  low four      / mixed five    */   'go': { rank:  79, value:  9, name: "9" },
/*  long six      / gee joon      */   'fp': { rank:  80, value:  9, name: "9" },
/*  high ten      / mixed nine    */   'el': { rank:  81, value:  9, name: "9" },
/*  harmony four  / mixed five    */   'do': { rank:  82, value:  9, name: "9" },
/*  high eight    / eleven        */   'ch': { rank:  83, value:  9, name: "9" },
/*  day           / high seven    */   'bj': { rank:  84, value:  9, name: "high nine" },
/*  day           / mixed seven   */   'bn': { rank:  84, value:  9, name: "high nine" },
/*  teen          / high seven    */   'aj': { rank:  85, value:  9, name: "high nine" },
/*  teen          / mixed seven   */   'an': { rank:  85, value:  9, name: "high nine" },
/*  day           / high eight    */   'bc': { rank:  86, value: 10, name: "gong" },
/*  day           / mixed eight   */   'bm': { rank:  86, value: 10, name: "gong" },
/*  teen          / high eight    */   'ac': { rank:  87, value: 10, name: "gong" },
/*  teen          / mixed eight   */   'am': { rank:  87, value: 10, name: "gong" },
/*  day           / mixed nine    */   'bl': { rank:  88, value: 11, name: "wong" },
/*  teen          / mixed nine    */   'al': { rank:  89, value: 11, name: "wong" },
/*  mixed five    / mixed five    */   'oo': { rank:  90, value: 12, name: "bo" },
/*  mixed seven   / mixed seven   */   'nn': { rank:  91, value: 13, name: "bo" },
/*  mixed eight   / mixed eight   */   'mm': { rank:  92, value: 14, name: "bo" },
/*  mixed nine    / mixed nine    */   'll': { rank:  93, value: 15, name: "bo" },
/*  low six       / low six       */   'kk': { rank:  94, value: 16, name: "bo" },
/*  high seven    / high seven    */   'jj': { rank:  95, value: 17, name: "bo" },
/*  low ten       / low ten       */   'ii': { rank:  96, value: 18, name: "bo" },
/*  eleven        / eleven        */   'hh': { rank:  97, value: 19, name: "bo" },
/*  low four      / low four      */   'gg': { rank:  98, value: 20, name: "bo" },
/*  long six      / long six      */   'ff': { rank:  99, value: 21, name: "bo" },
/*  high ten      / high ten      */   'ee': { rank: 100, value: 22, name: "bo" },
/*  harmony four  / harmony four  */   'dd': { rank: 101, value: 23, name: "bo" },
/*  high eight    / high eight    */   'cc': { rank: 102, value: 24, name: "bo" },
/*  day           / day           */   'bb': { rank: 103, value: 25, name: "bo" },
/*  teen          / teen          */   'aa': { rank: 104, value: 26, name: "bo" },
/*  gee joon      / gee joon      */   'pp': { rank: 105, value: 27, name: "gee joon" }
};

/*
* @constructor PGHand
*
* The constructor for PGHand, takes the two chars.
*
*/
function PGHand(args) {
    var prefix = "PGHand constructor ";

    function pgHandFatal(err) {
        console.log(prefix + err);
        throw new Error(prefix + err);
    }

    // If we're passed an array, use it; otherwise make an array of our arguments.
    var tiles;
    if (args instanceof Array) {
        tiles = args;
    } else {
        tiles = [];
        for (var arg in arguments)
            tiles.push(arguments[arg]);
    }
    if (tiles.length !== 2) pgHandFatal("wrong number of params");

    // Make sure the array is PGTiles.
    for (var ti = 0; ti < tiles.length; ti++) {
        var tile = new PGTile(tiles[ti]);
        if (!(tile instanceof PGTile)) pgHandFatal("argument not a PGTile");
        tiles[ti] = tile;
    }

    // Make it so tile1 is the higher tile
    switch (tiles[0].compare(tiles[1])) {
        case 1:
        case 0:
            this._tile1 = tiles[0];
            this._tile2 = tiles[1];
        break;

        default:
            this._tile2 = tiles[0];
            this._tile1 = tiles[1];
        break;
    }

    // If we don't have this in the rankings, it's bad.
    if (typeof this.rank() !== "number")
        throw "PGHand constructor got bad chars " + this._chars;
}

PGHand.prototype._obj = function() {
    var chars = this._tile1.handChar() + this._tile2.handChar();
    return HANDS[chars];
};

/*
* @method rank
*
* Return the ranking of this hand, higher is better.
*
*/
PGHand.prototype.rank = function() {
    return this._obj().rank;
};

/*
* @method value
*
* Return the value of this hand, which is the sum of the values
* for everything 9 or less, but higher numbers for gong, wong
* and bo's.  Used when evening the numbers, not that useful if
* high-nine or better.
*
*/
PGHand.prototype.value = function() {
    return this._obj().value;
};

/*
* @method name
*
* Return the name of this hand for UI purposes.
*
*/
PGHand.prototype.name = function() {
    return this._obj().name;
};

/*
* @method tiles
*
* Return the array of tiles of this hand.
*
*/
PGHand.prototype.tiles = function() {
    return [ this._tile1, this._tile2 ];
};

/*
* @method compare
*
* Returns the canonical comparison: -1 if it's less than the param, 0 if equal, 1 if greater.
*
* Note that this is comparison for game, which means two hands that aren't identical may be the same,
* if their hand value is the same and their high tile is the same.  For instance, day/high-ten and
* and day/low-ten are equal because their value is 2 and the high tile is the day.
*
* @param hand the other hand to compare against
*
*/
PGHand.prototype.compare = function(hand) {
    if (!hand) throw "PGHand.compare given null hand to compare";
    var myRank = this.rank();
    var hisRank = hand.rank();
    if (myRank > hisRank)
        return 1;
    else if (myRank < hisRank)
        return -1;
    else
        return 0;
};

// Sneaky way to make this either a require module or a Node module
if (typeof module === "undefined") {
    define(["./pgtile"], function(tile) {
        PGTile = tile;
        return PGHand;
    });
} else
    module.exports = PGHand;
