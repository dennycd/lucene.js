var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked7 = defineClass({
	name: "BulkOperationPacked7",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 7);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 57);
				values[valuesOffset++] = ((block0 >>> 50) & 127);
				values[valuesOffset++] = ((block0 >>> 43) & 127);
				values[valuesOffset++] = ((block0 >>> 36) & 127);
				values[valuesOffset++] = ((block0 >>> 29) & 127);
				values[valuesOffset++] = ((block0 >>> 22) & 127);
				values[valuesOffset++] = ((block0 >>> 15) & 127);
				values[valuesOffset++] = ((block0 >>> 8) & 127);
				values[valuesOffset++] = ((block0 >>> 1) & 127);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 1) << 6) | (block1 >>> 58));
				values[valuesOffset++] = ((block1 >>> 51) & 127);
				values[valuesOffset++] = ((block1 >>> 44) & 127);
				values[valuesOffset++] = ((block1 >>> 37) & 127);
				values[valuesOffset++] = ((block1 >>> 30) & 127);
				values[valuesOffset++] = ((block1 >>> 23) & 127);
				values[valuesOffset++] = ((block1 >>> 16) & 127);
				values[valuesOffset++] = ((block1 >>> 9) & 127);
				values[valuesOffset++] = ((block1 >>> 2) & 127);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 3) << 5) | (block2 >>> 59));
				values[valuesOffset++] = ((block2 >>> 52) & 127);
				values[valuesOffset++] = ((block2 >>> 45) & 127);
				values[valuesOffset++] = ((block2 >>> 38) & 127);
				values[valuesOffset++] = ((block2 >>> 31) & 127);
				values[valuesOffset++] = ((block2 >>> 24) & 127);
				values[valuesOffset++] = ((block2 >>> 17) & 127);
				values[valuesOffset++] = ((block2 >>> 10) & 127);
				values[valuesOffset++] = ((block2 >>> 3) & 127);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 7) << 4) | (block3 >>> 60));
				values[valuesOffset++] = ((block3 >>> 53) & 127);
				values[valuesOffset++] = ((block3 >>> 46) & 127);
				values[valuesOffset++] = ((block3 >>> 39) & 127);
				values[valuesOffset++] = ((block3 >>> 32) & 127);
				values[valuesOffset++] = ((block3 >>> 25) & 127);
				values[valuesOffset++] = ((block3 >>> 18) & 127);
				values[valuesOffset++] = ((block3 >>> 11) & 127);
				values[valuesOffset++] = ((block3 >>> 4) & 127);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 15) << 3) | (block4 >>> 61));
				values[valuesOffset++] = ((block4 >>> 54) & 127);
				values[valuesOffset++] = ((block4 >>> 47) & 127);
				values[valuesOffset++] = ((block4 >>> 40) & 127);
				values[valuesOffset++] = ((block4 >>> 33) & 127);
				values[valuesOffset++] = ((block4 >>> 26) & 127);
				values[valuesOffset++] = ((block4 >>> 19) & 127);
				values[valuesOffset++] = ((block4 >>> 12) & 127);
				values[valuesOffset++] = ((block4 >>> 5) & 127);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 31) << 2) | (block5 >>> 62));
				values[valuesOffset++] = ((block5 >>> 55) & 127);
				values[valuesOffset++] = ((block5 >>> 48) & 127);
				values[valuesOffset++] = ((block5 >>> 41) & 127);
				values[valuesOffset++] = ((block5 >>> 34) & 127);
				values[valuesOffset++] = ((block5 >>> 27) & 127);
				values[valuesOffset++] = ((block5 >>> 20) & 127);
				values[valuesOffset++] = ((block5 >>> 13) & 127);
				values[valuesOffset++] = ((block5 >>> 6) & 127);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 63) << 1) | (block6 >>> 63));
				values[valuesOffset++] = ((block6 >>> 56) & 127);
				values[valuesOffset++] = ((block6 >>> 49) & 127);
				values[valuesOffset++] = ((block6 >>> 42) & 127);
				values[valuesOffset++] = ((block6 >>> 35) & 127);
				values[valuesOffset++] = ((block6 >>> 28) & 127);
				values[valuesOffset++] = ((block6 >>> 21) & 127);
				values[valuesOffset++] = ((block6 >>> 14) & 127);
				values[valuesOffset++] = ((block6 >>> 7) & 127);
				values[valuesOffset++] = (block6 & 127);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = byte0 >>> 1;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte0 & 1) << 6) | (byte1 >>> 2);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 3) << 5) | (byte2 >>> 3);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 7) << 4) | (byte3 >>> 4);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 15) << 3) | (byte4 >>> 5);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 31) << 2) | (byte5 >>> 6);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 63) << 1) | (byte6 >>> 7);
				values[valuesOffset++] = byte6 & 127;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 57;
				values[valuesOffset++] = (block0 >>> 50) & 127;
				values[valuesOffset++] = (block0 >>> 43) & 127;
				values[valuesOffset++] = (block0 >>> 36) & 127;
				values[valuesOffset++] = (block0 >>> 29) & 127;
				values[valuesOffset++] = (block0 >>> 22) & 127;
				values[valuesOffset++] = (block0 >>> 15) & 127;
				values[valuesOffset++] = (block0 >>> 8) & 127;
				values[valuesOffset++] = (block0 >>> 1) & 127;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 1) << 6) | (block1 >>> 58);
				values[valuesOffset++] = (block1 >>> 51) & 127;
				values[valuesOffset++] = (block1 >>> 44) & 127;
				values[valuesOffset++] = (block1 >>> 37) & 127;
				values[valuesOffset++] = (block1 >>> 30) & 127;
				values[valuesOffset++] = (block1 >>> 23) & 127;
				values[valuesOffset++] = (block1 >>> 16) & 127;
				values[valuesOffset++] = (block1 >>> 9) & 127;
				values[valuesOffset++] = (block1 >>> 2) & 127;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 3) << 5) | (block2 >>> 59);
				values[valuesOffset++] = (block2 >>> 52) & 127;
				values[valuesOffset++] = (block2 >>> 45) & 127;
				values[valuesOffset++] = (block2 >>> 38) & 127;
				values[valuesOffset++] = (block2 >>> 31) & 127;
				values[valuesOffset++] = (block2 >>> 24) & 127;
				values[valuesOffset++] = (block2 >>> 17) & 127;
				values[valuesOffset++] = (block2 >>> 10) & 127;
				values[valuesOffset++] = (block2 >>> 3) & 127;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 7) << 4) | (block3 >>> 60);
				values[valuesOffset++] = (block3 >>> 53) & 127;
				values[valuesOffset++] = (block3 >>> 46) & 127;
				values[valuesOffset++] = (block3 >>> 39) & 127;
				values[valuesOffset++] = (block3 >>> 32) & 127;
				values[valuesOffset++] = (block3 >>> 25) & 127;
				values[valuesOffset++] = (block3 >>> 18) & 127;
				values[valuesOffset++] = (block3 >>> 11) & 127;
				values[valuesOffset++] = (block3 >>> 4) & 127;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 15) << 3) | (block4 >>> 61);
				values[valuesOffset++] = (block4 >>> 54) & 127;
				values[valuesOffset++] = (block4 >>> 47) & 127;
				values[valuesOffset++] = (block4 >>> 40) & 127;
				values[valuesOffset++] = (block4 >>> 33) & 127;
				values[valuesOffset++] = (block4 >>> 26) & 127;
				values[valuesOffset++] = (block4 >>> 19) & 127;
				values[valuesOffset++] = (block4 >>> 12) & 127;
				values[valuesOffset++] = (block4 >>> 5) & 127;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 31) << 2) | (block5 >>> 62);
				values[valuesOffset++] = (block5 >>> 55) & 127;
				values[valuesOffset++] = (block5 >>> 48) & 127;
				values[valuesOffset++] = (block5 >>> 41) & 127;
				values[valuesOffset++] = (block5 >>> 34) & 127;
				values[valuesOffset++] = (block5 >>> 27) & 127;
				values[valuesOffset++] = (block5 >>> 20) & 127;
				values[valuesOffset++] = (block5 >>> 13) & 127;
				values[valuesOffset++] = (block5 >>> 6) & 127;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 63) << 1) | (block6 >>> 63);
				values[valuesOffset++] = (block6 >>> 56) & 127;
				values[valuesOffset++] = (block6 >>> 49) & 127;
				values[valuesOffset++] = (block6 >>> 42) & 127;
				values[valuesOffset++] = (block6 >>> 35) & 127;
				values[valuesOffset++] = (block6 >>> 28) & 127;
				values[valuesOffset++] = (block6 >>> 21) & 127;
				values[valuesOffset++] = (block6 >>> 14) & 127;
				values[valuesOffset++] = (block6 >>> 7) & 127;
				values[valuesOffset++] = block6 & 127;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = byte0 >>> 1;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte0 & 1) << 6) | (byte1 >>> 2);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 3) << 5) | (byte2 >>> 3);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 7) << 4) | (byte3 >>> 4);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 15) << 3) | (byte4 >>> 5);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 31) << 2) | (byte5 >>> 6);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 63) << 1) | (byte6 >>> 7);
				values[valuesOffset++] = byte6 & 127;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked7;