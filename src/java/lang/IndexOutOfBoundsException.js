var util = require('util');
var assert = require('assert');
var defineClass = require('simple-cls').defineClass;
var Class = require('simple-cls').Class;
var RuntimeException = require('library/lucene/util/RuntimeException.js');


var IndexOutOfBoundsException = defineClass({
	name : "IndexOutOfBoundsException",
	extend : RuntimeException,
	construct : function(message){
		RuntimeException.call(this,message);
	}
});
module.exports = exports = IndexOutOfBoundsException;