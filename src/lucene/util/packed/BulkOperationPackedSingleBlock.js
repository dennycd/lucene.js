var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var UnsupportedOperationException = require('library/java/lang/UnsupportedOperationException.js');
var BulkOperation = require('./BulkOperation.js');
/**
 * Non-specialized {@link BulkOperation} for {@link PackedInts.Format#PACKED_SINGLE_BLOCK}.
 */
var BulkOperationPackedSingleBlock = defineClass({
	name: "BulkOperationPackedSingleBlock",
	extend: BulkOperation,
	statics: {
		BLOCK_COUNT: 1,
		//@return long
		readLong: function( /* byte[] */ blocks, /* int */ blocksOffset) {
			return (blocks[blocksOffset++] & 0xFF) << 56 | (blocks[blocksOffset++] & 0xFF) << 48 | (blocks[blocksOffset++] & 0xFF) << 40 | (blocks[blocksOffset++] & 0xFF) << 32 | (blocks[blocksOffset++] & 0xFF) << 24 | (blocks[blocksOffset++] & 0xFF) << 16 | (blocks[blocksOffset++] & 0xFF) << 8 | blocks[blocksOffset++] & 0xFF;
		}
	}
	variables: {
		bitsPerValue: null,
		//int
		valueCount: null,
		//int
		mask: null //long		
	},
	construct: function( /* int */ bitsPerValue) {
		this.bitsPerValue = bitsPerValue;
		this.valueCount = 64 / bitsPerValue;
		this.mask = (1 << bitsPerValue) - 1;
	},
	methods: {
		//@Override
		//@return int
		longBlockCount: function() {
			return this.BLOCK_COUNT;
		},
		//@Override
		//@return int
		byteBlockCount: function() {
			return this.BLOCK_COUNT * 8;
		},
		//@Override
		longValueCount: function() {
			return this.valueCount;
		},
		//@Override
		byteValueCount: function() {
			return this.valueCount;
		},
		//@return int 
		decodeWithLongBlockLongValNoIter: function( /* long */ block, /* long[] */ values, /* int */ valuesOffset) {
			values[valuesOffset++] = block & mask;
			for (var j = 1; j < valueCount; ++j) {
				block >>>= this.bitsPerValue;
				values[valuesOffset++] = block & this.mask;
			}
			return valuesOffset;
		},
		//@return int
		decodeWithLongBlockIntValNoIter: function( /* long */ block, /* int[] */ values, /* int */ valuesOffset) {
			values[valuesOffset++] = (block & this.mask);
			for (var j = 1; j < valueCount; ++j) {
				block >>>= this.bitsPerValue;
				values[valuesOffset++] = (block & this.mask);
			}
			return valuesOffset;
		},
		//@return long
		encodeWithLongVal: function( /* long[] */ values, /* int */ valuesOffset) {
			var block = values[valuesOffset++];
			for (var j = 1; j < valueCount; ++j) {
				block |= values[valuesOffset++] << (j * this.bitsPerValue);
			}
			return block;
		},
		//@return long
		encodeWithIntVal: function( /* int[] */ values, /* int */ valuesOffset) {
			var block = values[valuesOffset++] & 0xFFFFFFFF;
			for (var j = 1; j < valueCount; ++j) {
				block |= (values[valuesOffset++] & 0xFFFFFFFF) << (j * this.bitsPerValue);
			}
			return block;
		},
		//@Override
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = blocks[blocksOffset++]; //long
				valuesOffset = this.decode(block, values, valuesOffset);
			}
		},
		//@Override
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = BulkOperationPackedSingleBlock.readLong(blocks, blocksOffset); //long
				blocksOffset += 8;
				valuesOffset = this.decode(block, values, valuesOffset);
			}
		},
		//@Override
		decodeWithLongBlockIntVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			if (this.bitsPerValue > 32) {
				throw new UnsupportedOperationException("Cannot decode " + this.bitsPerValue + "-bits values into an int[]");
			}
			for (var i = 0; i < iterations; ++i) {
				var block = blocks[blocksOffset++]; //long
				valuesOffset = this.decode(block, values, valuesOffset);
			}
		},
		//@Override
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			if (this.bitsPerValue > 32) {
				throw new UnsupportedOperationException("Cannot decode " + this.bitsPerValue + "-bits values into an int[]");
			}
			for (var i = 0; i < iterations; ++i) {
				var block = BulkOperationPackedSingleBlock.readLong(blocks, blocksOffset); //long
				blocksOffset += 8;
				valuesOffset = this.decode(block, values, valuesOffset);
			}
		},
		decode: function() {
			assert(null, "BulkOperationPackedSingleBlock::decode");
		},
		//overload dispatch 
		encode: function() {
/*
		  if(arguments.length==5){
			if()			  
		  }
		  else if(BulkOperation.prototype.encode)
		  	BulkOperation.prototype.encode.apply(this,arguments);
*/
			assert(null, "BulkOperationPackedSingleBlock::encode")
		},
		//@Override
		encodeWithLongValLongBlock: function( /* long[] */ values, /* int */ valuesOffset, /* long[] */ blocks, /* int */ blocksOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				blocks[blocksOffset++] = this.encode(values, valuesOffset);
				valuesOffset += valueCount;
			}
		},
		//@Override
		encodeWithIntValLongBlock: function( /* int[] */ values, /* int */ valuesOffset, /* long[] */ blocks, /* int */ blocksOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				blocks[blocksOffset++] = this.encode(values, valuesOffset);
				valuesOffset += valueCount;
			}
		},
		//@Override
		encodeWithLongValByteBlock: function( /* long[] */ values, /* int */ valuesOffset, /* byte[] */ blocks, /* int */ blocksOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = this.encode(values, valuesOffset); //long
				valuesOffset += valueCount;
				blocksOffset = this.writeLong(block, blocks, blocksOffset);
			}
		},
		//@Override
		encodeWithIntValByteBlock: function( /* int[] */ values, /* int */ valuesOffset, /* byte[] */ blocks, /* int */ blocksOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = this.encode(values, valuesOffset); //long
				valuesOffset += valueCount;
				blocksOffset = this.writeLong(block, blocks, blocksOffset);
			}
		}
	}
});
module.exports = exports = BulkOperationPackedSingleBlock;