var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');

var Closeable = require('library/lucene/util/Closeable.js');
var DataOutput = require('library/lucene/store/DataOutput.js');


/** Abstract base class for output to a file in a Directory.  A random-access
 * output stream.  Used for all Lucene index output operations.
 
 * <p>{@code IndexOutput} may only be used from one thread, because it is not
 * thread safe (it keeps internal state like file position).
 
 * @see Directory
 * @see IndexInput
 */
var IndexOutput = defineClass({
	name : "IndexOutput",
	extend : DataOutput,
	implement : [Closeable],
	construct : function(){
		DataOutput.call(this);
	},
	methods : {


		/** Forces any buffered output to be written. */
		flush : function(){throw new ImplNotSupportedException();},
		
		/** Closes this stream to further operations. */
		//@Override
		close : function(){throw new ImplNotSupportedException();},
		
		/** Returns the current position in this file, where the next write will
		* occur.
		* @see #seek(long)
		*/
		getFilePointer : function(){throw new ImplNotSupportedException();},
		
		/** Sets current position in this file, where the next write will occur.
		* @see #getFilePointer()
		* @deprecated (4.1) This method will be removed in Lucene 5.0
		*/
		//@Deprecated
		seek : function(pos){throw new ImplNotSupportedException();},
		
		/** The number of bytes in the file. */
		length : function(){throw new ImplNotSupportedException();},
		
		/** Set the file length. By default, this method does
		* nothing (it's optional for a Directory to implement
		* it).  But, certain Directory implementations (for
		* example @see FSDirectory) can use this to inform the
		* underlying IO system to pre-allocate the file to the
		* specified size.  If the length is longer than the
		* current file length, the bytes added to the file are
		* undefined.  Otherwise the file is truncated.
		* @param length file length
		*/
		setLength : function(length){throw new ImplNotSupportedException();}
  
  	
	}
});


module.exports = exports = IndexOutput;