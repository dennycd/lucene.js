var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IOException = require('library/lucene/util/IOException.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');

var Cloneable = require('library/lucene/util/Cloneable.js');
var HashMap = require('library/java/util/HashMap.js');
/**
 * Abstract base class for performing read operations of Lucene's low-level
 * data types.
 *
 * <p>{@code DataInput} may only be used from one thread, because it is not
 * thread safe (it keeps internal state like file position). To allow
 * multithreaded use, every {@code DataInput} instance must be cloned before
 * used in another thread. Subclasses must therefore implement {@link #clone()},
 * returning a new {@code DataInput} which operates on the same underlying
 * resource, but positioned independently.
 */
var DataInput = defineClass({
	name : "DataInput",
	implement : Cloneable,   //must implemented all methods defined in cloneable
	variables : {
		
	},
	
	construct : function(){
		//console.log("DataInput::construct");
		//console.log("DataInput::construct done");
	},
	
	statics : {
		
	},
	
	methods : {
		
		/** Reads and returns a single byte.
		* @see DataOutput#writeByte(byte)
		*/		
   		readByte : function(){throw new ImplNotSupportedException();},
  
		/** Reads a specified number of bytes into an array at the specified offset.
		* @param b the array to read bytes into
		* @param offset the offset in the array to start storing bytes
		* @param len the number of bytes to read
		* @see DataOutput#writeBytes(byte[],int)
		*/
		readBytes : function(b, offset, len){throw new ImplNotSupportedException();},

		/** Reads a specified number of bytes into an array at the
		* specified offset with control over whether the read
		* should be buffered (callers who have their own buffer
		* should pass in "false" for useBuffer).  Currently only
		* {@link BufferedIndexInput} respects this parameter.
		* @param b the array to read bytes into
		* @param offset the offset in the array to start storing bytes
		* @param len the number of bytes to read
		* @param useBuffer set to false if the caller will handle
		* buffering.
		* @see DataOutput#writeBytes(byte[],int)
		*/
		readBytes : function(b, offset, len, useBuffer){
		    // Default to ignoring useBuffer entirely
		    this.readBytes(b, offset, len);	
		},

		/** Reads two bytes and returns a short.
		* @see DataOutput#writeByte(byte)
		*/
		readShort : function(){
			var buf = new Buffer(2);
			this.readBytes(buf,0,2);
			return buf.readInt16BE(0);
		},
   
		/** Reads four bytes and returns an int.
		* @see DataOutput#writeInt(int)
		*/
		readInt : function(){
			//console.log("DataInput::readInt");
			var buf = new Buffer(4);
			this.readBytes(buf,0,4); 
			return buf.readInt32BE(0);
		},

		/** Reads eight bytes and returns a long.
		* @see DataOutput#writeLong(long)
		*/
		readLong : function(){
			//console.log("DataInput::readLong");
			var high =  (this.readInt() << 32);
			var low = (this.readInt() & 0xFFFFFFFF);
			return (high | low);			
		},
  
   		
	  /** Reads an int stored in variable-length format.  Reads between one and
	   * five bytes.  Smaller values take fewer bytes.  Negative numbers are not
	   * supported.
	   * <p>
	   * The format is described further in {@link DataOutput#writeVInt(int)}.
	   * 
	   * @see DataOutput#writeVInt(int)
	   */
		readVInt : function(){
			//console.log("DataInput::readVInt");
		    var b = this.readByte();  //console.log("b="+b);
		    if (b >= 0) return b;  //first bit is negative signed
		    var i = b & 0x7F;   
		    b = this.readByte(); //console.log("b="+b);
		    i |= (b & 0x7F) << 7;
		    if (b >= 0) return i;
		    b = this.readByte(); //console.log("b="+b);
		    i |= (b & 0x7F) << 14;
		    if (b >= 0) return i;
		    b = this.readByte(); //console.log("b="+b);
		    i |= (b & 0x7F) << 21;
		    if (b >= 0) return i;
		    b = this.readByte(); //console.log("b="+b);
		    // Warning: the next ands use 0x0F / 0xF0 - beware copy/paste errors:
		    i |= (b & 0x0F) << 28;
		    if ((b & 0xF0) == 0) return i;
		    throw new IOException("Invalid vInt detected (too many bits)");    			
		},

		/** Reads a long stored in variable-length format.  Reads between one and
		* nine bytes.  Smaller values take fewer bytes.  Negative numbers are not
		* supported.
		* <p>
		* The format is described further in {@link DataOutput#writeVInt(int)}.
		* 
		* @see DataOutput#writeVLong(long)
		*/
		readVLong : function() {
			//console.log("DataInput::readVLong");
			var b = this.readByte();
			if (b >= 0) return b;
			var i = b & 0x7F;
			b = this.readByte();
			i |= (b & 0x7F) << 7;
			if (b >= 0) return i;
			b = this.readByte();
			i |= (b & 0x7F) << 14;
			if (b >= 0) return i;
			b = this.readByte();
			i |= (b & 0x7F) << 21;
			if (b >= 0) return i;
			b = this.readByte();
			i |= (b & 0x7F) << 28;
			if (b >= 0) return i;
			b = this.readByte();
			i |= (b & 0x7F) << 35;
			if (b >= 0) return i;
			b = this.readByte();
			i |= (b & 0x7F) << 42;
			if (b >= 0) return i;
			b = this.readByte();
			i |= (b & 0x7F) << 49;
			if (b >= 0) return i;
			b = this.readByte();
			i |= (b & 0x7F) << 56;
			if (b >= 0) return i;
			throw new IOException("Invalid vLong detected (negative values disallowed)");
    	},


		/** Reads a string.
		   [length] [bytes]
		* @see DataOutput#writeString(String)
		*/
   		readString : function() {
			//console.log("DataInput::readString");
			var length = this.readVInt(); //console.log("length="+length); 
			var buf = new Buffer(length);
			this.readBytes(buf, 0, length);
			
			
			//console.log("read buffer " + buf);
			
			return buf.toString('utf8',0, buf.length);
		},
			
		/** Reads a Set&lt;String&gt; previously written
		*  with {@link DataOutput#writeStringSet(Set)}. 
		*/
		readStringSet : function() {
			var set = new Object();
			var count = this.readInt();
			for(var i=0;i<count;i++) {
				var str = this.readString();
				if(str) set[str] = true;
				else throw new IOException("Invalid string read");
			}
			return set;
		},
  

		/** Reads a Map&lt;String,String&gt; previously written
		*  with {@link DataOutput#writeStringStringMap(Map)}. 
		*/
		readStringStringMap : function() {
			var map = new HashMap();
			var count = this.readInt();
			for(var i=0;i<count;i++) {
				var key = this.readString();
				var val = this.readString();
				//map[key] = val;
				map.put(key,val);
			}
			return map;
		},
  
		
		/** Returns a clone of this stream.
		*
		* <p>Clones of a stream access the same data, and are positioned at the same
		* point as the stream they were cloned from.
		*
		* <p>Expert: Subclasses must ensure that clones may be positioned at
		* different points in the input from each other and from the stream they
		* were cloned from.
		*/
		clone : function(){
			var Cls = this.constructor;
			var obj = new Cls(); //invoking the most concrete class constructor with empty parameters
			return obj;
		}
   
	}
	
});

module.exports = exports = DataInput;