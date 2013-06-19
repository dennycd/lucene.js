var util = require('util');
var assert = require('assert');
var defineInterface = require('library/class/defineInterface.js');
var ImplNotSupportedException = require('./ImplNotSupportedException.js');

var Closeable = defineInterface({
	name : "Closeable",
	methods : {
		close : function(){}
	}
});

module.exports = exports = Closeable;