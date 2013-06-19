var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var InfoStream = defineClass({
	name : "InfoStream",
	statics : {
		getDefault : function(){ return {}; }
	}
});
module.exports = exports = InfoStream;