var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked6 = defineClass({
	name: "BulkOperationPacked6",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 6);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 58);
				values[valuesOffset++] = ((block0 >>> 52) & 63);
				values[valuesOffset++] = ((block0 >>> 46) & 63);
				values[valuesOffset++] = ((block0 >>> 40) & 63);
				values[valuesOffset++] = ((block0 >>> 34) & 63);
				values[valuesOffset++] = ((block0 >>> 28) & 63);
				values[valuesOffset++] = ((block0 >>> 22) & 63);
				values[valuesOffset++] = ((block0 >>> 16) & 63);
				values[valuesOffset++] = ((block0 >>> 10) & 63);
				values[valuesOffset++] = ((block0 >>> 4) & 63);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 15) << 2) | (block1 >>> 62));
				values[valuesOffset++] = ((block1 >>> 56) & 63);
				values[valuesOffset++] = ((block1 >>> 50) & 63);
				values[valuesOffset++] = ((block1 >>> 44) & 63);
				values[valuesOffset++] = ((block1 >>> 38) & 63);
				values[valuesOffset++] = ((block1 >>> 32) & 63);
				values[valuesOffset++] = ((block1 >>> 26) & 63);
				values[valuesOffset++] = ((block1 >>> 20) & 63);
				values[valuesOffset++] = ((block1 >>> 14) & 63);
				values[valuesOffset++] = ((block1 >>> 8) & 63);
				values[valuesOffset++] = ((block1 >>> 2) & 63);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 3) << 4) | (block2 >>> 60));
				values[valuesOffset++] = ((block2 >>> 54) & 63);
				values[valuesOffset++] = ((block2 >>> 48) & 63);
				values[valuesOffset++] = ((block2 >>> 42) & 63);
				values[valuesOffset++] = ((block2 >>> 36) & 63);
				values[valuesOffset++] = ((block2 >>> 30) & 63);
				values[valuesOffset++] = ((block2 >>> 24) & 63);
				values[valuesOffset++] = ((block2 >>> 18) & 63);
				values[valuesOffset++] = ((block2 >>> 12) & 63);
				values[valuesOffset++] = ((block2 >>> 6) & 63);
				values[valuesOffset++] = (block2 & 63);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = byte0 >>> 2;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte0 & 3) << 4) | (byte1 >>> 4);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 15) << 2) | (byte2 >>> 6);
				values[valuesOffset++] = byte2 & 63;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 58;
				values[valuesOffset++] = (block0 >>> 52) & 63;
				values[valuesOffset++] = (block0 >>> 46) & 63;
				values[valuesOffset++] = (block0 >>> 40) & 63;
				values[valuesOffset++] = (block0 >>> 34) & 63;
				values[valuesOffset++] = (block0 >>> 28) & 63;
				values[valuesOffset++] = (block0 >>> 22) & 63;
				values[valuesOffset++] = (block0 >>> 16) & 63;
				values[valuesOffset++] = (block0 >>> 10) & 63;
				values[valuesOffset++] = (block0 >>> 4) & 63;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 15) << 2) | (block1 >>> 62);
				values[valuesOffset++] = (block1 >>> 56) & 63;
				values[valuesOffset++] = (block1 >>> 50) & 63;
				values[valuesOffset++] = (block1 >>> 44) & 63;
				values[valuesOffset++] = (block1 >>> 38) & 63;
				values[valuesOffset++] = (block1 >>> 32) & 63;
				values[valuesOffset++] = (block1 >>> 26) & 63;
				values[valuesOffset++] = (block1 >>> 20) & 63;
				values[valuesOffset++] = (block1 >>> 14) & 63;
				values[valuesOffset++] = (block1 >>> 8) & 63;
				values[valuesOffset++] = (block1 >>> 2) & 63;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 3) << 4) | (block2 >>> 60);
				values[valuesOffset++] = (block2 >>> 54) & 63;
				values[valuesOffset++] = (block2 >>> 48) & 63;
				values[valuesOffset++] = (block2 >>> 42) & 63;
				values[valuesOffset++] = (block2 >>> 36) & 63;
				values[valuesOffset++] = (block2 >>> 30) & 63;
				values[valuesOffset++] = (block2 >>> 24) & 63;
				values[valuesOffset++] = (block2 >>> 18) & 63;
				values[valuesOffset++] = (block2 >>> 12) & 63;
				values[valuesOffset++] = (block2 >>> 6) & 63;
				values[valuesOffset++] = block2 & 63;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = byte0 >>> 2;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte0 & 3) << 4) | (byte1 >>> 4);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 15) << 2) | (byte2 >>> 6);
				values[valuesOffset++] = byte2 & 63;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked6;