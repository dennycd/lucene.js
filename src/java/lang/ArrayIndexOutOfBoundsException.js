var util = require('util');
var assert = require('assert');
var defineClass = require('simple-cls').defineClass;
var Class = require('library/class/Class.js');
var RuntimeException = require('library/lucene/util/RuntimeException.js');


var ArrayIndexOutOfBoundsException = defineClass({
	name : "ArrayIndexOutOfBoundsException",
	extend : RuntimeException,
	construct : function(message){
		RuntimeException.call(this,message);
	}
});
module.exports = exports = ArrayIndexOutOfBoundsException;