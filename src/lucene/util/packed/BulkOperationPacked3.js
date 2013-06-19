var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked3 = defineClass({
	name: "BulkOperationPacked3",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 2);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 61);
				values[valuesOffset++] = ((block0 >>> 58) & 7);
				values[valuesOffset++] = ((block0 >>> 55) & 7);
				values[valuesOffset++] = ((block0 >>> 52) & 7);
				values[valuesOffset++] = ((block0 >>> 49) & 7);
				values[valuesOffset++] = ((block0 >>> 46) & 7);
				values[valuesOffset++] = ((block0 >>> 43) & 7);
				values[valuesOffset++] = ((block0 >>> 40) & 7);
				values[valuesOffset++] = ((block0 >>> 37) & 7);
				values[valuesOffset++] = ((block0 >>> 34) & 7);
				values[valuesOffset++] = ((block0 >>> 31) & 7);
				values[valuesOffset++] = ((block0 >>> 28) & 7);
				values[valuesOffset++] = ((block0 >>> 25) & 7);
				values[valuesOffset++] = ((block0 >>> 22) & 7);
				values[valuesOffset++] = ((block0 >>> 19) & 7);
				values[valuesOffset++] = ((block0 >>> 16) & 7);
				values[valuesOffset++] = ((block0 >>> 13) & 7);
				values[valuesOffset++] = ((block0 >>> 10) & 7);
				values[valuesOffset++] = ((block0 >>> 7) & 7);
				values[valuesOffset++] = ((block0 >>> 4) & 7);
				values[valuesOffset++] = ((block0 >>> 1) & 7);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 1) << 2) | (block1 >>> 62));
				values[valuesOffset++] = ((block1 >>> 59) & 7);
				values[valuesOffset++] = ((block1 >>> 56) & 7);
				values[valuesOffset++] = ((block1 >>> 53) & 7);
				values[valuesOffset++] = ((block1 >>> 50) & 7);
				values[valuesOffset++] = ((block1 >>> 47) & 7);
				values[valuesOffset++] = ((block1 >>> 44) & 7);
				values[valuesOffset++] = ((block1 >>> 41) & 7);
				values[valuesOffset++] = ((block1 >>> 38) & 7);
				values[valuesOffset++] = ((block1 >>> 35) & 7);
				values[valuesOffset++] = ((block1 >>> 32) & 7);
				values[valuesOffset++] = ((block1 >>> 29) & 7);
				values[valuesOffset++] = ((block1 >>> 26) & 7);
				values[valuesOffset++] = ((block1 >>> 23) & 7);
				values[valuesOffset++] = ((block1 >>> 20) & 7);
				values[valuesOffset++] = ((block1 >>> 17) & 7);
				values[valuesOffset++] = ((block1 >>> 14) & 7);
				values[valuesOffset++] = ((block1 >>> 11) & 7);
				values[valuesOffset++] = ((block1 >>> 8) & 7);
				values[valuesOffset++] = ((block1 >>> 5) & 7);
				values[valuesOffset++] = ((block1 >>> 2) & 7);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 3) << 1) | (block2 >>> 63));
				values[valuesOffset++] = ((block2 >>> 60) & 7);
				values[valuesOffset++] = ((block2 >>> 57) & 7);
				values[valuesOffset++] = ((block2 >>> 54) & 7);
				values[valuesOffset++] = ((block2 >>> 51) & 7);
				values[valuesOffset++] = ((block2 >>> 48) & 7);
				values[valuesOffset++] = ((block2 >>> 45) & 7);
				values[valuesOffset++] = ((block2 >>> 42) & 7);
				values[valuesOffset++] = ((block2 >>> 39) & 7);
				values[valuesOffset++] = ((block2 >>> 36) & 7);
				values[valuesOffset++] = ((block2 >>> 33) & 7);
				values[valuesOffset++] = ((block2 >>> 30) & 7);
				values[valuesOffset++] = ((block2 >>> 27) & 7);
				values[valuesOffset++] = ((block2 >>> 24) & 7);
				values[valuesOffset++] = ((block2 >>> 21) & 7);
				values[valuesOffset++] = ((block2 >>> 18) & 7);
				values[valuesOffset++] = ((block2 >>> 15) & 7);
				values[valuesOffset++] = ((block2 >>> 12) & 7);
				values[valuesOffset++] = ((block2 >>> 9) & 7);
				values[valuesOffset++] = ((block2 >>> 6) & 7);
				values[valuesOffset++] = ((block2 >>> 3) & 7);
				values[valuesOffset++] = (block2 & 7);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = byte0 >>> 5;
				values[valuesOffset++] = (byte0 >>> 2) & 7;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte0 & 3) << 1) | (byte1 >>> 7);
				values[valuesOffset++] = (byte1 >>> 4) & 7;
				values[valuesOffset++] = (byte1 >>> 1) & 7;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 1) << 2) | (byte2 >>> 6);
				values[valuesOffset++] = (byte2 >>> 3) & 7;
				values[valuesOffset++] = byte2 & 7;
			}
		},
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 61;
				values[valuesOffset++] = (block0 >>> 58) & 7;
				values[valuesOffset++] = (block0 >>> 55) & 7;
				values[valuesOffset++] = (block0 >>> 52) & 7;
				values[valuesOffset++] = (block0 >>> 49) & 7;
				values[valuesOffset++] = (block0 >>> 46) & 7;
				values[valuesOffset++] = (block0 >>> 43) & 7;
				values[valuesOffset++] = (block0 >>> 40) & 7;
				values[valuesOffset++] = (block0 >>> 37) & 7;
				values[valuesOffset++] = (block0 >>> 34) & 7;
				values[valuesOffset++] = (block0 >>> 31) & 7;
				values[valuesOffset++] = (block0 >>> 28) & 7;
				values[valuesOffset++] = (block0 >>> 25) & 7;
				values[valuesOffset++] = (block0 >>> 22) & 7;
				values[valuesOffset++] = (block0 >>> 19) & 7;
				values[valuesOffset++] = (block0 >>> 16) & 7;
				values[valuesOffset++] = (block0 >>> 13) & 7;
				values[valuesOffset++] = (block0 >>> 10) & 7;
				values[valuesOffset++] = (block0 >>> 7) & 7;
				values[valuesOffset++] = (block0 >>> 4) & 7;
				values[valuesOffset++] = (block0 >>> 1) & 7;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 1) << 2) | (block1 >>> 62);
				values[valuesOffset++] = (block1 >>> 59) & 7;
				values[valuesOffset++] = (block1 >>> 56) & 7;
				values[valuesOffset++] = (block1 >>> 53) & 7;
				values[valuesOffset++] = (block1 >>> 50) & 7;
				values[valuesOffset++] = (block1 >>> 47) & 7;
				values[valuesOffset++] = (block1 >>> 44) & 7;
				values[valuesOffset++] = (block1 >>> 41) & 7;
				values[valuesOffset++] = (block1 >>> 38) & 7;
				values[valuesOffset++] = (block1 >>> 35) & 7;
				values[valuesOffset++] = (block1 >>> 32) & 7;
				values[valuesOffset++] = (block1 >>> 29) & 7;
				values[valuesOffset++] = (block1 >>> 26) & 7;
				values[valuesOffset++] = (block1 >>> 23) & 7;
				values[valuesOffset++] = (block1 >>> 20) & 7;
				values[valuesOffset++] = (block1 >>> 17) & 7;
				values[valuesOffset++] = (block1 >>> 14) & 7;
				values[valuesOffset++] = (block1 >>> 11) & 7;
				values[valuesOffset++] = (block1 >>> 8) & 7;
				values[valuesOffset++] = (block1 >>> 5) & 7;
				values[valuesOffset++] = (block1 >>> 2) & 7;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 3) << 1) | (block2 >>> 63);
				values[valuesOffset++] = (block2 >>> 60) & 7;
				values[valuesOffset++] = (block2 >>> 57) & 7;
				values[valuesOffset++] = (block2 >>> 54) & 7;
				values[valuesOffset++] = (block2 >>> 51) & 7;
				values[valuesOffset++] = (block2 >>> 48) & 7;
				values[valuesOffset++] = (block2 >>> 45) & 7;
				values[valuesOffset++] = (block2 >>> 42) & 7;
				values[valuesOffset++] = (block2 >>> 39) & 7;
				values[valuesOffset++] = (block2 >>> 36) & 7;
				values[valuesOffset++] = (block2 >>> 33) & 7;
				values[valuesOffset++] = (block2 >>> 30) & 7;
				values[valuesOffset++] = (block2 >>> 27) & 7;
				values[valuesOffset++] = (block2 >>> 24) & 7;
				values[valuesOffset++] = (block2 >>> 21) & 7;
				values[valuesOffset++] = (block2 >>> 18) & 7;
				values[valuesOffset++] = (block2 >>> 15) & 7;
				values[valuesOffset++] = (block2 >>> 12) & 7;
				values[valuesOffset++] = (block2 >>> 9) & 7;
				values[valuesOffset++] = (block2 >>> 6) & 7;
				values[valuesOffset++] = (block2 >>> 3) & 7;
				values[valuesOffset++] = block2 & 7;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = byte0 >>> 5;
				values[valuesOffset++] = (byte0 >>> 2) & 7;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte0 & 3) << 1) | (byte1 >>> 7);
				values[valuesOffset++] = (byte1 >>> 4) & 7;
				values[valuesOffset++] = (byte1 >>> 1) & 7;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 1) << 2) | (byte2 >>> 6);
				values[valuesOffset++] = (byte2 >>> 3) & 7;
				values[valuesOffset++] = byte2 & 7;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked3;