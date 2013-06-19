var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

/**
 REFERENCE http://docs.oracle.com/javase/7/docs/api/java/io/FileInputStream.html
 
 A FileInputStream obtains input bytes from a file in a file system. What files are available depends on the host environment.
**/
var FileInputStream = defineClass({
	name : "FileInputStream"
	
});

module.exports = exports = FileInputStream;