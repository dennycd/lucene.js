var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var LiveDocsFormat = require('../LiveDocsFormat.js');
var IndexFileNames = require('library/lucene/index/IndexFileNames.js');
var BitVector = require('./BitVector.js');
/**
 * Lucene 4.0 Live Documents Format.
 */
var Lucene40LiveDocsFormat = defineClass({
	name : "Lucene40LiveDocsFormat",
	extend : LiveDocsFormat, 
	statics : {
		  /** Extension of deletes */
		  	 DELETES_EXTENSION : "del",  		
	},
	construct : function(){
		
	},
	methods : {

		  //@Override
		  //@return MutableBits
		   newLiveDocs : function(/* int */ size)  {
		    var bitVector = new BitVector(size);
		    bitVector.invertAll();
		    return bitVector;
		  },
		
		  //@Override
		  //@return MutableBits
		  newLiveDocs : function(/* Bits */ existing)  {
		    var liveDocs = new BitVector(existing);  //(BitVector) existing;
		    return liveDocs;
		    //return liveDocs.clone();
		  }, 
		
		  //@Override
		  //@return Bits
		   readLiveDocs : function(/* Directory */ dir, /* SegmentInfoPerCommit */ info, /* IOContext */ context)  {
		   
		    var filename = IndexFileNames.fileNameFromGeneration(info.info.name, Lucene40LiveDocsFormat.DELETES_EXTENSION, info.getDelGen());
		    var liveDocs = new BitVector(dir, filename, context);
		    assert( liveDocs.count() == info.info.getDocCount() - info.getDelCount(),
		      "liveDocs.count()=" + liveDocs.count() + " info.docCount=" + info.info.getDocCount() + " info.getDelCount()=" + info.getDelCount());
		    assert(liveDocs.length() == info.info.getDocCount());
		    return liveDocs;
		  }, 
		
		  //@Override
		  writeLiveDocs : function(/* MutableBits */ bits, /* Directory */ dir, /* SegmentInfoPerCommit */ info, /* int */ newDelCount, /* IOContext */ context){
		    var filename = IndexFileNames.fileNameFromGeneration(info.info.name, Lucene40LiveDocsFormat.DELETES_EXTENSION, info.getNextDelGen());
		    var liveDocs = new BitVector(bits); //(BitVector) bits;
		    assert(liveDocs.count() == info.info.getDocCount() - info.getDelCount() - newDelCount);
		    assert(liveDocs.length() == info.info.getDocCount())
		    liveDocs.write(dir, filename, context);
		  },
		
		  //@Override
		  files : function(/* SegmentInfoPerCommit */ info, /* Collection<String> */ files){
		    if (info.hasDeletions()) {
		      files.add(IndexFileNames.fileNameFromGeneration(info.info.name, Lucene40LiveDocsFormat.DELETES_EXTENSION, info.getDelGen()));
		    }
		  }
  		
	}
});
module.exports = exports = Lucene40LiveDocsFormat;

