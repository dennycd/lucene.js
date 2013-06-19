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
var File = require('library/lucene/util/File.js');
var RandomAccessFile = require('library/lucene/util/RandomAccessFile.js');
console.log(clc.reset);


//should do this before handle
module.exports = exports = {
	
	setUp : function(callback){
		this.testpath = "workspace/testdir/1";
		this.testfile = "workspace/testdir/denny.db";
		callback();
	},
	
	tearDown : function(callback){
		callback();
	}
	
};



exports.testRamdomAccessFile = function(test){
	//test.expect(3);
	
	var dir = new File(this.testpath);
	test.ok(dir.mkdirs());
	
	
	var raf = null;
	var testfile = new File(this.testfile);
	
	try{
		raf = new RandomAccessFile(testfile, "rw");
	}catch(e){
		logger.error("exception: " + util.inspect(e));
		test.ok(null);
		return test.done();
	}
	test.ok(true);
			
	//file exists and zero length
	test.ok(testfile.exists());
	test.ok(testfile.length()==0)
	test.ok(testfile.length() == raf.length());
	
	
	//setlength
	try{
		raf.setLength(1024);  //extend
		test.ok(raf.length() == 1024);
		
		raf.setLength(128); //truncate
		test.ok(raf.length() == 128)
		
	}catch(e){
		test.ok(false);
		return test.done();
	}
	
	
	//write 
	try{
		raf.setLength(0);
	
		//write at begin
		raf.seek(0);
		raf.write(new Buffer("hello world"), 0, "hello world".length);		
		test.ok(raf.length() == "hello world".length);
		
		
		//appending write
		raf.write(new Buffer(" from denny"), 0, " from denny".length);		
		test.ok(raf.length() == "hello world from denny".length);

		
	}catch(e){
		logger.error("exception: " + util.inspect(e));
		test.ok(false);
		return test.done();	
	}
	
	try{
		raf.close();
	}catch(e){
		test.ok(false);
		return test.done();
	}
		
	

	test.done();
}



exports.testMkdirs = function(test){
	test.expect(3); //one assertion

	var file = new File(this.testpath);
	if(file.exists() && file.isDirectory())
		test.ok(file.delete(), "failed to delete");

	test.ok(file.mkdirs(), "failed to mkdirs");
	test.ok(file.exists() && file.isDirectory());
	test.done();
};


exports.testCanonicalPath = function(test){
	
	test.expect(1);
	var file = new File(this.testpath);	
	var actualPath = process.cwd() + "/" + this.testpath;
	if(actualPath.charAt(actualPath.length-1)=="/") actualPath = actualPath.substr(0, actualPath.length-1);
	test.equal(actualPath,file.getCanonicalPath(), "canonical path not eqaul, actual=" + actualPath + " computed=" + file.getCanonicalPath());
	test.done();
};

exports.testTime = function(test){
	
	test.expect(1);
	
	var file = new File(this.testpath);	
	var modtime = file.lastModified();
	console.log(clc.blueBright("modtime="+modtime));
	var date = new Date(modtime);
	console.log(clc.blueBright("date="+date.toString()));
	test.equal(date.getTime(), modtime, "time value not valid  modtime = " + modtime);
	
	test.done();
}


exports.testSize = function(test){
	test.expect(1);
	var file = new File(this.testpath);	
	var size = file.length();
	console.log(clc.blueBright("size="+size));	
	test.ok(size,"size invalid");
	test.done();
}


exports.testPermission = function(test){
	test.expect(1);
	var testfile = new File("./workspace/denny.db");
	var raf = new RandomAccessFile(testfile,"rw"); 	
	test.ok(testfile.canRead()); //the file we created ourself must be readable
	test.done();
}



