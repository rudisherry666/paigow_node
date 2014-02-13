/*
*
* @class PGHand
*
* This file defines the PGHand jS class.
*
* A hand consists of two tiles, and a deal contains two hands.  Hands are ranked
* against each other; the order of the tiles do not matter.
*/

var PGTile = require('./pgtile');

/*
* @attribute rankings
*
* This array defines all the rankings of the hands.  Each tile has a char code
* associated with it, so two chars define the hand; although the order does not
* matter, this table assumes alphabetical order for the tiles (which is, not
* coincidentally, the ranking of the tiles).
*/
var _rankings = {
    'hl': 0,    // eleven / mixed nine
    'gk': 0,    // low four / low six
    'fg': 0,    // long six / low four
    'ei': 0,    // high ten / low ten
    'df': 0,    // harmony four / long six
    'dk': 0,    // harmony four / low six
    'ko': 5,    // low six / mixed five
    'hi': 6,    // eleven / low ten
    'gj': 7,    // low four / high seven
    'gn': 7,    // low four / mixed seven
    'fo': 8,    // long six / mixed five
    'eh': 9,    // high ten / eleven
    'dj': 10,    // harmony four / high seven
    'dn': 10,    // harmony four / mixed seven
    'no': 11,    // mixed seven / mixed five
    'jo': 12,    // high seven / mixed five
    'gm': 13,    // low four / mixed eight
    'fk': 14,    // long six / low six
    'dm': 15,    // harmony four / mixed eight
    'cd': 16,    // high eight / harmony four
    'cg': 16,    // high eight / low four
    'be': 17,    // day / high ten
    'bi': 17,    // day / low ten
    'ae': 18,    // teen / high ten
    'ai': 18,    // teen / low ten
    'np': 19,    // mixed seven / gee joon
    'mo': 20,    // mixed eight / mixed five
    'kn': 21,    // low six / mixed seven
    'jp': 22,    // high seven / gee joon
    'jk': 22,    // high seven / low six
    'gl': 23,    // low four / mixed nine
    'fj': 24,    // long six / high seven
    'fn': 24,    // long six / mixed seven
    'dl': 25,    // harmony four / mixed nine   # magic number for low hands
    'co': 26,    // high eight / mixed five
    'bh': 27,    // day / eleven
    'ah': 28,    // teen / eleven
    'mp': 29,    // mixed eight / gee joon
    'lo': 30,    // mixed nine / mixed five
    'km': 31,    // low six / mixed eight
    'jn': 32,    // high seven / mixed seven
    'gi': 33,    // low four / low ten
    'fm': 34,    // long six / mixed eight
    'eg': 35,    // high ten / low four
    'de': 36,    // harmony four / high ten
    'di': 36,    // harmony four / low ten
    'cp': 37,    // high eight / gee joon
    'cf': 37,    // high eight / long six
    'ck': 37,    // high eight / low six
    'ab': 38,    // teen / day
    'mn': 39,    // mixed eight / mixed seven
    'lp': 40,    // mixed nine / gee joon
    'kl': 41,    // low six / mixed nine
    'jm': 42,    // high seven / mixed eight
    'io': 43,    // low ten / mixed five
    'gh': 44,    // low four / eleven
    'fl': 45,    // long six / mixed nine
    'eo': 46,    // high ten / mixed five
    'dh': 47,    // harmony four / eleven
    'cj': 48,    // high eight / high seven
    'cn': 48,    // high eight / mixed seven
    'ln': 49,    // mixed nine / mixed seven
    'jl': 50,    // high seven / mixed nine
    'ip': 51,    // low ten / gee joon
    'ik': 51,    // low ten / low six
    'ho': 52,    // eleven / mixed five
    'fi': 53,    // long six / low ten
    'ep': 54,    // high ten / gee joon
    'ef': 54,    // high ten / long six
    'ek': 54,    // high ten / low six
    'cm': 55,    // high eight / mixed eight
    'bd': 56,    // day / harmony four
    'bg': 56,    // day / low four
    'ad': 57,    // teen / harmony four
    'ag': 57,    // teen / low four
    'lm': 58,    // mixed nine / mixed eight
    'ij': 59,    // low ten / high seven
    'in': 59,    // low ten / mixed seven
    'hp': 60,    // eleven / gee joon
    'hk': 60,    // eleven / low six
    'gp': 61,    // low four / gee joon
    'fh': 62,    // long six / eleven
    'ej': 63,    // high ten / high seven
    'en': 63,    // high ten / mixed seven
    'dp': 64,    // harmony four / gee joon
    'cl': 65,    // high eight / mixed nine
    'bo': 66,    // day / mixed five
    'ao': 67,    // teen / mixed five
    'op': 68,    // mixed five / gee joon
    'im': 69,    // low ten / mixed eight
    'hj': 70,    // eleven / high seven
    'hn': 70,    // eleven / mixed seven
    'em': 71,    // high ten / mixed eight
    'dg': 72,    // harmony four / low four
    'ce': 73,    // high eight / high ten
    'ci': 73,    // high eight / low ten
    'bp': 74,    // day / gee joon
    'bf': 74,    // day / long six
    'bk': 74,    // day / low six
    'ap': 75,    // teen / gee joon
    'af': 75,    // teen / long six
    'ak': 75,    // teen / low six
    'kp': 76,    // low six / gee joon
    'il': 77,    // low ten / mixed nine
    'hm': 78,    // eleven / mixed eight
    'go': 79,    // low four / mixed five
    'fp': 80,    // long six / gee joon
    'el': 81,    // high ten / mixed nine
    'do': 82,    // harmony four / mixed five
    'ch': 83,    // high eight / eleven
    'bj': 84,    // day / high seven
    'bn': 84,    // day / mixed seven
    'aj': 85,    // teen / high seven
    'an': 85,    // teen / mixed seven
    'bc': 86,    // day / high eight
    'bm': 86,    // day / mixed eight
    'ac': 87,    // teen / high eight
    'am': 87,    // teen / mixed eight
    'bl': 88,    // day / mixed nine
    'al': 89,    // teen / mixed nine
    'oo': 90,    // mixed five / mixed five
    'nn': 91,    // mixed seven / mixed seven
    'mm': 92,    // mixed eight / mixed eight
    'll': 93,    // mixed nine / mixed nine
    'kk': 94,    // low six / low six
    'jj': 95,    // high seven / high seven
    'ii': 96,    // low ten / low ten
    'hh': 97,    // eleven / eleven
    'gg': 98,    // low four / low four
    'ff': 99,    // long six / long six
    'ee': 100,    // high ten / high ten
    'dd': 101,    // harmony four / harmony four
    'cc': 102,    // high eight / high eight
    'bb': 103,    // day / day
    'aa': 104,    // teen / teen
    'pp': 105,    // gee joon / gee joon
};

/*
* @constructor PGHand
*
* The constructor for PGHand, takes the two chars.
*
*/
function PGHand(tile1, tile2) {
    if (!tile1 || !tile2) throw "PGHand constructor not given two tiles";

    // Make it so tile1 is the higher tile
    switch (tile1.compare(tile2)) {
        case 1:
        case 0:
            this._tile1 = tile1;
            this._tile2 = tile2;
        break;

        default:
            this._tile1 = tile1;
            this._tile2 = tile2;
        break;
    }

    // If we don't have this in the rankings, it's bad.
    if (!this.rank())
        throw "PGHand constructor got bad chars " + this._chars;
}

/*
* @method ranking
*
* Return the ranking of this hand, higher is better.
*
*/
PGHand.prototype.rank = function() {
    var chars = this._tile1.handChar() + this._tile2.handChar();
    return _rankings[chars];
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
    if (!hand) throw "PGTile.compare given null hand to compare"
    var myRank = this.rank();
    var hisRank = hand.rank();
    if (myRank > hisRank)
        return 1;
    else if (myRank < hisRank)
        return -1;
    else
        return 0;
};

module.exports = PGHand;
