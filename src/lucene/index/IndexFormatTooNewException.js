var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var CorruptIndexException = require('./CorruptIndexException.js');
var IndexFormatTooNewException = defineClass({
	name : "IndexFormatTooNewException",
	extend : CorruptIndexException
});
module.exports = exports = IndexFormatTooNewException;