var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Throwable = require('library/lucene/util/Throwable.js');

/**
 The class Exception and its subclasses are a form of Throwable that indicates conditions that a reasonable application might want to catch.
**/
var Exception = defineClass({
	name : "Exception",
	extend : Throwable,
	construct : function(message,cause){
		Throwable.call(this,message,cause);
	}
});

module.exports = exports = Exception;