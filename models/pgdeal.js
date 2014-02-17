/*
*
* @class PGDeal
*
* This file defines the PGDeal js class.
*
* A deal consists of four tiles, which are split into two hands of two tiles each.
* There are three ways to split the tiles.
*/

var PGTile = require('./pgtile'),
    PGHand = require('./pghand');

/*
* @constructor PGDeal
*
* The constructor for PGDeal, takes any of several possible inputs:
* * four PGTiles
* * an array of four PGTiles
*/
function PGDeal(tiles, tile2, tile3, tile4) {
    if (!tiles) throw "PGDeal constructor called with no params!";

    // Turn the parameters into an array.
    if (!(tiles instanceof Array)) {
        if (arguments.length !== 4) throw "PGDeal called with wrong number of tiles: " + arguments.length;
        tiles = [tiles, tile2, tile3, tile4];
    } else {
        if (tiles.length !== 4) throw "PGDeal called with array with wrong length: " + tiles.length;
    }

    // Maybe: sort the array from highest rank to lowest.
    // function compareTiles(tileA, tileB) { return tileB.compare(tileA); }
    // tiles.sort(compareTiles);

    this._tiles = tiles;
}

/*
* @method hands
*
* Given the four tiles, return two hands.
*
*/
PGDeal.prototype.hands = function() {
    // Hands are cached.
    if (this._hands)
        return this._hands;
    else
        return this._makeHands();
};

PGDeal.prototype._makeHands = function() {
    this._hands = [
        new PGHand(this._tiles[0], this._tiles[1]),
        new PGHand(this._tiles[2], this._tiles[3])
    ];
    return this._hands;
};

module.exports = PGDeal;

