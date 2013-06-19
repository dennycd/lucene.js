var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var util = require('util');
var assert = require('assert');
var os = require('os');

var OSARCH = {
	'64BIT' : "x64",
	'32BIT' : "ia32"
}

/**
 * Some useful constants.
 **/
var Constants = {};

Constants.LUCENE_MAIN_VERSION = "4.2"; //ident("4.2");
Constants.OS_IS_64BIT = (os.arch()==OSARCH['64BIT']);


/*
// this method prevents inlining the final version constant in compiled classes,
// see: http://www.javaworld.com/community/node/3400
var ident = function(s) {
	return s.toString();
}
*/
  

module.exports = exports = Constants;