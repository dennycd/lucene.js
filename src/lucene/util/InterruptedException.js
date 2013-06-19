var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Exception = require('library/lucene/util/Exception.js');


//REFERENCE http://docs.oracle.com/javase/7/docs/api/java/lang/InterruptedException.html
var InterruptedException = defineClass({
	name : "InterruptedException",
	extend : Exception,
	construct : function(message){
		Exception.call(this,message);
	}
});

module.exports = exports = InterruptedException;