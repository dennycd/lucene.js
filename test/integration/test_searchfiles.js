"use strict";
process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');

var DirectoryReader = require('library/lucene/index/DirectoryReader.js');
var FSDirectory = require('library/lucene/store/FSDirectory.js');
var File = require('library/lucene/util/File.js');

var IndexSearcher = require('library/lucene/search/IndexSearcher.js');

var StandardAnalyzer = require('library/lucene/analysis/StandardAnalyzer.js');


var BufferedReader = require('library/lucene/util/BufferedReader.js');
var InputStreamReader = require('library/lucene/util/InputStreamReader.js');
var FileInputStream = require('library/lucene/util/FileInputStream.js');

var QueryParser = require('library/lucene/queryparser/classic/QueryParser.js');

var Version = require('library/lucene/util/Version.js');


module.exports = exports = {
	setUp: function(callback) {
		callback();
	},
	tearDown: function(callback) {
		callback();
	}
}; /** Simple command-line based search demo. */
module.exports.testSearchFiles = function(test) {

	
	var index = "workspace/index";
	var field = "contents";
	var queries = null;
	var repeat = 0;
	var raw = false;
	var queryString = null;
	var hitsPerPage = 10;

try{
	
	console.log("opening directory");
	var directory = FSDirectory.openWithPath(new File(index));  

	//var files = directory.listAll();
	
	
	var reader = DirectoryReader.open(directory); //IndexReader
	var searcher = new IndexSearcher(reader); //IndexSearcher
	var analyzer = new StandardAnalyzer(Version.LUCENE_42); //Analyzer
	
	
	var _in = null; //BufferedReader
	if (queries != null) { _in = new BufferedReader(new InputStreamReader(new FileInputStream(queries), "UTF-8"));
	} else { _in = new BufferedReader(new InputStreamReader(process.stdin, "UTF-8"));
	}
	
	var parser = new QueryParser(Version.LUCENE_42, field, analyzer); //QueryParser
	
	
	while (true) {
		if (queries == null && queryString == null) { // prompt the user
			console.log("Enter query: ");
		}
		var line = queryString != null ? queryString : _in .readLine();
		if (line == null || line.length() == -1) {
			break;
		}
		line = line.trim();
		if (line.length() == 0) {
			break;
		}
		var query = parser.parse(line); // Parser parses in query and produce a Query obj
		
		console.log("Searching for: " + query.toString(field));
		if (repeat > 0) { // repeat & time as benchmark
			var start = new Date();
			for (var i = 0; i < repeat; i++) {
			
				searcher.search(query, null, 100); // Search takes in a Query obj and search against the index using a index reader
			
			}
			var end = new Date();
			console.log("Time: " + (end.getTime() - start.getTime()) + "ms");
		}
		doPagingSearch( _in , searcher, query, hitsPerPage, raw, queries == null && queryString == null);
		if (queryString != null) {
			break;
		}
	}
	reader.close();
}catch(e){
	console.log(clc.red(e.toString()));
	test.ok(false);
}
	test.done();
}
/**
 * This demonstrates a typical paging search scenario, where the search engine presents
 * pages of size n to the user. The user can then go to the next page if interested in
 * the next hits.
 *
 * When the query is executed for the first time, then only enough results are collected
 * to fill 5 result pages. If the user wants to page beyond this limit, then the query
 * is executed another time and all hits are collected.
 *
 */
function doPagingSearch( /* BufferedReader */ _in, /* IndexSearcher */ searcher, /* Query */ query, /* int */ hitsPerPage, /* boolean */ raw, /* boolean */ interactive) {
	// Collect enough docs to show 5 pages
	var results = searcher.search(query, 5 * hitsPerPage); //TopDocs
	var hits = results.scoreDocs; //ScoreDoc[]
	var numTotalHits = results.totalHits;
	console.log(numTotalHits + " total matching documents");
	var start = 0;
	var end = Math.min(numTotalHits, hitsPerPage);
	while (true) {
		if (end > hits.length) {
			console.log("Only results 1 - " + hits.length + " of " + numTotalHits + " total matching documents collected.");
			console.log("Collect more (y/n) ?");
			var line = _in.readLine();
			if (line.length() == 0 || line.charAt(0) == 'n') {
				break;
			}
			hits = searcher.search(query, numTotalHits).scoreDocs;
		}
		end = Math.min(hits.length, start + hitsPerPage);
		for (var i = start; i < end; i++) {
			if (raw) { // output raw format
				console.log("doc=" + hits[i].doc + " score=" + hits[i].score);
				continue;
			}
			var doc = searcher.doc(hits[i].doc); //Document
			var path = doc.get("path");
			if (path != null) {
				console.log((i + 1) + ". " + path);
				var title = doc.get("title");
				if (title != null) {
					console.log("   Title: " + doc.get("title"));
				}
			} else {
				console.log((i + 1) + ". " + "No path for this document");
			}
		}
		if (!interactive || end == 0) {
			break;
		}
		if (numTotalHits >= end) {
			var quit = false;
			while (true) {
				console.log("Press ");
				if (start - hitsPerPage >= 0) {
					console.log("(p)revious page, ");
				}
				if (start + hitsPerPage < numTotalHits) {
					console.log("(n)ext page, ");
				}
				console.log("(q)uit or enter number to jump to a page.");
				var line = _in.readLine();
				if (line.length() == 0 || line.charAt(0) == 'q') {
					quit = true;
					break;
				}
				if (line.charAt(0) == 'p') {
					start = Math.max(0, start - hitsPerPage);
					break;
				} else if (line.charAt(0) == 'n') {
					if (start + hitsPerPage < numTotalHits) {
						start += hitsPerPage;
					}
					break;
				} else {
					var page = Integer.parseInt(line); //int
					if ((page - 1) * hitsPerPage < numTotalHits) {
						start = (page - 1) * hitsPerPage;
						break;
					} else {
						console.log("No such page");
					}
				}
			}
			if (quit) break;
			end = Math.min(numTotalHits, start + hitsPerPage);
		}
	}//while
}//func