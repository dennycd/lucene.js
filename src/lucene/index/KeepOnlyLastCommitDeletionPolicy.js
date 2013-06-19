var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var IndexDeletionPolicy = require('library/lucene/index/IndexDeletionPolicy.js');

var KeepOnlyLastCommitDeletionPolicy = defineClass({
	name : "KeepOnlyLastCommitDeletionPolicy",
	implement : IndexDeletionPolicy,
	methods : {
		
	}
});

module.exports = exports = KeepOnlyLastCommitDeletionPolicy;