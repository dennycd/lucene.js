var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var BulkOperation = require('./BulkOperation.js');
var UnsupportedOperationException = require('library/java/lang/UnsupportedOperationException.js');
/**
 * Non-specialized {@link BulkOperation} for {@link PackedInts.Format#PACKED}.
 */
var BulkOperationPacked = defineClass({
	name: "BulkOperationPacked",
	extend: BulkOperation,
	variables: {
		bitsPerValue: null,
		//int
		longBlockCount: null,
		//int
		longValueCount: null,
		//int
		byteBlockCount: null,
		//int
		byteValueCount: null,
		//int
		mask: null,
		//long
		intMask: null //int
	},
	construct: function( /* int */ bitsPerValue) {
		this.bitsPerValue = bitsPerValue;
		assert(bitsPerValue > 0 && bitsPerValue <= 64;
		var blocks = bitsPerValue;
		while ((blocks & 1) == 0) {
			blocks >>>= 1;
		}
		this.longBlockCount = blocks;
		this.longValueCount = 64 * this.longBlockCount / bitsPerValue;
		var byteBlockCount = 8 * this.longBlockCount;
		var byteValueCount = this.longValueCount;
		while ((byteBlockCount & 1) == 0 && (byteValueCount & 1) == 0) {
			byteBlockCount >>>= 1;
			byteValueCount >>>= 1;
		}
		this.byteBlockCount = byteBlockCount;
		this.byteValueCount = byteValueCount;
		if (bitsPerValue == 64) {
			this.mask = ~0L;
		} else {
			this.mask = (1L << bitsPerValue) - 1;
		}
		this.intMask = this.mask;
		assert(this.longValueCount * this.bitsPerValue == 64 * this.longBlockCount);
		}, methods: {
			//@Override
			longBlockCount: function() {
				return this.longBlockCount;
			},
			//@Override
			longValueCount: function() {
				return this.longValueCount;
			},
			//@Override
			byteBlockCount: function() {
				return this.byteBlockCount;
			},
			//@Override
			byteValueCount: function() {
				return this.byteValueCount;
			},
			//@Override
			decodeWithLongBlocksLongVals: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
				var bitsLeft = 64;
				for (var i = 0; i < this.longValueCount * iterations; ++i) {
					bitsLeft -= this.bitsPerValue;
					if (bitsLeft < 0) {
						values[valuesOffset++] = ((blocks[blocksOffset++] & ((1 << (this.bitsPerValue + bitsLeft)) - 1)) << -bitsLeft) | (blocks[blocksOffset] >>> (64 + bitsLeft));
						bitsLeft += 64;
					} else {
						values[valuesOffset++] = (blocks[blocksOffset] >>> bitsLeft) & this.mask;
					}
				}
			},
			//@Override
			decodeWithByteBlocksLongVals: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
				var nextValue = 0;
				var bitsLeft = this.bitsPerValue;
				for (var i = 0; i < iterations * this.byteBlockCount; ++i) {
					var bytes = blocks[blocksOffset++] & 0xFF;
					if (bitsLeft > 8) {
						// just buffer
						bitsLeft -= 8;
						nextValue |= bytes << bitsLeft;
					} else {
						// flush
						var bits = 8 - bitsLeft;
						values[valuesOffset++] = nextValue | (bytes >>> bits);
						while (bits >= this.bitsPerValue) {
							bits -= this.bitsPerValue;
							values[valuesOffset++] = (bytes >>> bits) & this.mask;
						}
						// then buffer
						bitsLeft = this.bitsPerValue - bits;
						nextValue = (bytes & ((1 << bits) - 1)) << bitsLeft;
					}
				}
				assert(bitsLeft == this.bitsPerValue);
			},
			//@Override
			decodeWithLongBlocksIntVals: function( /* long[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
				if (this.bitsPerValue > 32) {
					throw new UnsupportedOperationException("Cannot decode " + bitsPerValue + "-bits values into an int[]");
				}
				var bitsLeft = 64;
				for (var i = 0; i < this.longValueCount * iterations; ++i) {
					bitsLeft -= this.bitsPerValue;
					if (bitsLeft < 0) {
						values[valuesOffset++] = (((blocks[blocksOffset++] & ((1 << (this.bitsPerValue + bitsLeft)) - 1)) << -bitsLeft) | (blocks[blocksOffset] >>> (64 + bitsLeft)));
						bitsLeft += 64;
					} else {
						values[valuesOffset++] = ((blocks[blocksOffset] >>> bitsLeft) & this.mask);
					}
				}
			},
			//@Override
			decodeWithByteBlocksIntVals: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
				var nextValue = 0;
				var bitsLeft = this.bitsPerValue;
				for (var i = 0; i < iterations * this.byteBlockCount; ++i) {
					var bytes = blocks[blocksOffset++] & 0xFF;
					if (bitsLeft > 8) {
						// just buffer
						bitsLeft -= 8;
						nextValue |= bytes << bitsLeft;
					} else {
						// flush
						var bits = 8 - bitsLeft;
						values[valuesOffset++] = nextValue | (bytes >>> bits);
						while (bits >= this.bitsPerValue) {
							bits -= this.bitsPerValue;
							values[valuesOffset++] = (bytes >>> bits) & this.intMask;
						}
						// then buffer
						bitsLeft = this.bitsPerValue - bits;
						nextValue = (bytes & ((1 << bits) - 1)) << bitsLeft;
					}
				}
				assert(bitsLeft == bitsPerValue);
			},
			//@Override
			encode: function( /* long[] */ values, /* int */ valuesOffset, /* long[] */ blocks, /* int */ blocksOffset, /* int */ iterations) {
				var nextBlock = 0;
				var bitsLeft = 64;
				for (var i = 0; i < this.longValueCount * iterations; ++i) {
					bitsLeft -= this.bitsPerValue;
					if (bitsLeft > 0) {
						nextBlock |= values[valuesOffset++] << bitsLeft;
					} else if (bitsLeft == 0) {
						nextBlock |= values[valuesOffset++];
						blocks[blocksOffset++] = nextBlock;
						nextBlock = 0;
						bitsLeft = 64;
					} else { // bitsLeft < 0
						nextBlock |= values[valuesOffset] >>> -bitsLeft;
						blocks[blocksOffset++] = nextBlock;
						nextBlock = (values[valuesOffset++] & ((1 << -bitsLeft) - 1)) << (64 + bitsLeft);
						bitsLeft += 64;
					}
				}
			},
			//@Override
			encode: function( /* int[] */ values, /* int */ valuesOffset, /* long[] */ blocks, /* int */ blocksOffset, /* int */ iterations) {
				var nextBlock = 0;
				var bitsLeft = 64;
				for (var i = 0; i < this.longValueCount * iterations; ++i) {
					bitsLeft -= this.bitsPerValue;
					if (bitsLeft > 0) {
						nextBlock |= (values[valuesOffset++] & 0xFFFFFFFF) << bitsLeft;
					} else if (bitsLeft == 0) {
						nextBlock |= (values[valuesOffset++] & 0xFFFFFFFF);
						blocks[blocksOffset++] = nextBlock;
						nextBlock = 0;
						bitsLeft = 64;
					} else { // bitsLeft < 0
						nextBlock |= (values[valuesOffset] & 0xFFFFFFFF) >>> -bitsLeft;
						blocks[blocksOffset++] = nextBlock;
						nextBlock = (values[valuesOffset++] & ((1 << -bitsLeft) - 1)) << (64 + bitsLeft);
						bitsLeft += 64;
					}
				}
			},
			//@Override
			encode: function( /* long[] */ values, /* int */ valuesOffset, /* byte[] */ blocks, /* int */ blocksOffset, /* int */ iterations) {
				var nextBlock = 0;
				var bitsLeft = 8;
				var PackedInts = require('./PackedInts.js'); //TODO when calling this, are we in this source code directory ? or is it the runtime directory ? 
				for (var i = 0; i < this.byteValueCount * iterations; ++i) {
					var v = values[valuesOffset++];
					assert(this.bitsPerValue == 64 || PackedInts.bitsRequired(v) <= this.bitsPerValue);
					if (this.bitsPerValue < bitsLeft) {
						// just buffer
						nextBlock |= v << (bitsLeft - this.bitsPerValue);
						bitsLeft -= this.bitsPerValue;
					} else {
						// flush as many blocks as possible
						var bits = this.bitsPerValue - bitsLeft;
						blocks[blocksOffset++] = (nextBlock | (v >>> bits));
						while (bits >= 8) {
							bits -= 8;
							blocks[blocksOffset++] = (v >>> bits);
						}
						// then buffer
						bitsLeft = 8 - bits;
						nextBlock = ((v & ((1L << bits) - 1)) << bitsLeft);
					}
				}
				assert(bitsLeft == 8);
			},
			//@Override
			encode: function( /* int[] */ values, /* int */ valuesOffset, /* byte[] */ blocks, /* int */ blocksOffset, /* int */ iterations) {
				var nextBlock = 0;
				var bitsLeft = 8;
				var PackedInts = require('./PackedInts.js');
				for (var i = 0; i < this.byteValueCount * iterations; ++i) {
					var v = values[valuesOffset++];
					assert(PackedInts.bitsRequired(v & 0xFFFFFFFF) <= this.bitsPerValue);
					if (this.bitsPerValue < bitsLeft) {
						// just buffer
						nextBlock |= v << (bitsLeft - this.bitsPerValue);
						bitsLeft -= this.bitsPerValue;
					} else {
						// flush as many blocks as possible
						var bits = this.bitsPerValue - bitsLeft;
						blocks[blocksOffset++] = (nextBlock | (v >>> bits));
						while (bits >= 8) {
							bits -= 8;
							blocks[blocksOffset++] = (v >>> bits);
						}
						// then buffer
						bitsLeft = 8 - bits;
						nextBlock = (v & ((1 << bits) - 1)) << bitsLeft;
					}
					assert(bitsLeft == 8);
				}
			}
		});
	module.exports = exports = BulkOperationPacked;