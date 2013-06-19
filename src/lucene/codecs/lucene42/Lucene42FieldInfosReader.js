var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');




var DocValuesType = require('library/lucene/index/FieldInfo.js').DocValuesType;
var IndexOptions = require('library/lucene/index/FieldInfo.js').IndexOptions;

var IndexFileNames = require('library/lucene/index/IndexFileNames.js');

var CodecUtil = require('../CodecUtil.js');
var FieldInfosReader = require('../FieldInfosReader.js');


var FieldInfo = require('library/lucene/index/FieldInfo.js');
var FieldInfos = require('library/lucene/index/FieldInfos.js');

var CorruptIndexException = require('library/lucene/index/CorruptIndexException.js');

var Collections = require('library/java/util/Collections.js');

var IOUtils = require('library/lucene/util/IOUtils.js');



/**
 * Lucene 4.2 FieldInfos reader.
 * 
 * @lucene.experimental
 * @see Lucene42FieldInfosFormat
 */
var Lucene42FieldInfosReader = defineClass({
	name : "Lucene42FieldInfosReader",
	extend : FieldInfosReader, 
	construct : function(){	
		FieldInfosReader.call(this);
	},
	statics : {
  
			//@return DocValuesType
		    getDocValuesType : function(/* IndexInput */ input, /* byte */ b)  {
			    if (b == 0) {
			      return null;
			    } else if (b == 1) {
			      return DocValuesType.NUMERIC;
			    } else if (b == 2) {
			      return DocValuesType.BINARY;
			    } else if (b == 3) {
			      return DocValuesType.SORTED;
			    } else if (b == 4) {
			      return DocValuesType.SORTED_SET;
			    } else {
			      throw new CorruptIndexException("invalid docvalues byte: " + b + " (resource=" + input + ")");
			    }
		  }  
  
	},
	
	methods : {


		  //@Override
		  //return FieldInfos
		  read : function(/* Directory */ directory, /* String */ segmentName, /* IOContext */ iocontext){
		  	console.log("Lucene42FieldInfosReader::read");
		  			  	
		  	var Lucene42FieldInfosFormat = require('./Lucene42FieldInfosFormat.js');
		  	
		  	
		    var fileName = IndexFileNames.segmentFileName(segmentName, "", Lucene42FieldInfosFormat.EXTENSION);
		    var input = directory.openInput(fileName, iocontext);
		    
		    var success = false;
		    try {
		    
		      CodecUtil.checkHeader(input, Lucene42FieldInfosFormat.CODEC_NAME, 
		                                   Lucene42FieldInfosFormat.FORMAT_START, 
		                                   Lucene42FieldInfosFormat.FORMAT_CURRENT);
		
		      var size = input.readVInt(); //read in the size
		      
		      //the array of field info
		      var infos = new Array(size); //new FieldInfo[size]; //FieldInfo infos[]
		
		      for (var i = 0; i < size; i++) {
		        var name = input.readString();   console.log("reading field name = " + name);
		        var fieldNumber = input.readVInt();
		        var bits = input.readByte();
		        var isIndexed = (bits & Lucene42FieldInfosFormat.IS_INDEXED) != 0; //boolean
		        var storeTermVector = (bits & Lucene42FieldInfosFormat.STORE_TERMVECTOR) != 0; //boolean
		        var omitNorms = (bits & Lucene42FieldInfosFormat.OMIT_NORMS) != 0; //boolean
		        var storePayloads = (bits & Lucene42FieldInfosFormat.STORE_PAYLOADS) != 0; //boolean
		        
		        var indexOptions;  //IndexOptions
		        
		        if (!isIndexed) {
		          indexOptions = null;
		        } else if ((bits & Lucene42FieldInfosFormat.OMIT_TERM_FREQ_AND_POSITIONS) != 0) {
		          indexOptions = IndexOptions.DOCS_ONLY;
		        } else if ((bits & Lucene42FieldInfosFormat.OMIT_POSITIONS) != 0) {
		          indexOptions = IndexOptions.DOCS_AND_FREQS;
		        } else if ((bits & Lucene42FieldInfosFormat.STORE_OFFSETS_IN_POSTINGS) != 0) {
		          indexOptions = IndexOptions.DOCS_AND_FREQS_AND_POSITIONS_AND_OFFSETS;
		        } else {
		          indexOptions = IndexOptions.DOCS_AND_FREQS_AND_POSITIONS;
		        }
		
		        // DV Types are packed in one byte
		        var val = input.readByte();
		        var docValuesType = Lucene42FieldInfosReader.getDocValuesType(input, /* (byte) */ (val & 0x0F)); //DocValuesType
		        var normsType = Lucene42FieldInfosReader.getDocValuesType(input, /* (byte) */ ((val >>> 4) & 0x0F)); //DocValuesType
		        var attributes = input.readStringStringMap(); //final Map<String,String> 
		        		        
		        infos[i] = new FieldInfo(name, isIndexed, fieldNumber, storeTermVector, omitNorms, storePayloads, indexOptions, docValuesType, normsType, Collections.unmodifiableMap(attributes));
		      }
		
		      if (input.getFilePointer() != input.length()) {
		        throw new CorruptIndexException("did not read all bytes from file \"" + fileName + "\": read " + input.getFilePointer() + " vs size " + input.length() + " (resource: " + input + ")");
		      }
		      
		      var fieldInfos = new FieldInfos(infos); //FieldInfos
		      success = true;
		      return fieldInfos;
		    } 
		    catch(e){
		    	console.log(e.toString());
		    }
		    finally {
		      if (success) {
		        input.close();
		      } else {
		        IOUtils.closeWhileHandlingException(input);
		      }
		    }
		  }


		

	}
})

module.exports = exports = Lucene42FieldInfosReader;