#!/usr/bin/env node
process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');


var Lockable = require('library/thread').Lockable;
var synchronized = require('library/thread').Synchronized;
var Sleep = require('library/thread').Sleep;





module.exports = exports = {
	setUp : function(callback){
		callback();
	},
	
	tearDown : function(callback){
		callback();
	}
};



exports.testSleep = function(test){

	try{
		console.log("sleeping 1 seonc");
		Sleep.sleep(1);
		console.log("sleeping 1 sec");
		Sleep.msleep(1000);
		console.log("sleeping 1 sec");
		Sleep.usleep(1000000);
		console.log("done");	
	}catch(e){
		console.log("EXCEPTION: " + e.toString());
		test.ok(false);
	}
	
	test.done();
};

/*
var Mutex = defineClass({
	name : "Mutex",
	extend : Lockable,
	construct : function(){
		
	},
	
	methods : {}
});

exports.testLock = function(test){

	var mutex = new Mutex();
	
	//the thread that's calling this code will block and attemp to obtain the mutex resource, and then execute the fun
	//in production, this thread shall NEVER be the node.js main thread
	synchronized(mutex, function(){
		
		console.log(clc.cyan("running task"));
	});

	test.done();
}
*/