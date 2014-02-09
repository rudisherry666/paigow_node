var assert = require('assert'),
	PGDot = require('../models/pgdot.js');

describe('PGDot', function() {
	it('should return a PGDot object', function() {
		var pgDot = new PGDot(3, 'red');
		assert.notEqual(pgDot, null);
	});
	it('should get the color right', function() {
		var pgDot = new PGDot(3, 'red');
		assert.equal(pgDot._color, 'red');
	});
	it('should throw on the wrong color', function() {
		assert.throws(function() {
			new PGDot(3, 'blue')
		});
	});
});
