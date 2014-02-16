/*
*
* @class PGDeal
*
* This file defines the PGDeal js class.
*
* A deal consists of four tiles, which are split into two hands of two tiles each.
* There are three ways to split the tiles.
*/

var PGTile = require('./pgtile');

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

    // Sort the array.
    function compareTiles(tileA, tileB) { return tileA.compare(tileB); }
    tiles.sort(compareTiles);

    this._tiles = tiles;
}

module.exports = PGDeal;

