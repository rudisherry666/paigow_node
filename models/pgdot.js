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
    [  0,  0 ],   // placeholder: dots start at one
    [  4,  6 ],
    [  4, 17 ],
    [  4, 28 ],
    [ 24,  6 ],
    [ 24, 17 ],
    [ 24, 28 ],
    [ 34,  6 ],
    [ 34, 28 ],
    [ 44,  6 ],
    [ 44, 28 ],
    [ 64,  6 ],
    [ 64, 28 ],
    [ 74,  6 ],
    [ 74, 28 ],
    [ 84,  6 ],
    [ 84, 17 ],
    [ 84, 28 ],
    [104,  6 ],
    [104, 17 ],
    [104, 28 ],
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
}


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
}


module.exports = PGDot;
