var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked5 = defineClass({
	name: "BulkOperationPacked5",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 5);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 59);
				values[valuesOffset++] = ((block0 >>> 54) & 31);
				values[valuesOffset++] = ((block0 >>> 49) & 31);
				values[valuesOffset++] = ((block0 >>> 44) & 31);
				values[valuesOffset++] = ((block0 >>> 39) & 31);
				values[valuesOffset++] = ((block0 >>> 34) & 31);
				values[valuesOffset++] = ((block0 >>> 29) & 31);
				values[valuesOffset++] = ((block0 >>> 24) & 31);
				values[valuesOffset++] = ((block0 >>> 19) & 31);
				values[valuesOffset++] = ((block0 >>> 14) & 31);
				values[valuesOffset++] = ((block0 >>> 9) & 31);
				values[valuesOffset++] = ((block0 >>> 4) & 31);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 15) << 1) | (block1 >>> 63));
				values[valuesOffset++] = ((block1 >>> 58) & 31);
				values[valuesOffset++] = ((block1 >>> 53) & 31);
				values[valuesOffset++] = ((block1 >>> 48) & 31);
				values[valuesOffset++] = ((block1 >>> 43) & 31);
				values[valuesOffset++] = ((block1 >>> 38) & 31);
				values[valuesOffset++] = ((block1 >>> 33) & 31);
				values[valuesOffset++] = ((block1 >>> 28) & 31);
				values[valuesOffset++] = ((block1 >>> 23) & 31);
				values[valuesOffset++] = ((block1 >>> 18) & 31);
				values[valuesOffset++] = ((block1 >>> 13) & 31);
				values[valuesOffset++] = ((block1 >>> 8) & 31);
				values[valuesOffset++] = ((block1 >>> 3) & 31);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 7) << 2) | (block2 >>> 62));
				values[valuesOffset++] = ((block2 >>> 57) & 31);
				values[valuesOffset++] = ((block2 >>> 52) & 31);
				values[valuesOffset++] = ((block2 >>> 47) & 31);
				values[valuesOffset++] = ((block2 >>> 42) & 31);
				values[valuesOffset++] = ((block2 >>> 37) & 31);
				values[valuesOffset++] = ((block2 >>> 32) & 31);
				values[valuesOffset++] = ((block2 >>> 27) & 31);
				values[valuesOffset++] = ((block2 >>> 22) & 31);
				values[valuesOffset++] = ((block2 >>> 17) & 31);
				values[valuesOffset++] = ((block2 >>> 12) & 31);
				values[valuesOffset++] = ((block2 >>> 7) & 31);
				values[valuesOffset++] = ((block2 >>> 2) & 31);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 3) << 3) | (block3 >>> 61));
				values[valuesOffset++] = ((block3 >>> 56) & 31);
				values[valuesOffset++] = ((block3 >>> 51) & 31);
				values[valuesOffset++] = ((block3 >>> 46) & 31);
				values[valuesOffset++] = ((block3 >>> 41) & 31);
				values[valuesOffset++] = ((block3 >>> 36) & 31);
				values[valuesOffset++] = ((block3 >>> 31) & 31);
				values[valuesOffset++] = ((block3 >>> 26) & 31);
				values[valuesOffset++] = ((block3 >>> 21) & 31);
				values[valuesOffset++] = ((block3 >>> 16) & 31);
				values[valuesOffset++] = ((block3 >>> 11) & 31);
				values[valuesOffset++] = ((block3 >>> 6) & 31);
				values[valuesOffset++] = ((block3 >>> 1) & 31);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 1) << 4) | (block4 >>> 60));
				values[valuesOffset++] = ((block4 >>> 55) & 31);
				values[valuesOffset++] = ((block4 >>> 50) & 31);
				values[valuesOffset++] = ((block4 >>> 45) & 31);
				values[valuesOffset++] = ((block4 >>> 40) & 31);
				values[valuesOffset++] = ((block4 >>> 35) & 31);
				values[valuesOffset++] = ((block4 >>> 30) & 31);
				values[valuesOffset++] = ((block4 >>> 25) & 31);
				values[valuesOffset++] = ((block4 >>> 20) & 31);
				values[valuesOffset++] = ((block4 >>> 15) & 31);
				values[valuesOffset++] = ((block4 >>> 10) & 31);
				values[valuesOffset++] = ((block4 >>> 5) & 31);
				values[valuesOffset++] = (block4 & 31);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = byte0 >>> 3;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte0 & 7) << 2) | (byte1 >>> 6);
				values[valuesOffset++] = (byte1 >>> 1) & 31;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 1) << 4) | (byte2 >>> 4);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 15) << 1) | (byte3 >>> 7);
				values[valuesOffset++] = (byte3 >>> 2) & 31;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 3) << 3) | (byte4 >>> 5);
				values[valuesOffset++] = byte4 & 31;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 59;
				values[valuesOffset++] = (block0 >>> 54) & 31;
				values[valuesOffset++] = (block0 >>> 49) & 31;
				values[valuesOffset++] = (block0 >>> 44) & 31;
				values[valuesOffset++] = (block0 >>> 39) & 31;
				values[valuesOffset++] = (block0 >>> 34) & 31;
				values[valuesOffset++] = (block0 >>> 29) & 31;
				values[valuesOffset++] = (block0 >>> 24) & 31;
				values[valuesOffset++] = (block0 >>> 19) & 31;
				values[valuesOffset++] = (block0 >>> 14) & 31;
				values[valuesOffset++] = (block0 >>> 9) & 31;
				values[valuesOffset++] = (block0 >>> 4) & 31;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 15) << 1) | (block1 >>> 63);
				values[valuesOffset++] = (block1 >>> 58) & 31;
				values[valuesOffset++] = (block1 >>> 53) & 31;
				values[valuesOffset++] = (block1 >>> 48) & 31;
				values[valuesOffset++] = (block1 >>> 43) & 31;
				values[valuesOffset++] = (block1 >>> 38) & 31;
				values[valuesOffset++] = (block1 >>> 33) & 31;
				values[valuesOffset++] = (block1 >>> 28) & 31;
				values[valuesOffset++] = (block1 >>> 23) & 31;
				values[valuesOffset++] = (block1 >>> 18) & 31;
				values[valuesOffset++] = (block1 >>> 13) & 31;
				values[valuesOffset++] = (block1 >>> 8) & 31;
				values[valuesOffset++] = (block1 >>> 3) & 31;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 7) << 2) | (block2 >>> 62);
				values[valuesOffset++] = (block2 >>> 57) & 31;
				values[valuesOffset++] = (block2 >>> 52) & 31;
				values[valuesOffset++] = (block2 >>> 47) & 31;
				values[valuesOffset++] = (block2 >>> 42) & 31;
				values[valuesOffset++] = (block2 >>> 37) & 31;
				values[valuesOffset++] = (block2 >>> 32) & 31;
				values[valuesOffset++] = (block2 >>> 27) & 31;
				values[valuesOffset++] = (block2 >>> 22) & 31;
				values[valuesOffset++] = (block2 >>> 17) & 31;
				values[valuesOffset++] = (block2 >>> 12) & 31;
				values[valuesOffset++] = (block2 >>> 7) & 31;
				values[valuesOffset++] = (block2 >>> 2) & 31;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 3) << 3) | (block3 >>> 61);
				values[valuesOffset++] = (block3 >>> 56) & 31;
				values[valuesOffset++] = (block3 >>> 51) & 31;
				values[valuesOffset++] = (block3 >>> 46) & 31;
				values[valuesOffset++] = (block3 >>> 41) & 31;
				values[valuesOffset++] = (block3 >>> 36) & 31;
				values[valuesOffset++] = (block3 >>> 31) & 31;
				values[valuesOffset++] = (block3 >>> 26) & 31;
				values[valuesOffset++] = (block3 >>> 21) & 31;
				values[valuesOffset++] = (block3 >>> 16) & 31;
				values[valuesOffset++] = (block3 >>> 11) & 31;
				values[valuesOffset++] = (block3 >>> 6) & 31;
				values[valuesOffset++] = (block3 >>> 1) & 31;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 1) << 4) | (block4 >>> 60);
				values[valuesOffset++] = (block4 >>> 55) & 31;
				values[valuesOffset++] = (block4 >>> 50) & 31;
				values[valuesOffset++] = (block4 >>> 45) & 31;
				values[valuesOffset++] = (block4 >>> 40) & 31;
				values[valuesOffset++] = (block4 >>> 35) & 31;
				values[valuesOffset++] = (block4 >>> 30) & 31;
				values[valuesOffset++] = (block4 >>> 25) & 31;
				values[valuesOffset++] = (block4 >>> 20) & 31;
				values[valuesOffset++] = (block4 >>> 15) & 31;
				values[valuesOffset++] = (block4 >>> 10) & 31;
				values[valuesOffset++] = (block4 >>> 5) & 31;
				values[valuesOffset++] = block4 & 31;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = byte0 >>> 3;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte0 & 7) << 2) | (byte1 >>> 6);
				values[valuesOffset++] = (byte1 >>> 1) & 31;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 1) << 4) | (byte2 >>> 4);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 15) << 1) | (byte3 >>> 7);
				values[valuesOffset++] = (byte3 >>> 2) & 31;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 3) << 3) | (byte4 >>> 5);
				values[valuesOffset++] = byte4 & 31;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked5;