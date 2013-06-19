process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');
var lockfile = require('lockfile'); 
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var Lock = require('library/lucene/store/Lock.js');

console.log(clc.reset);
//should do this before handle
module.exports = exports = {
	setUp: function(callback) {
		callback();
	},
	tearDown: function(callback) {
		callback();
	}
};



var LockMock = defineClass({
	name : "LockMock",
	extend : Lock,
	construct : function(){
		Lock.apply(this,arguments);
		this.lockAttempts = 0;
	},
	methods : {
        //@Override
        obtain : function() {
            this.lockAttempts++;
            return false;
        },
        //@Override
        release : function() {
            // do nothing
        },
        //@Override
        isLocked : function() {
            return false;
        }
     }
})


exports.testObtain = function(test) {
	var lock = new LockMock();
	Lock.LOCK_POLL_INTERVAL = 10; //pool every 10 milisecs
	
	try {
	    lock.obtainWithWaitTimeout(Lock.LOCK_POLL_INTERVAL); //timeout equals to wait time, should don only twice
	    test.ok(false,"Should have failed to obtain lock");
	} catch (e) {
		console.log("exception: " + e.toString());
		test.equal(lock.lockAttempts, 2, "should attempt to lock more than once");
	}
	
	test.done();
}


/*
exports.testLockFile = function(test) { 
	var fd = lockfile.lockSync('workspace/test.lock');
	console.log(clc.cyan("fd=" + fd));
	test.ok(lockfile.checkSync('workspace/test.lock') == true);
	console.log("unlocking file");
	lockfile.unlockSync('workspace/test.lock');
	test.ok(lockfile.checkSync('workspace/test.lock') == false);
	console.log("test done");
	test.done();
};
*/


exports.testFunc = function(test) {
	test.done();
}


