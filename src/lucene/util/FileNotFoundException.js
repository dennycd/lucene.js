var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IOEXception = require('library/lucene/util/IOException.js');
/**
Signals that an attempt to open the file denoted by a specified pathname has failed.
This exception will be thrown by the FileInputStream, FileOutputStream, and RandomAccessFile constructors when a file with the specified pathname does not exist. It will also be thrown by these constructors if the file does exist but for some reason is inaccessible, for example when an attempt is made to open a read-only file for writing.
**/
var FileNotFoundException = defineClass({
	name: "FileNotFoundException",
	extend: IOEXception,
	construct: function(message) {
		IOEXception.call(this, message);
	}
});
module.exports = exports = FileNotFoundException;