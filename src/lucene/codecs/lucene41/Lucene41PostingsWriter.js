var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Closeable = require('library/lucene/util/Closeable.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var PostingsWriterBase = require('../PostingsWriterBase.js');
var Lucene41PostingsWriter = defineClass({
	name: "Lucene41PostingsWriter",
	extend: PostingsWriterBase,
	statics: {
		/** 
		 * Expert: The maximum number of skip levels. Smaller values result in
		 * slightly smaller indexes, but slower skipping in big posting lists.
		 */
		maxSkipLevels: 10,
		TERMS_CODEC: "Lucene41PostingsWriterTerms",
		DOC_CODEC: "Lucene41PostingsWriterDoc",
		POS_CODEC: "Lucene41PostingsWriterPos",
		PAY_CODEC: "Lucene41PostingsWriterPay"
		// Increment version to change it
		VERSION_START: 0;
		VERSION_CURRENT: 0
	},
	construct: function() {},
	methods: {}
});
module.exports = exports = Lucene41PostingsWriter;