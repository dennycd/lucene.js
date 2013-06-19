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
var DirectoryReader = require('library/lucene/index/DirectoryReader.js');
var FSDirectory = require('library/lucene/store/FSDirectory.js');
var File = require('library/lucene/util/File.js');
var TermQuery = require('library/lucene/search/TermQuery.js');
var Term = require('library/lucene/index/Term.js');
var IndexSearcher = require('library/lucene/search/IndexSearcher.js');



module.exports.testTermQuery = function(test) {
	try {
		var index = "workspace/index";
		var t1 = new Term("content", " dfdf");
		var query = new TermQuery(t1);
		
		
		var directory = FSDirectory.open(new File(index));
		test.ok(directory);
		
		console.log("loading reader");
		var reader = DirectoryReader.open(directory); //IndexReader
		test.ok(reader);
		
		
		console.log("loading searcher");
		var searcher = new IndexSearcher(reader); //IndexSearcher
		

		var topDocs = searcher.searchWithQuery(query, 10);

		
	} catch (e) {
		console.log(clc.red(e.toString()));
		test.ok(false);
	}
	test.done();
}