var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IOException = require('library/lucene/util/IOException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');

var Closeable = require('library/lucene/util/Closeable.js');
var Cloneable = require('library/lucene/util/Cloneable.js');
var DataInput = require('library/lucene/store/DataInput.js');


/** Abstract base class for input from a file in a {@link Directory}.  A
 * random-access input stream.  Used for all Lucene index input operations.
 *
 * <p>{@code IndexInput} may only be used from one thread, because it is not
 * thread safe (it keeps internal state like file position). To allow
 * multithreaded use, every {@code IndexInput} instance must be cloned before
 * used in another thread. Subclasses must therefore implement {@link #clone()},
 * returning a new {@code IndexInput} which operates on the same underlying
 * resource, but positioned independently. Lucene never closes cloned
 * {@code IndexInput}s, it will only do this on the original one.
 * The original instance must take care that cloned instances throw
 * {@link AlreadyClosedException} when the original one is closed.
 
 * @see Directory
 */ 
var IndexInput = defineClass({
	name : "IndexInput",
	extend : DataInput,
	implement : [Closeable,Cloneable], 
	variables : {
		resourceDescription : null ,//string
	},
		
	//pattern is to always allow zero parameters for cloning purpose
	construct : function(resourceDescription){
		console.log("IndexInput::construct");
		DataInput.call(this);
		
		if(arguments.length==1){
			if(typeof(resourceDescription)!="string") throw new IllegalArgumentException("invalid resourceDescription given");
			this.resourceDescription = resourceDescription;
		}
		//ignore to allow empty construction during a clone process		
		console.log("IndexInput::construct done");

	},

	methods : {
	
		/** Returns the current position in this file, where the next read will
		* occur.
		* @see #seek(long)
		*/
		getFilePointer : function(){throw new ImplNotSupportedException("getFilePointer not implemented");},
		
		/** Sets current position in this file, where the next read will occur.
		* @see #getFilePointer()
		*/
		seek : function(pos){throw new ImplNotSupportedException();},
  	
		/** The number of bytes in the file. */
		length : function(){throw new ImplNotSupportedException();},
		
		/** Closes the stream to further operations. */
		close : function(){throw new ImplNotSupportedException();},

		toString : function(){
			return this.resourceDescription;
		},

		/** {@inheritDoc}
		* <p><b>Warning:</b> Lucene never closes cloned
		* {@code IndexInput}s, it will only do this on the original one.
		* The original instance must take care that cloned instances throw
		* {@link AlreadyClosedException} when the original one is closed.
		*/
		clone : function(){
			var clone = DataInput.prototype.clone.call(this);
			clone.resourceDescription = this.resourceDescription;
			return clone;
		}
		
	}
});

module.exports = exports = IndexInput;