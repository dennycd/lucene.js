"use strict";
process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');

var Directory = require('library/lucene/store/Directory.js');
var FSDirectory = require('library/lucene/store/FSDirectory.js');
var Version = require('library/lucene/util/Version.js');
var StandardAnalyzer = require('library/lucene/analysis/StandardAnalyzer.js');
var OpenMode = require('library/lucene/index/IndexWriterConfig.js').OpenMode;

var Field = require('library/lucene/document/Field.js');
var StringField = require('library/lucene/document/StringField.js');
var LongField = require('library/lucene/document/LongField.js');
var TextField = require('library/lucene/document/TextField.js');
var Document = require('library/lucene/document/Document.js');
var Term = require('library/lucene/document/Term.js');

var BufferedReader = require('library/lucene/util/BufferedReader.js');
var InputStreamReader = require('library/lucene/util/InputStreamReader.js');
var FileInputStream = require('library/lucene/util/FileInputStream.js');
var File = require('library/lucene/util/File.js');

var IndexWriter = require('library/lucene/index/IndexWriter.js');
var IndexWriterConfig = require('library/lucene/index/IndexWriterConfig.js');


function indexDocs(writer, file) {

	console.log("indexDocs");	

	// do not try to index files that cannot be read
	if (file.canRead()) {
		if (file.isDirectory()) {
			var files = file.list();
			// an IO error could occur
			if (files != null) {
				for (var i = 0; i < files.length; i++) {
					indexDocs(writer, new File(file, files[i]));
				}
			}
		} else {
			var fis = null; //FileInputStream fis;
			try {
				fis = new FileInputStream(file);
			} catch (fnfe) {
				// at least on windows, some temporary files raise this exception with an "access denied" message
				// checking if the file can be read doesn't help
				console.log(e.toString());
				return;
			}
			try {
				// make a new, empty document
				var doc = new Document();
				// Add the path of the file as a field named "path".  Use a
				// field that is indexed (i.e. searchable), but don't tokenize 
				// the field into separate words and don't index term frequency
				// or positional information:
				var pathField = new StringField("path", file.getPath(), Field.Store.YES);
				doc.add(pathField);
				// Add the last modified date of the file a field named "modified".
				// Use a LongField that is indexed (i.e. efficiently filterable with
				// NumericRangeFilter).  This indexes to milli-second resolution, which
				// is often too fine.  You could instead create a number based on
				// year/month/day/hour/minutes/seconds, down the resolution you require.
				// For example the long value 2011021714 would mean
				// February 17, 2011, 2-3 PM.
				doc.add(new LongField("modified", file.lastModified(), Field.Store.NO));
				// Add the contents of the file to a field named "contents".  Specify a Reader,
				// so that the text of the file is tokenized and indexed, but not stored.
				// Note that FileReader expects the file to be in UTF-8 encoding.
				// If that's not the case searching for special characters will fail.
				doc.add(new TextField("contents", new BufferedReader(new InputStreamReader(fis, "UTF-8"))));
				if (writer.getConfig().getOpenMode() == OpenMode.CREATE) {
					// New index, so we just add the document (no old document can be there):
					console.log("adding " + file);
					
					
					
					writer.addDocumentWithDoc(doc);
				
				
				} else {
					// Existing index (an old copy of this document may have been indexed) so 
					// we use updateDocument instead to replace the old one matching the exact 
					// path, if present:
					console.log("updating " + file);
					
					
					writer.updateDocumentWithTermDoc(new Term("path", file.getPath()), doc);
				
				}
			} finally {
				fis.close();
			}
		}
	}
}
/**
 Store Module Integration Test
**/
module.exports = exports = {
	setUp: function(callback) {
		callback();
	},
	tearDown: function(callback) {
		callback();
	}
};
module.exports.testIndexDoc = function(test) {
	var docPath = "workspace/docs";
	var indexPath = "workspace/index";
	var docDir = new File(docPath);
	test.ok(docDir.exists() && docDir.canRead());
	try {
	
	
		var dir = FSDirectory.open(new File(indexPath));
		var analyzer = new StandardAnalyzer(Version.LUCENE_42);
		
		console.log("creating IndexWriterConfig");	

		var iwc = new IndexWriterConfig(Version.LUCENE_42, analyzer);
		
		
		console.log("creating index writer");	
		var writer = new IndexWriter(dir, iwc);
		indexDocs(writer, docDir);
		writer.close();
		
		
		
	} catch (e) {
		console.log(clc.red(util.inspect(e)));
	}
	test.done();
};