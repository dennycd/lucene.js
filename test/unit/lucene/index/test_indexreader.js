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


var IndexReader = require('library/lucene/index/IndexReader.js');
var AtomicReader = require('library/lucene/index/AtomicReader.js');
var DirectoryReader = require('library/lucene/index/DirectoryReader.js');
var StandardDirectoryReader = require('library/lucene/index/StandardDirectoryReader.js');

//invoked for every single test cases
module.exports = exports = {
	setUp: function(callback) {
		callback();
	},
	tearDown: function(callback) {
		callback();
	}
};


exports.testIndexReader = function(test){
		
	test.done();
}
