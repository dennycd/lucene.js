var util = require('util');
var assert = require('assert');

var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');

/**
 * Base interface for attributes.
 */
var Attribute = defineInterface({
	name: "Attribute",
	methods: {}
});
module.exports = exports = Attribute;