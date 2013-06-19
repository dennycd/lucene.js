var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var FileNotFoundException = require('library/lucene/util/FileNotFoundException.js');

var IndexNotFoundException = defineClass({
	name : "IndexNotFoundException",
	extend : FileNotFoundException
});
module.exports = exports = IndexNotFoundException;