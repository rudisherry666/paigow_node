/*
*
* @class PGDot
*     This file defines the PGDot jS class; it can be red or white, and has a given location
*     relative to half a tile.  TODO: relative location based on what size for half a tile?
*/

/*
    the above dot numbers indicate locations for the dots.
    this is the array for the locations [top, left].
    TBD: these are for medium tiles.  We need to make them
    some sort of percentage.
*/
var locations = [
  [  0,  0 ],   //  0 placeholder: dots start at one
                //  -------------- TOP HALF ---------------
  [  4,  6 ],   //  1 top left
  [  4, 17 ],   //  2 top middle
  [  4, 28 ],   //  3 top right
  [ 24,  6 ],   //  4 middle left
  [ 24, 17 ],   //  5 middle middle
  [ 24, 28 ],   //  6 middle right
  [ 34,  6 ],   //  7 lower-middle left
  [ 34, 28 ],   //  8 lower-middle right
  [ 44,  6 ],   //  9 bottom left
  [ 44, 28 ],   // 10 bottom right
                //  -------------- BOTTOM HALF ---------------
  [ 64,  6 ],   // 11 top left
  [ 64, 28 ],   // 12 top right
  [ 74,  6 ],   // 13 upper-middle left
  [ 74, 28 ],   // 14 upper-middle right
  [ 84,  6 ],   // 15 middle left
  [ 84, 17 ],   // 16 middle middle
  [ 84, 28 ],   // 17 middle right
  [104,  6 ],   // 18 bottom left
  [104, 17 ],   // 19 bottom middle
  [104, 28 ],   // 20 bottom right
];

/*
* @constructor
*
* @param index index into the set of dot locations: 1 - 20 (0 reserved)
* @color color of the dot: 'red' or 'white'
*
*/
function PGDot(index, color) {
    if (color !== 'red' && color !== 'white') throw "PGDot: bad color " + color;
    if (index < 1 && index >= locations.length) throw "PGDot: bad index " + index;
    this._index = index;
    this._color = color;
}

/*
* @method json
*
* return the json object representing this, suitable for sending to the client.
*
*/
PGDot.prototype.json = function() {
    return {
        color: this._color,
        location: this.location()
    };
};


/*
* @method location
*
* given a character code (see class comments) and the color, returns the relevant sequence of dots 
* that should be shown for that character code.  Each tile would contain two sequences, one for
* red and one for white (and either but not both could be empty)
*
* @param char char keying which sequence it is
* @param color which color: 'red' or 'white'
*/
PGDot.prototype.location = function() {
    return locations[this._index];
};


module.exports = PGDot;
