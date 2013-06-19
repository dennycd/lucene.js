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

var Term = require('library/lucene/index/Term.js');

module.exports.testTerm = function(test){
	
	var t1 = new Term("content", "dsfdai");
	var t2 = 
	
	
	test.done();
}