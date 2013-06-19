process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');

module.exports = exports = {
	setUp : function(callback){
		callback();
	},
	
	tearDown : function(callback){
		callback();
	}
};

exports.testLock = function(test){
	test.expect(0);
	
	
	
	test.done();
}