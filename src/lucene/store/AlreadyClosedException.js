var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IllegalStateException = require('library/lucene/util/IllegalStateException.js');

/**
 * This exception is thrown when there is an attempt to
 * access something that has already been closed.
 */
var AlreadyClosedException = defineClass({
	name : "AlreadyClosedException",
	extend : IllegalStateException,
	construct : function(message){
		IllegalStateException.call(this,message);
	}
});

module.exports = exports = AlreadyClosedException;