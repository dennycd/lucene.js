/**
 Thrown to indicate that a method has been passed an illegal or inappropriate argument.
**/
var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Exception = require('library/lucene/util/Exception.js');

var IllegalArgumentException = defineClass({
	name : "IllegalArgumentException",
	extend : Exception,
	construct : function(message){
		Exception.call(this,message);
	}
});

module.exports = exports = IllegalArgumentException;