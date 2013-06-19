var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var SegmentInfoReader = require('../SegmentInfoReader.js');
var IndexFileNames = require('library/lucene/index/IndexFileNames.js');
var CodecUtil = require('library/lucene/codecs/CodecUtil.js');
var CorruptIndexException = require('library/lucene/index/CorruptIndexException.js');
var SegmentInfo = require('library/lucene/index/SegmentInfo.js');
var IOUtils = require('library/lucene/util/IOUtils.js');
var Collections = require('library/java/util/Collections.js');
/**
 * Lucene 4.0 implementation of {@link SegmentInfoReader}.
 * 
 * @see Lucene40SegmentInfoFormat
 * @lucene.experimental
 */
var Lucene40SegmentInfoReader = defineClass({
	name : "Lucene40SegmentInfoReader",
	extend : SegmentInfoReader,
	methods : {

  //@Override
   /*return  SegmentInfo */ 
  read : function(/* Directory */ dir, /* String */ segment, /* IOContext */ context)  {
  		console.log("Lucene40SegmentInfoReader::read");
  		
  		var Lucene40SegmentInfoFormat = require('./Lucene40SegmentInfoFormat.js');

  
	    var fileName = IndexFileNames.segmentFileName(segment, "", Lucene40SegmentInfoFormat.SI_EXTENSION); //console.log("fileName="+fileName);
	    
	    var input = dir.openInput(fileName, context); //IndexInput
	    var success = false;
	    try {

		    

	      CodecUtil.checkHeader(input, Lucene40SegmentInfoFormat.CODEC_NAME,
	                                   Lucene40SegmentInfoFormat.VERSION_START,
	                                   Lucene40SegmentInfoFormat.VERSION_CURRENT);
	                                   
	      var version = input.readString(); //console.log("version="+version); //SegVersion is the code version that created the segment.
	      var docCount = input.readInt(); //console.log("docCount=" + docCount); //SegSize is the number of documents contained in the segment index.
	      if (docCount < 0) {
	        throw new CorruptIndexException("invalid docCount: " + docCount + " (resource=" + input + ")");
	      }
	      
	      //IsCompoundFile records whether the segment is written as a compound file or not. 
	      //If this is -1, the segment is not a compound file. If it is 1, the segment is a compound file.
	      var isCompoundFile = input.readByte() == SegmentInfo.YES; //console.log("isCompoundFile="+isCompoundFile);
	      
	      var diagnostics = input.readStringStringMap(); //Map<String,String>  
	      //console.log("diagnostics="+util.inspect(diagnostics));
	      
	      var attributes = input.readStringStringMap(); //Map<String,String>
	      //console.log("attributes="+util.inspect(attributes));

	      var files = input.readStringSet(); //final Set<String>
	      //console.log("files="+util.inspect(files));


	      
	      if (input.getFilePointer() != input.length()) {
	        throw new CorruptIndexException("did not read all bytes from file \"" 
	        			+ fileName + "\": read " + input.getFilePointer() 
	        			+ " vs size " + input.length() + " (resource: " + input + ")");
	      }
	
	      var si = new SegmentInfo(dir, version, segment, docCount, isCompoundFile, null, diagnostics, attributes);
	      si.setFiles(files);
	
	      success = true;
	
	      return si;
	
	    }
	    catch(e){
	    	console.log(e.toString());
	    }
	    finally {
	      if (!success) {
	        IOUtils.closeWhileHandlingException(input);
	      } else {
	        input.close();
	      }
	    }
	 
	    
  }//read
  
  
	}
});
module.exports = exports = Lucene40SegmentInfoReader;