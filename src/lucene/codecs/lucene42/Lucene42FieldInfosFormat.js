var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var FieldInfosFormat = require('../FieldInfosFormat.js');
var Lucene42FieldInfosReader = require('./Lucene42FieldInfosReader.js');
var Lucene42FieldInfosWriter = require('./Lucene42FieldInfosWriter.js');
/**
 * Lucene 4.2 Field Infos format.
 * REFERENCE http://lucene.apache.org/core/4_2_0/core/org/apache/lucene/codecs/lucene42/Lucene42FieldInfosFormat.html
 */
var Lucene42FieldInfosFormat = defineClass({
	name: "Lucene42FieldInfosFormat",
	extend: FieldInfosFormat,
	statics: { /** Extension of field infos */
		EXTENSION: "fnm",
		// Codec header
		CODEC_NAME: "Lucene42FieldInfos",
		FORMAT_START: 0,
		FORMAT_CURRENT: 0,
		//FORMAT_START;
		// Field flags
		IS_INDEXED: 0x1,
		//byte
		STORE_TERMVECTOR: 0x2,
		STORE_OFFSETS_IN_POSTINGS: 0x4,
		OMIT_NORMS: 0x10,
		STORE_PAYLOADS: 0x20,
		OMIT_TERM_FREQ_AND_POSITIONS: 0x40,
		OMIT_POSITIONS: -128,
	},
	variables: {
		reader: new Lucene42FieldInfosReader(),
		//FieldInfosReader
		writer: new Lucene42FieldInfosWriter() //FieldInfosWriter
	},
	construct: function() {},
	methods: {
		//@Override
		//@return FieldInfosReader
		getFieldInfosReader: function() {
			return this.reader;
		},
		//@Override
		//@return FieldInfosWriter
		getFieldInfosWriter: function() {
			return this.writer;
		}
	}
});
module.exports = exports = Lucene42FieldInfosFormat;