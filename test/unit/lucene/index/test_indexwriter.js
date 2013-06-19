process.chdir("../../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var fs = require('fs');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');
var defineInterface = require('library/class/defineInterface.js');
var defineClass = require('library/class/defineClass.js');


var LiveIndexWriterConfig = require('library/lucene/index/LiveIndexWriterConfig.js');
var IndexWriterConfig = require('library/lucene/index/IndexWriterConfig.js');


//invoked for every single test cases
module.exports = exports = {
	setUp: function(callback) {
		callback();
	},
	tearDown: function(callback) {
		defineInterface.reset();
		defineClass.reset();
		callback();
	}
};


exports.testIndexWriterConfig = function(test){
	
	
	
	test.done();
}
