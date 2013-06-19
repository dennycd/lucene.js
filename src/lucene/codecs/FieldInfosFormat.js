var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/**
 * Encodes/decodes {@link FieldInfos}
 * @lucene.experimental
 */
var FieldInfosFormat = defineClass({
	name: "FieldInfosFormat",
	methods: {
		/** Returns a {@link FieldInfosReader} to read field infos
		 *  from the index */
		//@return FieldInfosReader
		getFieldInfosReader: function() {
			throw new ImplNotSupportedException("FieldInfosFormat::getFieldInfosReader");
		},
		/** Returns a {@link FieldInfosWriter} to write field infos
		 *  to the index */
		//@return FieldInfosWriter
		getFieldInfosWriter: function() {
			throw new ImplNotSupportedException("FieldInfosFormat::getFieldInfosWriter");
		},
	}
});
module.exports = exports = FieldInfosFormat;