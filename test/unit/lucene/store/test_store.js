process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');

var Directory = require('library/lucene/store/Directory.js');
var FSDirectory = require('library/lucene/store/FSDirectory.js');
var File = require('library/lucene/util/File.js');


/**
 Store Module Integration Test
**/
module.exports = exports = {
	setUp : function(callback){
		callback();
	},
	
	tearDown : function(callback){
		callback();
	}
};



exports.testIndexMain = function(test){
	test.expect(0);
	
	var indexPath = "workspace/index";
	
	try{
		var dir = FSDirectory.open(new File(indexPath));
		
		
		
		
	}catch(e){
		console.log("EEROR: " + e.toString());
		test.ok(false);
	}
	
	test.done();
}