var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Closeable = require('library/lucene/util/Closeable.js');

var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var RuntimeException = require('library/lucene/util/RuntimeException.js');

var DataInput = require('./DataInput.js');

/** 
 * DataInput backed by a byte array.
 * <b>WARNING:</b> This class omits all low-level checks.
 * @lucene.experimental 
 */
var ByteArrayDataInput = defineClass({
	name : "ByteArrayDataInput",
	extend : DataInput, 
	variables : {
		bytes : null, // Buffer //private byte[] 
		pos : null, //int - start reading position
		limit : null  //int  - position limit (exlucding) - A.K.A. the end-of-file position
	}, 
	
	construct : function(){

		  var c1 = function(/* byte[] */ bytes) {
		    this.reset(bytes);
		  }
		
		  var c2 = function(/* byte[] */ bytes, /* int */ offset, /* int */ len) {
		    this.reset(bytes, offset, len);
		  }
		
		  var c3 = function() {
		    this.reset(BytesRef.EMPTY_BYTES);
		  }

		  if(arguments.length==0) c3.call(this);
		  else if(arguments.length==1) c1.call(arguments[0]);
		  else c2.apply(this,arguments);
	},
	
	
	methods : {
	
		  reset : function(){
			  if(arguments.length==1) return this.resetWithBytes(arguments[0]);
			  else return this.resetWithBytesOffsetLen.apply(this,arguments);
		  },
		
		  resetWithBytes : function(/* byte[] */ bytes) {
		    this.resetWithBytesOffsetLen(bytes, 0, bytes.length);
		  },

		  resetWithBytesOffsetLen : function(/* byte[] */ bytes, /* int */ offset, /* int */ len) {
		  	assert(bytes instanceof Buffer, "bytes not Buffer type!");
		    this.bytes = bytes;
		    this.pos = offset;
		    this.limit = offset + len;
		  },
		  		
		  // NOTE: sets pos to 0, which is not right if you had
		  // called reset w/ non-zero offset!!
		   rewind : function() {
		    this.pos = 0;
		  },
		
		   getPosition : function() {
		    return this.pos;
		  }, 
		  
		  setPosition : function(/* int */ pos) {
		    this.pos = pos;
		  }, 
				
		   length : function() {
		    return this.limit;
		  }, 
		
		   eof : function() {
		    return this.pos == this.limit;
		  }, 
		
		  skipBytes : function(/* int */ count) {
		    this.pos += count;
		  }, 
		
		  //@Override
		  readShort : function() {
		    return  (((this.bytes[this.pos++] & 0xFF) <<  8) |  (this.bytes[this.pos++] & 0xFF)); // (short) (((bytes[pos++] & 0xFF) <<  8) |  (bytes[pos++] & 0xFF));
		  }, 
		 
		  //@Override
		  readInt : function() {
		    return ((this.bytes[this.pos++] & 0xFF) << 24) | ((this.bytes[this.pos++] & 0xFF) << 16)
		      | ((this.bytes[this.pos++] & 0xFF) <<  8) |  (this.bytes[this.pos++] & 0xFF);
		  }, 
		 
		  //@Override
		  readLong : function() {
		    var i1 = ((this.bytes[this.pos++] & 0xff) << 24) | ((this.bytes[this.pos++] & 0xff) << 16) |
		      ((this.bytes[this.pos++] & 0xff) << 8) | (this.bytes[this.pos++] & 0xff);
		    var i2 = ((this.bytes[this.pos++] & 0xff) << 24) | ((this.bytes[this.pos++] & 0xff) << 16) |
		      ((this.bytes[this.pos++] & 0xff) << 8) | (this.bytes[this.pos++] & 0xff);
		    return (i1 << 32) | (i2 & 0xFFFFFFFF);
		  }, 
		
		  //@Override
		   readVInt : function() {
		    var b = this.bytes[this.pos++];
		    if (b >= 0) return b;
		    var i = b & 0x7F;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7F) << 7;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7F) << 14;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7F) << 21;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    // Warning: the next ands use 0x0F / 0xF0 - beware copy/paste errors:
		    i |= (b & 0x0F) << 28;
		    if ((b & 0xF0) == 0) return i;
		    throw new RuntimeException("Invalid vInt detected (too many bits)");
		  },
		 
		  //@Override
		  readVLong : function() {
		    var b = this.bytes[this.pos++];
		    if (b >= 0) return b;
		    var i = b & 0x7FL;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7FL) << 7;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7FL) << 14;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7FL) << 21;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7FL) << 28;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7FL) << 35;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7FL) << 42;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7FL) << 49;
		    if (b >= 0) return i;
		    b = this.bytes[this.pos++];
		    i |= (b & 0x7FL) << 56;
		    if (b >= 0) return i;
		    throw new RuntimeException("Invalid vLong detected (negative values disallowed)");
		  }
		
		  // NOTE: AIOOBE not EOF if you read too much
		  //@Override
		   readByte : function() {
		    return this.bytes[this.pos++];
		  },
		
		  // NOTE: AIOOBE not EOF if you read too much
		  //@Override
		  public void readBytes(/* byte[] */ b, /* int */ offset, /* int */ len) {
		  	assert(b instanceof Buffer, "b not an instance of Buffer");
		  	assert(this.pos + offset <= this.limit, "attemp to read bytes beyond limit: limit="+this.limit + ", read pos="+this.pos + ", len="+len);
		    //System.arraycopy(bytes, pos, b, offset, len);
		    this.bytes.copy(b, offset, this.pos, this.pos + offset);
		    this.pos += len;
		  }
				
		
	}
});
module.exports = exports = ByteArrayDataInput;