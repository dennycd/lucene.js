var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');


var BlockTreeTermsWriter = defineClass({
	name : "BlockTreeTermsWriter",
	statics : {
		  /** Suggested default value for the {@code
		   *  minItemsInBlock} parameter to {@link
		   *  #BlockTreeTermsWriter(SegmentWriteState,PostingsWriterBase,int,int)}. */
		   DEFAULT_MIN_BLOCK_SIZE : 25,
		
		  /** Suggested default value for the {@code
		   *  maxItemsInBlock} parameter to {@link
		   *  #BlockTreeTermsWriter(SegmentWriteState,PostingsWriterBase,int,int)}. */
		   DEFAULT_MAX_BLOCK_SIZE : 48
	}
});
module.exports = exports = BlockTreeTermsWriter;