var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

/**
http://docs.oracle.com/javase/7/docs/api/java/lang/Thread.html

A thread is a thread of execution in a program.
**/
var Thread = defineClass({
	name : "Thread"
});

module.exports = exports = Thread;
