var util = require('util');
var assert = require('assert');
var defineInterface = require('library/class/defineInterface.js');

var Cloneable = defineInterface({
	name : "Cloneable",
	methods : {
		clone : function(){}
	}
})
module.exports = exports = Cloneable;