process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');


var DataInput = require('library/lucene/store/DataInput.js');
var IndexInput = require('library/lucene/store/IndexInput.js');
var BufferedIndexInput = require('library/lucene/store/BufferedIndexInput.js');

var DataOutput = require('library/lucene/store/DataOutput.js');
var IndexOutput = require('library/lucene/store/IndexOutput.js');
var BufferedIndexOutput = require('library/lucene/store/BufferedIndexOutput.js');

var Directory = require('library/lucene/store/Directory.js');
var FSDirectory = require('library/lucene/store/FSDirectory.js');

var SimpleFSDirectory = require('library/lucene/store/SimpleFSDirectory.js');

var LockObtainFailedException = require('library/lucene/store/LockObtainFailedException.js');

module.exports = exports = {
	setUp : function(callback){
		callback();
	},
	
	tearDown : function(callback){
		callback();
	}
};

exports.testWriteLock = function(test){
	test.expect(0);

	var indexPath = "workspace/index";
	var WRITE_LOCK_NAME = "write.lock";


	Directory dir = FSDirectory.open(new File(indexPath));

	var writeLock  = directory.makeLock(WRITE_LOCK_NAME);
    if (!writeLock.obtain(config.getWriteLockTimeout())) // obtain write lock
      throw new LockObtainFailedException("Index locked for write: " + writeLock);
	
	
	
	test.done();
}





