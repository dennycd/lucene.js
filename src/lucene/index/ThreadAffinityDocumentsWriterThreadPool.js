var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var DocumentsWriterPerThread = require('library/lucene/index/DocumentsWriterPerThread.js');

var ThreadAffinityDocumentsWriterThreadPool = defineClass({
	name : "ThreadAffinityDocumentsWriterThreadPool",
	extend : DocumentsWriterPerThread,
	construct : function(){
		
	},
	methods : {
		
	}
});
module.exports = exports = ThreadAffinityDocumentsWriterThreadPool;