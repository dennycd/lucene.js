/**
 Defining an IO Exception for lucene 
**/
var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Exception = require('library/lucene/util/Exception.js');

var IOException = defineClass({
	name : "IOException",
	extend : Exception,
	construct : function(message,cause){
		Exception.call(this,message,cause);
	}
});

module.exports = exports = IOException;