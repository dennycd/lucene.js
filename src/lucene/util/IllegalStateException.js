var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var RuntimeException = require('library/lucene/util/RuntimeException.js');
/**
Signals that a method has been invoked at an illegal or inappropriate time. In other words, the Java environment or Java application is not in an appropriate state for the requested operation.
**/
var IllegalStateException = defineClass({
	name : "IllegalStateException",
	extend : RuntimeException,
	construct : function(message,cause){
		RuntimeException.call(this,message,cause);
	}
});

module.exports = exports = IllegalStateException;