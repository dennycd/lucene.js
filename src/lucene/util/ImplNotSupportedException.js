/**
 Defining an IO Exception for lucene 
**/
var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Exception = require('library/lucene/util/Exception.js');


var ImplNotSupportedException = defineClass({
	name : "ImplNotSupportedException",
	extend : Exception,
	construct : function(message){
		Exception.call(this, message);
	}
});

module.exports = exports = ImplNotSupportedException;