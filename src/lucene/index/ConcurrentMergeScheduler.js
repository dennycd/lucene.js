var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var MergeScheduler = require('library/lucene/index/MergeScheduler.js');

var ConcurrentMergeScheduler = defineClass({
	name : "ConcurrentMergeScheduler",
	extend : MergeScheduler,
	methods : {
		
	}
});

module.exports = exports = ConcurrentMergeScheduler;