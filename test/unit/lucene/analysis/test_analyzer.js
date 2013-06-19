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


var Analyzer = require('library/lucene/analysis/Analyzer.js');
var StopwordAnalyzerBase = require('library/lucene/analysis/StopwordAnalyzerBase.js');
var StandardAnalyzer = require('library/lucene/analysis/StandardAnalyzer.js');


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


exports.testAnalyzer = function(test){
	
	
	
	test.done();
}

