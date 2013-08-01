var util = require('util');
var assert = require('assert');
var defineClass = require('simple-cls').defineClass;
var Class = require('simple-cls').Class;
var RuntimeException = require('library/lucene/util/RuntimeException.js');


var UnsupportedOperationException = defineClass({
	name : "UnsupportedOperationException",
	extend : RuntimeException,
	construct : function(message){
		RuntimeException.call(this,message);
	}
});
module.exports = exports = UnsupportedOperationException;