var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var RuntimeException = require('library/lucene/util/RuntimeException.js');


var NoSuchElementException = defineClass({
	name : "NoSuchElementException",
	extend : RuntimeException,
	construct : function(message){
		RuntimeException.call(this,message);
	}
});
module.exports = exports = NoSuchElementException;