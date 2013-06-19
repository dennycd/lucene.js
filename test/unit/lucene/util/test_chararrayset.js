process.chdir("../../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var fs = require('fs');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var List = require('library/lucene/util/List.js');


module.exports = exports = {
	setUp : function(callback){
		callback();
	},
	tearDown : function(callback){
		callback();
	}
	
};



module.exports.testCharSetArray = function(test){
	
	try{
		var CharArraySet = require('library/lucene/util/CharArraySet.js');
		var Version = require('library/lucene/util/Version.js');
		
		CharArraySet.copy(Version.LUCENE_CURRENT, new List());
		
		//test.ok(CharArraySet.EMPTY_SET);
	}catch(e){
		console.log(clc.red(e.toString()));
		test.ok(false);
	}
	
	test.done();
};

