var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');

var IndexOutput = require('library/lucene/store/IndexOutput.js'); /** Base implementation class for buffered {@link IndexOutput}. */

var BufferedIndexOutput = defineClass({
	name: "BufferedIndexOutput",
	extend: IndexOutput,
	statics: { /** The default buffer size in bytes ({@value #DEFAULT_BUFFER_SIZE}). */
		DEFAULT_BUFFER_SIZE: 16384
	},
	/**
	 * Creates a new {@link BufferedIndexOutput} with the given buffer size.
	 * @param bufferSize the buffer size in bytes used to buffer writes internally.
	 * @throws IllegalArgumentException if the given buffer size is less or equal to <tt>0</tt>
	 */
	construct: function() {
		IndexOutput.call(this);
		if (arguments.length == 0) {
			this.bufferSize = BufferedIndexOutput.DEFAULT_BUFFER_SIZE;
		} else if (arguments.length == 1) {
			if (typeof(arguments[0]) != "number" || isNaN(arguments[0])) throw new IllegalArgumentException();
			if (arguments[0] <= 0) throw new IllegalArgumentException("bufferSize must be greater than 0 (got " + arguments[0] + ")");
			this.bufferSize = arguments[0];
		} else throw new IllegalArgumentException();
		this.buffer = new Buffer(this.bufferSize);
		this.bufferStart = 0; // position in file of buffer
		this.bufferPosition = 0; // position in buffer  
	},
	methods: {
		//@Override
		writeByte: function(b) {
			if (this.bufferPosition >= this.bufferSize) flush();
			this.buffer[this.bufferPosition++] = b;
		},
		//@Override
		writeBytes: function(b, offset, length) {
			var bytesLeft = this.bufferSize - this.bufferPosition;
			// is there enough space in the buffer?
			if (bytesLeft >= length) {
				// we add the data to the end of the buffer
				//System.arraycopy(b, offset, buffer, bufferPosition, length);
				b.copy(this.buffer, this.bufferPosition, offset, offset+length-1);
				this.bufferPosition += length;
				// if the buffer is full, flush it
				if (this.bufferSize - this.bufferPosition == 0) flush();
			} else {
				// is data larger then buffer?
				if (length > this.bufferSize) {
					// we flush the buffer
					if (this.bufferPosition > 0) flush();
					// and write data at once
					this.flushBuffer(b, offset, length);
					this.bufferStart += length;
				} else {
					// we fill/flush the buffer (until the input is written)
					var pos = 0; // position in the input data
					var pieceLength;
					while (pos < length) {
						pieceLength = (length - pos < bytesLeft) ? length - pos : bytesLeft;
						//System.arraycopy(b, pos + offset, buffer, bufferPosition, pieceLength);
						//arraycopy(Object src, int srcPos, Object dest, int destPos, int length)
						b.copy(this.buffer, this.bufferPosition, pos+offset, pos+offset+pieceLength-1);
						pos += pieceLength;
						this.bufferPosition += pieceLength;
						// if the buffer is full, flush it
						bytesLeft = this.bufferSize - this.bufferPosition;
						if (bytesLeft == 0) {
							flush();
							bytesLeft = this.bufferSize;
						}
					}
				}
			}
		}, //writeBytes
	
		//@Override
		flush : function(){
			this.flushBuffer(this.buffer, this.bufferPosition);
			this.bufferStart += this.bufferPosition;
			this.bufferPosition = 0;
		},	
			
		/** Expert: implements buffer write.  Writes bytes at the current position in
		* the output.
		* @param b the bytes to write
		* @param len the number of bytes to write
		*/
		flushBuffer : function(b, len){
			this.flushBuffer(b, 0, len);
		},
  
		/** Expert: implements buffer write.  Writes bytes at the current position in
		* the output.
		* @param b the bytes to write
		* @param offset the offset in the byte array
		* @param len the number of bytes to write
		*/
   		flushBuffer : function(b, offset, len){throw new ImplNotSupportedException();},


		//@Override
		close : function(){
			this.flush();
		},
		
		//@Override
		getFilePointer : function() {
			return this.bufferStart + this.bufferPosition;
		},
		
		//@Override
		seek : function(pos){
			this.flush();
			this.bufferStart = pos;
		},
		
		//@Override
		length: function(){throw new ImplNotSupportedException();},
  		
	}
});
module.exports = exports = BufferedIndexOutput;