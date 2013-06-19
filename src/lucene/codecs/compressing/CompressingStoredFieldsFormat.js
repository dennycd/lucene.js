var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var StoredFieldsFormat = require('library/lucene/codecs/StoredFieldsFormat.js');
var CompressingStoredFieldsReader = require('./CompressingStoredFieldsReader.js');
var CompressingStoredFieldsWriter = require('./CompressingStoredFieldsWriter.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
/**
 * A {@link StoredFieldsFormat} that is very similar to
 * {@link Lucene40StoredFieldsFormat} but compresses documents in chunks in
 * order to improve the compression ratio.
 * <p>
 * For a chunk size of <tt>chunkSize</tt> bytes, this {@link StoredFieldsFormat}
 * does not support documents larger than (<tt>2<sup>31</sup> - chunkSize</tt>)
 * bytes. In case this is a problem, you should use another format, such as
 * {@link Lucene40StoredFieldsFormat}.
 * <p>
 * For optimal performance, you should use a {@link MergePolicy} that returns
 * segments that have the biggest byte size first.
 * @lucene.experimental
 */
var CompressingStoredFieldsFormat = defineClass({
	name : "CompressingStoredFieldsFormat",
	extend : StoredFieldsFormat,
	variables : {
		formatName : null, //string
		segmentSuffix : null, //string
		compressionMode : null, //CompressionMode
		chunkSize : null, //int
	},
	construct : function(/* String */ formatName, /* String */ segmentSuffix, /* CompressionMode */ compressionMode, /* int */ chunkSize){
		if(arguments.length == 4){
		    this.formatName = formatName;
		    this.segmentSuffix = segmentSuffix || "";
		    this.compressionMode = compressionMode;
		    if (chunkSize < 1) {
		      throw new IllegalArgumentException("chunkSize must be >= 1");
		    }
		    this.chunkSize = chunkSize;
	    }
   	},
   
	methods : {


	  //@Override
	   /* StoredFieldsReader */ 
	   fieldsReader : function(/* Directory */ directory, /* SegmentInfo */ si, /* FieldInfos */ fn, /* IOContext */ context){
	    return new CompressingStoredFieldsReader(directory, si, this.segmentSuffix, fn, context, this.formatName, this.compressionMode);
	  },
	
	  //@Override
	   /* StoredFieldsWriter */ 
	   fieldsWriter : function(/* Directory */ directory, /* SegmentInfo */ si, /* IOContext */ context)  {
	    return new CompressingStoredFieldsWriter(directory, si, this.segmentSuffix, context, this.formatName, this.compressionMode, this.chunkSize);
	  },
	
	  //@Override
	  toString : function() {
	    return this.getClass().getSimpleName() + "(compressionMode=" + this.compressionMode + ", chunkSize=" + this.chunkSize + ")";
	  },
  

	}	
   	
});
module.exports = exports = CompressingStoredFieldsFormat;