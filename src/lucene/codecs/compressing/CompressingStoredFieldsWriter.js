var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var StoredFieldsWriter = require('library/lucene/codecs/StoredFieldsWriter.js');

var PackedInts = require('library/lucene/util/PackedInts.js');
var IndexFileNames = require('library/lucene/index/IndexFileNames.js');

var GrowableByteArrayDataOutput = require('./GrowableByteArrayDataOutput.js');
var CompressingStoredFieldsIndexWriter = require('./CompressingStoredFieldsIndexWriter.js');

var Lucene40StoredFieldsWriter = require('library/lucene/codecs/lucene40/Lucene40StoredFieldsWriter.js');

var CodecUtil = require('library/lucene/codecs/CodecUtil.js');

var IOUtils = require('library/lucene/util/IOUtils.js');

var ArrayUtil = require('library/lucene/util/ArrayUtil.js');
var Arrays = require('library/java/util/Arrays.js');

var CompressingStoredFieldsWriter = defineClass({
	name : "CompressingStoredFieldsWriter",
	extend : StoredFieldsWriter,
	statics : {

		  STRING : 0x00, 
	      BYTE_ARR : 0x01,
	      NUMERIC_INT : 0x02,
	      NUMERIC_FLOAT : 0x03,
	      NUMERIC_LONG : 0x04,
	      NUMERIC_DOUBLE : 0x05,
	
	      TYPE_BITS : PackedInts.bitsRequired(0x05), 
	      TYPE_MASK : PackedInts.maxValue( PackedInts.bitsRequired(0x05) ), 
	
	      CODEC_SFX_IDX : "Index",
	      CODEC_SFX_DAT : "Data",
	      VERSION_START : 0,
	      VERSION_CURRENT : 0 
  
	},
	
	variables : {

		directory : null, //Directory
		segment : null, //string
		segmentSuffix : null, //string
		indexWriter : null, //CompressingStoredFieldsIndexWriter
		fieldsStream : null, //IndexOutput

		compressionMode : null, //CompressionMode
		compressor : null, //Compressor
		chunkSize : null, //int

		bufferedDocs : null, //GrowableByteArrayDataOutput
		numStoredFields : null, //int[] // number of stored fields
		endOffsets : null, //int[] // end offsets in bufferedDocs
		docBase : null,  // doc ID at the beginning of the chunk
		numBufferedDocs : null // docBase + numBufferedDocs == current doc ID
  
	},
	
	construct : function(/* Directory */ directory, /* SegmentInfo */ si, /* String */ segmentSuffix, 
					/* IOContext */ context, /* String */ formatName, /* CompressionMode */ compressionMode, /* int */ chunkSize){

	    assert(directory != null);
	    this.directory = directory;
	    this.segment = si.name;
	    this.segmentSuffix = segmentSuffix;
	    this.compressionMode = compressionMode;
	    this.compressor = compressionMode.newCompressor();
	    this.chunkSize = chunkSize;
	    this.docBase = 0;
	    this.bufferedDocs = new GrowableByteArrayDataOutput(chunkSize);
	    this.numStoredFields = new Array(16); //new int[16];
	    this.endOffsets = new Array(16); //new int[16];
	    this.numBufferedDocs = 0;
	
	    var success = false;
	    var indexStream = directory.createOutput(IndexFileNames.segmentFileName(segment, segmentSuffix, Lucene40StoredFieldsWriter.FIELDS_INDEX_EXTENSION), context);//IndexOutput
	    
	    try {
	    
	      fieldsStream = directory.createOutput(IndexFileNames.segmentFileName(segment, segmentSuffix, Lucene40StoredFieldsWriter.FIELDS_EXTENSION), context);
	
	      var codecNameIdx = formatName + CompressingStoredFieldsWriter.CODEC_SFX_IDX;
	      var codecNameDat = formatName + CompressingStoredFieldsWriter.CODEC_SFX_DAT;
	      CodecUtil.writeHeader(indexStream, codecNameIdx, CompressingStoredFieldsWriter.VERSION_CURRENT);
	      CodecUtil.writeHeader(fieldsStream, codecNameDat, CompressingStoredFieldsWriter.VERSION_CURRENT);
	      assert(CodecUtil.headerLength(codecNameDat) == fieldsStream.getFilePointer());
	      assert(CodecUtil.headerLength(codecNameIdx) == indexStream.getFilePointer());
	
	      indexWriter = new CompressingStoredFieldsIndexWriter(indexStream);
	      indexStream = null;
	
	      fieldsStream.writeVInt(PackedInts.VERSION_CURRENT);
	
	      success = true;
	    } finally {
	      if (!success) {
	        IOUtils.closeWhileHandlingException(indexStream);
	        this.abort();
	      }
	    }

	},
	
	methods : {

  //@Override
   close : function()  {
    try {
      IOUtils.close(this.fieldsStream, this.indexWriter);
    } finally {
      this.fieldsStream = null;
      this.indexWriter = null;
    }
  },

  //@Override
   startDocument : function(/* int */ numStoredFields)  {
    if (this.numBufferedDocs == this.numStoredFields.length) {
      var newLength = ArrayUtil.oversize(this.numBufferedDocs + 1, 4);
      this.numStoredFields = Arrays.copyOf(this.numStoredFields, newLength);
      this.endOffsets = Arrays.copyOf(this.endOffsets, newLength);
    }
    this.numStoredFields[this.numBufferedDocs] = numStoredFields;
    ++this.numBufferedDocs;
  },

  //@Override
  finishDocument : function()  {
    this.endOffsets[this.numBufferedDocs - 1] = this.bufferedDocs.length;
    if (this.triggerFlush()) {
      this.flush();
    }
  }



	
	}
      
});
module.exports = exports = CompressingStoredFieldsWriter;