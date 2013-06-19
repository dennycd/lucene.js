var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IOException = require('library/lucene/util/IOException.js');

/**
 * This exception is thrown when the <code>write.lock</code>
 * could not be released.
 * @see Lock#release()
 */
var LockReleaseFailedException = defineClass({
	name : "LockReleaseFailedException",
	extend : IOException,
	construct : function(message){
		IOException.call(this,message);
	}
});

module.exports = exports = LockReleaseFailedException;