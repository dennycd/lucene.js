var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/**
 * Codec API for reading {@link FieldInfos}.
 * @lucene.experimental
 */
var FieldInfosReader = defineClass({
	name: "FieldInfosReader",
	methods: {
		/** Read the {@link FieldInfos} previously written with {@link
		 *  FieldInfosWriter}. */
		//@return FieldInfos
		read: function( /* Directory */ directory, /* String */ segmentName, /* IOContext */ iocontext) {
			throw new ImplNotSupportedException("ImplNotSupportedException");
		},
	}
});
module.exports = exports = FieldInfosReader;