var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Codec = require('library/lucene/codecs/Codec.js');
var DocValuesFormat = require('../DocValuesFormat.js');
var PostingsFormat = require('../PostingsFormat.js');
var PerFieldDocValuesFormat = require('../perfield/PerFieldDocValuesFormat.js');
var PerFieldPostingsFormat = require('../perfield/PerFieldPostingsFormat.js');

var Lucene40LiveDocsFormat = require('../lucene40/Lucene40LiveDocsFormat.js');
var Lucene40SegmentInfoFormat = require('../lucene40/Lucene40SegmentInfoFormat.js');
var Lucene41StoredFieldsFormat = require('../lucene41/Lucene41StoredFieldsFormat.js');
var Lucene42FieldInfosFormat = require('./Lucene42FieldInfosFormat.js');
var Lucene42NormsFormat = require('./Lucene42NormsFormat.js');
var Lucene42TermVectorsFormat = require('./Lucene42TermVectorsFormat.js');


var _privatePostingsFormat = defineClass({
	extend: PerFieldPostingsFormat,
	methods: {
		//@return PostingsFormat
		getPostingsFormatForField: function( /* String */ field) {
			return PostingsFormat.forName("Lucene41");
			//return Lucene42Codec.this.getPostingsFormatForField(field);
		}
	}
});


var _privateDocValuesFormat = defineClass({
	extend: PerFieldDocValuesFormat,
	methods: {
		//DocValuesFormat 
		getDocValuesFormatForField: function( /* String */ field) {
			return DocValuesFormat.forName("Lucene42");
			//return Lucene42Codec.this.getDocValuesFormatForField(field);
		}
	}
});


/**
 * Implements the Lucene 4.2 index format, with configurable per-field postings
 * and docvalues formats.
 * <p>
 * If you want to reuse functionality of this codec in another codec, extend
 * {@link FilterCodec}.
 *
 * @see org.apache.lucene.codecs.lucene42 package documentation for file format details.
 * @lucene.experimental
 */
// NOTE: if we make largish changes in a minor release, easier to just make Lucene43Codec or whatever
// if they are backwards compatible or smallish we can probably do the backwards in the postingsreader
// (it writes a minor version, etc).
var Lucene42Codec = defineClass({
	name: "Lucene42Codec",
	extend: Codec,
	variables: { /* StoredFieldsFormat */
		_fieldsFormat: new Lucene41StoredFieldsFormat(),
		/* TermVectorsFormat */
		_vectorsFormat: new Lucene42TermVectorsFormat(),
		/* FieldInfosFormat */
		_fieldInfosFormat: new Lucene42FieldInfosFormat(),
		/* SegmentInfoFormat */
		_infosFormat: new Lucene40SegmentInfoFormat(),
		/* LiveDocsFormat */
		_liveDocsFormat: new Lucene40LiveDocsFormat(),
		/* PostingsFormat */
		_postingsFormat: new _privatePostingsFormat(), 
		/* DocValuesFormat */
		_docValuesForma: new _privateDocValuesFormat(),
		/* PostingsFormat */
		_defaultFormat: PostingsFormat.forName("Lucene41"),
		/* DocValuesFormat */
		_defaultDVFormat: DocValuesFormat.forName("Lucene42"),
		/* NormsFormat */
		_normsFormat: new Lucene42NormsFormat()
	},
	construct: function() {
		console.log("Lucene42Codec::construct");
		Codec.call(this, "Lucene42");
	},
	methods: {
		//@Override
		/* StoredFieldsFormat */
		storedFieldsFormat: function() {
			return this._fieldsFormat;
		},
		//@Override
		/* TermVectorsFormat */
		termVectorsFormat: function() {
			return this._vectorsFormat;
		},
		//@Override
		/* PostingsFormat */
		postingsFormat: function() {
			return this._postingsFormat;
		},
		//@Override
		/* FieldInfosFormat */
		fieldInfosFormat: function() {
			return this._fieldInfosFormat;
		},
		//@Override
		/* SegmentInfoFormat */
		segmentInfoFormat: function() {
			return this._infosFormat;
		},
		//@Override
		/* LiveDocsFormat */
		liveDocsFormat: function() {
			return this._liveDocsFormat;
		},
		/** Returns the postings format that should be used for writing 
		 *  new segments of <code>field</code>.
		 *
		 *  The default implementation always returns "Lucene41"
		 */
		/* PostingsFormat */
		getPostingsFormatForField: function( /* String */ field) {
			return this._defaultFormat;
		},
		/** Returns the docvalues format that should be used for writing 
		 *  new segments of <code>field</code>.
		 *
		 *  The default implementation always returns "Lucene42"
		 */
		/* DocValuesFormat */
		getDocValuesFormatForField: function( /* String */ field) {
			return this._defaultDVFormat;
		},
		//@Override
		/* DocValuesFormat */
		docValuesFormat: function() {
			return this._docValuesFormat;
		},
		//@Override
		//NormsFormat 
		normsFormat: function() {
			return this._normsFormat;
		},
	}
});
module.exports = exports = Lucene42Codec;