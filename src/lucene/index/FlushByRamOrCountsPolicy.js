var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');


var FlushByRamOrCountsPolicy = defineClass({
	name : "FlushByRamOrCountsPolicy"
});

module.exports = exports = FlushByRamOrCountsPolicy;