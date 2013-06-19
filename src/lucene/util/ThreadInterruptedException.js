var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var RuntimeException = require('library/lucene/util/RuntimeException.js');
/* var InterruptedException = require('library/lucene/util/InterruptedException.js'); */


var ThreadInterruptedException = defineClass({
	name : "ThreadInterruptedException",
	extend : RuntimeException,
	construct : function(exp){
		RuntimeException.call(this,exp);
	}
});

module.exports = exports = ThreadInterruptedException;