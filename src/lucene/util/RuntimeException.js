var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Exception = require('library/lucene/util/Exception.js');

var RuntimeException = defineClass({
	name : "RuntimeException",
	extend : Exception,
	construct : function(message, cause){
		Exception.call(this, message, cause);
	}
});

module.exports = exports = RuntimeException;