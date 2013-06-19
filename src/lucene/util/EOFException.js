var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IOEXception = require('library/lucene/util/IOException.js');


var EOFException = defineClass({
	name : "EOFException",
	extend : IOEXception,
	construct : function(message){
		IOEXception.call(this, message);
	}
});

module.exports = exports = EOFException;