var util = require('util');
var assert = require('assert');
var Class = require('library/class/Class.js');
var Lockable = require('library/thread').Lockable;

/**
 Synchronized access function
 
 @param lock - a lockable object 
 @param runner - a function block to run upon acquiring the lock resource
 			function(){}
**/
var Synchronized = function(lock, runner){	
	assert(Class.isInstanceOfClass(lock, "Lockable") && typeof(runner)=="function");
	lock.obtain();  //blocking 
	runner();
	lock.release(); 
}


module.exports = exports = Synchronized;