var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IOException = require('library/lucene/util/IOException.js');


/**
 * This exception is thrown when the <code>write.lock</code>
 * could not be acquired.  This
 * happens when a writer tries to open an index
 * that another writer already has open.
 * @see Lock#obtain(long)
 */
var LockObtainFailedException = defineClass({
	name : "LockObtainFailedException",
	extend : IOException,
	construct : function(message){
		IOException.call(this,message);
	}
});

module.exports = exports = LockObtainFailedException;