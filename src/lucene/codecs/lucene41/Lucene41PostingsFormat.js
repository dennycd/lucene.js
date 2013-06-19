var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var PostingsFormat = require('../PostingsFormat.js');
var IOUtils = require('library/lucene/util/IOUtils.js');
var BlockTreeTermsWriter = require('../BlockTreeTermsWriter.js');
var BlockTreeTermsReader = require('../BlockTreeTermsReader.js');
var Lucene41PostingsWriter = require('./Lucene41PostingsWriter.js');
var Lucene41PostingsReader = require('./Lucene41PostingsReader');
/**
 * Lucene 4.1 postings format, which encodes postings in packed integer blocks
 * for fast decode.
 *
 * REFERENCE http://lucene.apache.org/core/4_2_0/core/org/apache/lucene/codecs/lucene41/Lucene41PostingsFormat.html
 **/
var Lucene41PostingsFormat = defineClass({
	name: "Lucene41PostingsFormat",
	extend: PostingsFormat,
	statics: {
		/**
		 * Filename extension for document number, frequencies, and skip data.
		 * See chapter: <a href="#Frequencies">Frequencies and Skip Data</a>
		 */
		DOC_EXTENSION: "doc",
		/**
		 * Filename extension for positions.
		 * See chapter: <a href="#Positions">Positions</a>
		 */
		POS_EXTENSION: "pos",
		/**
		 * Filename extension for payloads and offsets.
		 * See chapter: <a href="#Payloads">Payloads and Offsets</a>
		 */
		PAY_EXTENSION: "pay",
		/**
		 * Fixed packed block size, number of integers encoded in
		 * a single packed block.
		 */
		// NOTE: must be multiple of 64 because of PackedInts long-aligned encoding/decoding
		BLOCK_SIZE: 128
	},
	variables: {
		minTermBlockSize: null,
		//int
		maxTermBlockSize: null //int
	},
	construct: function() {
		console.log("Lucene41PostingsFormat::construct");
		/** Creates {@code Lucene41PostingsFormat} with default
		 *  settings. */
		var c1 = function() {
				c2.call(this, BlockTreeTermsWriter.DEFAULT_MIN_BLOCK_SIZE, BlockTreeTermsWriter.DEFAULT_MAX_BLOCK_SIZE);
			};
		/** Creates {@code Lucene41PostingsFormat} with custom
		 *  values for {@code minBlockSize} and {@code
		 *  maxBlockSize} passed to block terms dictionary.
		 *  @see BlockTreeTermsWriter#BlockTreeTermsWriter(SegmentWriteState,PostingsWriterBase,int,int) */
		var c2 = function( /* int */ minTermBlockSize, /* int */ maxTermBlockSize) {
				PostingsFormat.call(this, "Lucene41");
				this.minTermBlockSize = minTermBlockSize;
				assert(minTermBlockSize > 1, "Lucene41PostingsFormat::construct");
				this.maxTermBlockSize = maxTermBlockSize;
				assert(minTermBlockSize <= maxTermBlockSize, "Lucene41PostingsFormat::construct");
			};
		if (arguments.length == 0) c1.call(this);
		else c2.apply(this, arguments)
		console.log("Lucene41PostingsFormat::construct done");

	},
	methods: {
		//@Override
		toString: function() {
			return this.getName() + "(blocksize=" + Lucene41PostingsFormat.BLOCK_SIZE + ")";
		},
		//@Override
		//FieldsConsumer
		fieldsConsumer: function( /* SegmentWriteState */ state) {
			var postingsWriter = new Lucene41PostingsWriter(state); //PostingsWriterBase
			var success = false;
			try {
				var ret = new BlockTreeTermsWriter(state, postingsWriter, this.minTermBlockSize, this.maxTermBlockSize); //FieldsConsumer
				success = true;
				return ret;
			} catch (e) {
				console.log(e.toString());
			} finally {
				if (!success) {
					IOUtils.closeWhileHandlingException(postingsWriter);
				}
			}
		},
		//@Override
		//@return FieldsProducer
		fieldsProducer: function( /* SegmentReadState */ state) {
			console.log("Lucene41PostingsFormat::fieldsProducer");
			debugger;
			
			var postingsReader = new Lucene41PostingsReader(state.directory, state.fieldInfos, state.segmentInfo, state.context, state.segmentSuffix); //PostingsReaderBase
			var success = false;
			try {
				var ret = new BlockTreeTermsReader(state.directory, state.fieldInfos, state.segmentInfo, postingsReader, state.context, state.segmentSuffix, state.termsIndexDivisor); //FieldsProducer
				success = true;
				return ret;
			} catch (e) {
				console.log(e.toString());
			} finally {
				if (!success) {
					IOUtils.closeWhileHandlingException(postingsReader);
				}
			}
		}
	}
});
module.exports = exports = Lucene41PostingsFormat;