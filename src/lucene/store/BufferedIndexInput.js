var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IOException = require('library/lucene/util/IOException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var EOFException = require('library/lucene/util/EOFException.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');

var Closeable = require('library/lucene/util/Closeable.js');
var Cloneable = require('library/lucene/util/Cloneable.js');
var IndexInput = require('library/lucene/store/IndexInput.js');

var IOContext = require('library/lucene/store/IOContext.js');
var Context = require('library/lucene/store/IOContext.js').Context;

/** 
	Base implementation class for buffered {@link IndexInput}. 
*/
var BufferedIndexInput = defineClass({
	name : "BufferedIndexInput",
	extend : IndexInput,	
	
	statics : {
		
		/** Default buffer size set to 1024*/
		BUFFER_SIZE : 1024,
		  
		// The normal read buffer size defaults to 1024, but
		// increasing this during merging seems to yield
		// performance gains.  However we don't want to increase
		// it too much because there are quite a few
		// BufferedIndexInputs created during merging.  See
		// LUCENE-888 for details.
		/**
		* A buffer size for merges set to 4096
		*/
		MERGE_BUFFER_SIZE : 4096,
		
		
		/**
		* Returns default buffer sizes for the given {@link IOContext}
		*/
		bufferSize : function(context){
			switch (context.context) {
				case Context.MERGE:
				  return BufferedIndexInput.MERGE_BUFFER_SIZE;
				default:
				  return BufferedIndexInput.BUFFER_SIZE;
			}
		}
   
	},

	variables : {
		bufferSize : null, //int
		buffer : null, //Buffer
		bufferStart : 0,       // position in file of buffer
		bufferLength : 0,       // end of valid bytes
		bufferPosition : 0,     // next byte to readOnly
	},
	
	//public BufferedIndexInput(String resourceDesc)
	//public BufferedIndexInput(String resourceDesc, IOContext context)
	//public BufferedIndexInput(String resourceDesc, int bufferSize)
	construct : function(){
/* 		console.log("BufferedIndexInput::construct"); */

		if(arguments.length==1){
			IndexInput.call(this, arguments[0]);
			this.bufferSize = BufferedIndexInput.BUFFER_SIZE;
		}
		else if(arguments.length==2){
			
			IndexInput.call(this,arguments[0]);
			
			if(typeof(arguments[1])=="object"){
				console.log("passing context");
				var context = arguments[1];
				assert(Class.isInstanceOfClass(context, "IOContext"));
				
				
				var defaultSz = BufferedIndexInput.bufferSize(context); console.log("default size is " + defaultSz);
				this.__checkBufferSize(defaultSz);
				this.bufferSize = defaultSz;
			
				
			}
			else if(typeof(arguments[1])=="number" && !isNaN(arguments[1])){
				console.log("passing chunkSize");
				this.__checkBufferSize(arguments[1]);
				this.bufferSize = arguments[1];				
			}
			else throw new IllegalArgumentException();
			

		}
		else 
			this.bufferSize = 0;
		
		this.buffer = new Buffer(this.bufferSize);
		this.bufferStart = 0;       // position in file of buffer
		this.bufferLength = 0;       // end of valid bytes
		this.bufferPosition = 0;     // next byte to read	

/* 		console.log("BufferedIndexInput::construct done");	 */
	},

	methods : {
	
		print_status : function(){
			console.log("bufferStart="+this.bufferStart + ",  bufferPosition="+this.bufferPosition + ",  bufferLength="+ this.bufferLength);
		},
	
		getBufferSize : function(){
			return this.bufferSize;	
		},

		/** Change the buffer size used by this IndexInput */
		setBufferSize : function(newSize) {
			assert(this.buffer == null || this.bufferSize == this.buffer.length, 
					"buffer=" + this.buffer + " bufferSize=" + this.bufferSize + " buffer.length=" + (this.buffer != null ? this.buffer.length : 0));
					
			if (newSize != this.bufferSize) {
			  this.__checkBufferSize(newSize);
			  this.bufferSize = newSize;
			  if (this.buffer != null) {
			    // Resize the existing buffer and carefully save as
			    // many bytes as possible starting from the current
			    // bufferPosition
			    var newBuffer = new Buffer(newSize);
			    var leftInBuffer = this.bufferLength-this.bufferPosition;
			    var numToCopy;
			    if (leftInBuffer > newSize)
			      numToCopy = newSize;
			    else
			      numToCopy = leftInBuffer;
			    //System.arraycopy(buffer, bufferPosition, newBuffer, 0, numToCopy);
			    this.buffer.copy(newBuffer, 0, this.bufferPosition, this.bufferPosition+numToCopy-1);
			    
			    this.bufferStart += this.bufferPosition;
			    this.bufferPosition = 0;
			    this.bufferLength = numToCopy;
			    this._newBuffer(newBuffer);
			  }
			}
		},
  

		//@Override
		readByte : function() {
/* 			console.log("BufferedIndexInput::readByte"); */

			if (this.bufferPosition >= this.bufferLength) //all buf content read, move buf window forward in the file
				this.refill();
			
			var b = this.buffer[this.bufferPosition++]; 
/* 			this.print_status(); */
			return b;
    	},


/*
    	//@Override
    	readBytes : function(b, offset, len){
	    	this.readBytes(b,offset,len,true);
    	},
*/

    	//@Override
		/** Reads a specified number of bytes into an array at the specified offset.
		* @param b the array to read bytes into
		* @param offset the offset in the array to start storing bytes
		* @param len the number of bytes to read
		* @see DataOutput#writeBytes(byte[],int)
		*/
    	readBytes : function(b, offset, len, useBuffer){
/* 	    	console.log("BufferedIndexInput::readBytes offset="+offset +", len="+len+", useBuffer="+useBuffer); */
	    	assert(len >=0 , "read bytes must not be negative");
	    		    	
	    	// the current buffer window contains enough data to satisfy this request
			if(len <= (this.bufferLength-this.bufferPosition)){
				//buf.copy(targetBuffer, [targetStart], [sourceStart], [sourceEnd])
				//arraycopy(Object src, int srcPos, Object dest, int destPos, int length) 				
				//System.arraycopy(buffer, bufferPosition, b, offset, len);
				if(len>0) // to allow b to be null if len is 0...
					this.buffer.copy(b, offset, this.bufferPosition, (this.bufferPosition+len));//end source position is excluded from the copy!!		
				this.bufferPosition+=len;
			} 
			// the buffer does not have enough data. we need to server what we've got, then move window forward 
			else {
			
			  //First serve all we've got.
			  var available = this.bufferLength - this.bufferPosition;
			  if(available > 0){
			    this.buffer(b, offset, this.bufferPosition, this.bufferLength-1);
			    //System.arraycopy(buffer, bufferPosition, b, offset, available);
			    offset += available;
			    len -= available;
			    this.bufferPosition += available;
			  }
			  
			  // and now, read the remaining 'len' bytes:
			  if (useBuffer && len<this.bufferSize){
			    // If the amount left to read is small enough, and
			    // we are allowed to use our buffer, do it in the usual
			    // buffered way: fill the buffer and copy from it:
			    this.refill();
			    if(this.bufferLength<len){
			      // Throw an exception when refill() could not read len bytes:
			      //System.arraycopy(buffer, 0, b, offset, bufferLength);
			      this.buffer.copy(b, offset, 0, this.bufferLength-1);
			      throw new EOFException("read past EOF: " + this);
			    } 
			    else {
			      //System.arraycopy(buffer, 0, b, offset, len);
			      this.buffer.copy(b, offset, 0, len-1);
			      this.bufferPosition=len;
			    }
			  } else {
			    // The amount left to read is larger than the buffer
			    // or we've been asked to not use our buffer -
			    // there's no performance reason not to read it all
			    // at once. Note that unlike the previous code of
			    // this function, there is no need to do a seek
			    // here, because there's no need to reread what we
			    // had in the buffer.
			    var after = this.bufferStart+this.bufferPosition+len;
			    if(after > this.length())
			      throw new EOFException("read past EOF: " + this);
			    this.readInternal(b, offset, len);
			    this.bufferStart = after;
			    this.bufferPosition = 0;
			    this.bufferLength = 0;                    // trigger refill() on read
			  }
			}

 	
/* 			this.print_status(); */
    	},
	
		//@Override
		readShort : function(){
			if (2 <= (this.bufferLength-this.bufferPosition)) {
				//return (short) (((this.buffer[bufferPosition++] & 0xFF) <<  8) |  (buffer[bufferPosition++] & 0xFF));
				var val = this.buffer.readInt16BE(this.bufferPosition);
				this.bufferPosition += 2;			
				return val;
			} else {
			  return IndexInput.prototype.readShort.call(this);
			}    			
		},
	
		//@Override 
		readInt : function(){
/* 			console.log("BufferedIndexInput::readInt"); */
			if (4 <= (this.bufferLength-this.bufferPosition)) {
			  //return ((buffer[bufferPosition++] & 0xFF) << 24) | ((buffer[bufferPosition++] & 0xFF) << 16) | ((buffer[bufferPosition++] & 0xFF) <<  8) |  (buffer[bufferPosition++] & 0xFF);
				var val = this.buffer.readInt32BE(this.bufferPosition);
				this.bufferPosition += 4;
				return val;
			} else {
			  return IndexInput.prototype.readInt.call(this);
			}			
		},
	
		//@Override
		readLong : function(){
/* 			console.log("BufferedIndexInput::readLong"); */
			if (8 <= (this.bufferLength-this.bufferPosition)) {
			
				/*
				var i1 = ((this.buffer[this.bufferPosition++] & 0xff) << 24) 
						| ((this.buffer[this.bufferPosition++] & 0xff) << 16) 
						| ((this.buffer[this.bufferPosition++] & 0xff) << 8) 
						| (this.buffer[this.bufferPosition++] & 0xff);
				
				var i2 = ((this.buffer[this.bufferPosition++] & 0xff) << 24) 
						| ((this.buffer[this.bufferPosition++] & 0xff) << 16) 
						| ((this.buffer[this.bufferPosition++] & 0xff) << 8) 
						| (this.buffer[bufferPosition++] & 0xff);
						
				return (i1 << 32) | (i2 & 0xFFFFFFFF);
				*/
				
				var high = this.buffer.readInt32BE(this.bufferPosition);
				this.bufferPosition += 4;
				
				var low = this.buffer.readInt32BE(this.bufferPosition);
				this.bufferPosition += 4;
				
				return ( high << 32 | low & 0xFFFFFFFF );	
			  
			} else {
			  return IndexInput.prototype.readLong.call(this);
			}

		},
	
		//@Override
		readVInt : function(){
			
/* 			console.log("BufferedIndexInput::readVInt"); */
			
			if (5 <= (this.bufferLength-this.bufferPosition)) {
			
				var b = this.buffer[this.bufferPosition++];
				if (b >= 0) return b;
				var i = b & 0x7F;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 7;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 14;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 21;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				// Warning: the next ands use 0x0F / 0xF0 - beware copy/paste errors:
				i |= (b & 0x0F) << 28;
				if ((b & 0xF0) == 0) return i;
				throw new IOException("Invalid vInt detected (too many bits)");
			} else {
			  return IndexInput.prototype.readVInt.call(this);
			}
    				
		},
	
		//@Override
		readVLong : function(){
/* 			console.log("BufferedIndexInput::readVLong"); */

			if (9 <= this.bufferLength-this.bufferPosition) {
				var b = this.buffer[this.bufferPosition++];
				if (b >= 0) return b;
				var i = b & 0x7F;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 7;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 14;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 21;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 28;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 35;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 42;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 49;
				if (b >= 0) return i;
				b = this.buffer[this.bufferPosition++];
				i |= (b & 0x7F) << 56;
				if (b >= 0) return i;
				throw new IOException("Invalid vLong detected (negative values disallowed)");
			} else {
			  return IndexInput.prototype.readVLong.call(this);
			}
      
		},


  
    	//@Override
    	getFilePointer : function() { return this.bufferStart + this.bufferPosition; },
		
    	//@Override
		seek : function(pos){
		    if (pos >= this.bufferStart && pos < (this.bufferStart + this.bufferLength))
		    	this.bufferPosition = pos - this.bufferStart;  // seek within buffer
		    else {
		    	this.bufferStart = pos;
		    	this.bufferPosition = 0;
		    	this.bufferLength = 0;  // trigger refill() on read()
		    	this._seekInternal(pos);
		    }
		},

		clone : function() {
			var clone = IndexInput.prototype.clone.call(this);
			clone.buffer = null;
			clone.bufferLength = 0;
			clone.bufferPosition = 0;
			clone.bufferStart = this.getFilePointer();			
			return clone;
		},
		
		toString : function(){
			return this.resourceDesc;
		},
		


		//==== PROTECTED ===//

		/** Expert: implements buffer refill.  Reads bytes from the current position
		* in the input.
		* @param b the array to read bytes into
		* @param offset the offset in the array to start storing bytes
		* @param length the number of bytes to read
		*/
		readInternal : function(b, offset, length){throw new ImplNotSupportedException("readInternal not implemented here");},


		/**
		* Flushes the in-memory buffer to the given output, copying at most
		* <code>numBytes</code>.
		* <p>
		* <b>NOTE:</b> this method does not refill the buffer, however it does
		* advance the buffer position.
		* 
		* @return the number of bytes actually flushed from the in-memory buffer.
		*/
		_flushBuffer : function(out, numBytes){
			var toCopy = this.bufferLength - this.bufferPosition;
			if (toCopy > this.numBytes) {
			  toCopy = this.numBytes;
			}
			if (toCopy > 0) {
			  out.writeBytes(this.buffer, this.bufferPosition, toCopy);
			  this.bufferPosition += toCopy;
			}
			return toCopy;
    	},

		_newBuffer : function(newBuffer) {
			// Subclasses can do something here
			this.buffer = newBuffer;
		},

		/** Expert: implements seek.  Sets current position in this file, where the
		* next {@link #readInternal(byte[],int,int)} will occur.
		* @see #readInternal(byte[],int,int)
		*/
   		_seekInternal : function(pos){throw new ImplNotSupportedException();},
   		  
		//=== PRIVATE ===//

		__checkBufferSize : function(bufferSize) {
			if (bufferSize <= 0) throw new IllegalArgumentException("bufferSize must be greater than 0 (got " + this.bufferSize + ")");
      	},
  
    	/**
    	 upon finishing reading the buffer, move the buffer window forwards
    	**/
    	refill : function() {
/*     		console.log("BufferedIndexInput::refill"); */
    	
			var start = this.bufferStart + this.bufferPosition; //new starting offset in the file 
			var end = start + this.bufferSize; 
			if (end > this.length())  // don't read past EOF
			  end = this.length();
			var newLength =  end - start;
			if (newLength <= 0)
			  throw new EOFException("read past EOF: " + this.toString());
			
			if (this.buffer == null) {
			  this._newBuffer(new Buffer(this.bufferSize));  // allocate buffer lazily
			  this._seekInternal(this.bufferStart);
			}
			this.readInternal(this.buffer, 0, newLength);
			this.bufferLength = newLength;
			this.bufferStart = start;
			this.bufferPosition = 0;
			
/* 			this.print_status(); */
    	}
	}
});

module.exports = exports = BufferedIndexInput;