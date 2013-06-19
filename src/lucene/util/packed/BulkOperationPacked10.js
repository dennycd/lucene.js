var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked10 = defineClass({
	name: "BulkOperationPacked10",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 10);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 54);
				values[valuesOffset++] = ((block0 >>> 44) & 1023);
				values[valuesOffset++] = ((block0 >>> 34) & 1023);
				values[valuesOffset++] = ((block0 >>> 24) & 1023);
				values[valuesOffset++] = ((block0 >>> 14) & 1023);
				values[valuesOffset++] = ((block0 >>> 4) & 1023);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 15) << 6) | (block1 >>> 58));
				values[valuesOffset++] = ((block1 >>> 48) & 1023);
				values[valuesOffset++] = ((block1 >>> 38) & 1023);
				values[valuesOffset++] = ((block1 >>> 28) & 1023);
				values[valuesOffset++] = ((block1 >>> 18) & 1023);
				values[valuesOffset++] = ((block1 >>> 8) & 1023);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 255) << 2) | (block2 >>> 62));
				values[valuesOffset++] = ((block2 >>> 52) & 1023);
				values[valuesOffset++] = ((block2 >>> 42) & 1023);
				values[valuesOffset++] = ((block2 >>> 32) & 1023);
				values[valuesOffset++] = ((block2 >>> 22) & 1023);
				values[valuesOffset++] = ((block2 >>> 12) & 1023);
				values[valuesOffset++] = ((block2 >>> 2) & 1023);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 3) << 8) | (block3 >>> 56));
				values[valuesOffset++] = ((block3 >>> 46) & 1023);
				values[valuesOffset++] = ((block3 >>> 36) & 1023);
				values[valuesOffset++] = ((block3 >>> 26) & 1023);
				values[valuesOffset++] = ((block3 >>> 16) & 1023);
				values[valuesOffset++] = ((block3 >>> 6) & 1023);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 63) << 4) | (block4 >>> 60));
				values[valuesOffset++] = ((block4 >>> 50) & 1023);
				values[valuesOffset++] = ((block4 >>> 40) & 1023);
				values[valuesOffset++] = ((block4 >>> 30) & 1023);
				values[valuesOffset++] = ((block4 >>> 20) & 1023);
				values[valuesOffset++] = ((block4 >>> 10) & 1023);
				values[valuesOffset++] = (block4 & 1023);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 2) | (byte1 >>> 6);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 63) << 4) | (byte2 >>> 4);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 15) << 6) | (byte3 >>> 2);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 3) << 8) | byte4;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 54;
				values[valuesOffset++] = (block0 >>> 44) & 1023;
				values[valuesOffset++] = (block0 >>> 34) & 1023;
				values[valuesOffset++] = (block0 >>> 24) & 1023;
				values[valuesOffset++] = (block0 >>> 14) & 1023;
				values[valuesOffset++] = (block0 >>> 4) & 1023;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 15) << 6) | (block1 >>> 58);
				values[valuesOffset++] = (block1 >>> 48) & 1023;
				values[valuesOffset++] = (block1 >>> 38) & 1023;
				values[valuesOffset++] = (block1 >>> 28) & 1023;
				values[valuesOffset++] = (block1 >>> 18) & 1023;
				values[valuesOffset++] = (block1 >>> 8) & 1023;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 255) << 2) | (block2 >>> 62);
				values[valuesOffset++] = (block2 >>> 52) & 1023;
				values[valuesOffset++] = (block2 >>> 42) & 1023;
				values[valuesOffset++] = (block2 >>> 32) & 1023;
				values[valuesOffset++] = (block2 >>> 22) & 1023;
				values[valuesOffset++] = (block2 >>> 12) & 1023;
				values[valuesOffset++] = (block2 >>> 2) & 1023;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 3) << 8) | (block3 >>> 56);
				values[valuesOffset++] = (block3 >>> 46) & 1023;
				values[valuesOffset++] = (block3 >>> 36) & 1023;
				values[valuesOffset++] = (block3 >>> 26) & 1023;
				values[valuesOffset++] = (block3 >>> 16) & 1023;
				values[valuesOffset++] = (block3 >>> 6) & 1023;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 63) << 4) | (block4 >>> 60);
				values[valuesOffset++] = (block4 >>> 50) & 1023;
				values[valuesOffset++] = (block4 >>> 40) & 1023;
				values[valuesOffset++] = (block4 >>> 30) & 1023;
				values[valuesOffset++] = (block4 >>> 20) & 1023;
				values[valuesOffset++] = (block4 >>> 10) & 1023;
				values[valuesOffset++] = block4 & 1023;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 2) | (byte1 >>> 6);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 63) << 4) | (byte2 >>> 4);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 15) << 6) | (byte3 >>> 2);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 3) << 8) | byte4;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked10;