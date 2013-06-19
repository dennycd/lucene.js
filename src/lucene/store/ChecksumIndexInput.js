var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IndexInput = require('library/lucene/store/IndexInput.js');


var UnsupportedOperationException = require('library/java/lang/UnsupportedOperationException.js');

var CRC32 = require('library/java/util/zip/CRC32.js');

/** Reads bytes through to a primary IndexInput, computing
 *  checksum as it goes. Note that you cannot use seek().
 *
 * @lucene.internal
 */
var ChecksumIndexInput = defineClass({
	name : "ChecksumIndexInput",
	extend : IndexInput, 
	variabes : {
		main : null,  //IndexInput
		digest : null, //Checksum  
	},
	
	construct : function(/* IndexInput */ main){
		console.log("ChecksumIndexInput::construct");

		
		try{
			IndexInput.call(this, "ChecksumIndexInput(" + main + ")");
			assert(main && Class.isInstanceOfClass(main, "IndexInput"))
		
		    this.main = main;
		    this.digest = new CRC32();
			console.log("ChecksumIndexInput::construct done");
		}catch(e){
			console.log(e.toString());
		}
	},
	
	methods : {
		
	  //@Override
	  readByte : function()  {
	  	//console.log("ChecksumIndexInput::readByte");
	    var b = this.main.readByte();
	    this.digest.updateWithByte(b);
	    return b;
	  },
	
	  //@Override
	   readBytes : function(/* byte[] */ b, /* int */ offset, /* int */ len){
	  	//console.log("ChecksumIndexInput::readBytes  ");
	    this.main.readBytes(b, offset, len);
	    this.digest.updateWithBytesOffset(b, offset, len);
	  },
	
	  
	  getChecksum : function() {
	    return this.digest.getValue();
	  },
	
	  //@Override
	  close : function(){
	    this.main.close();
	  },
	
	  //@Override
	  getFilePointer : function() {
	    return this.main.getFilePointer();
	  },
	
	  //@Override
	  seek : function(/* long */ pos) {
	    throw new UnsupportedOperationException();
	  },
	
	  //@Override
	  length : function() {
	    return this.main.length();
	  }
  
		
		
	}
		
});
module.exports = exports = ChecksumIndexInput;