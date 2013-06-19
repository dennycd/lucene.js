var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked14 = defineClass({
	name: "BulkOperationPacked14",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 14);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 50);
				values[valuesOffset++] = ((block0 >>> 36) & 16383);
				values[valuesOffset++] = ((block0 >>> 22) & 16383);
				values[valuesOffset++] = ((block0 >>> 8) & 16383);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 255) << 6) | (block1 >>> 58));
				values[valuesOffset++] = ((block1 >>> 44) & 16383);
				values[valuesOffset++] = ((block1 >>> 30) & 16383);
				values[valuesOffset++] = ((block1 >>> 16) & 16383);
				values[valuesOffset++] = ((block1 >>> 2) & 16383);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 3) << 12) | (block2 >>> 52));
				values[valuesOffset++] = ((block2 >>> 38) & 16383);
				values[valuesOffset++] = ((block2 >>> 24) & 16383);
				values[valuesOffset++] = ((block2 >>> 10) & 16383);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 1023) << 4) | (block3 >>> 60));
				values[valuesOffset++] = ((block3 >>> 46) & 16383);
				values[valuesOffset++] = ((block3 >>> 32) & 16383);
				values[valuesOffset++] = ((block3 >>> 18) & 16383);
				values[valuesOffset++] = ((block3 >>> 4) & 16383);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 15) << 10) | (block4 >>> 54));
				values[valuesOffset++] = ((block4 >>> 40) & 16383);
				values[valuesOffset++] = ((block4 >>> 26) & 16383);
				values[valuesOffset++] = ((block4 >>> 12) & 16383);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 4095) << 2) | (block5 >>> 62));
				values[valuesOffset++] = ((block5 >>> 48) & 16383);
				values[valuesOffset++] = ((block5 >>> 34) & 16383);
				values[valuesOffset++] = ((block5 >>> 20) & 16383);
				values[valuesOffset++] = ((block5 >>> 6) & 16383);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 63) << 8) | (block6 >>> 56));
				values[valuesOffset++] = ((block6 >>> 42) & 16383);
				values[valuesOffset++] = ((block6 >>> 28) & 16383);
				values[valuesOffset++] = ((block6 >>> 14) & 16383);
				values[valuesOffset++] = (block6 & 16383);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 6) | (byte1 >>> 2);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 3) << 12) | (byte2 << 4) | (byte3 >>> 4);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 15) << 10) | (byte4 << 2) | (byte5 >>> 6);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 63) << 8) | byte6;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 50;
				values[valuesOffset++] = (block0 >>> 36) & 16383;
				values[valuesOffset++] = (block0 >>> 22) & 16383;
				values[valuesOffset++] = (block0 >>> 8) & 16383;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 255) << 6) | (block1 >>> 58);
				values[valuesOffset++] = (block1 >>> 44) & 16383;
				values[valuesOffset++] = (block1 >>> 30) & 16383;
				values[valuesOffset++] = (block1 >>> 16) & 16383;
				values[valuesOffset++] = (block1 >>> 2) & 16383;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 3) << 12) | (block2 >>> 52);
				values[valuesOffset++] = (block2 >>> 38) & 16383;
				values[valuesOffset++] = (block2 >>> 24) & 16383;
				values[valuesOffset++] = (block2 >>> 10) & 16383;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 1023) << 4) | (block3 >>> 60);
				values[valuesOffset++] = (block3 >>> 46) & 16383;
				values[valuesOffset++] = (block3 >>> 32) & 16383;
				values[valuesOffset++] = (block3 >>> 18) & 16383;
				values[valuesOffset++] = (block3 >>> 4) & 16383;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 15) << 10) | (block4 >>> 54);
				values[valuesOffset++] = (block4 >>> 40) & 16383;
				values[valuesOffset++] = (block4 >>> 26) & 16383;
				values[valuesOffset++] = (block4 >>> 12) & 16383;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 4095) << 2) | (block5 >>> 62);
				values[valuesOffset++] = (block5 >>> 48) & 16383;
				values[valuesOffset++] = (block5 >>> 34) & 16383;
				values[valuesOffset++] = (block5 >>> 20) & 16383;
				values[valuesOffset++] = (block5 >>> 6) & 16383;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 63) << 8) | (block6 >>> 56);
				values[valuesOffset++] = (block6 >>> 42) & 16383;
				values[valuesOffset++] = (block6 >>> 28) & 16383;
				values[valuesOffset++] = (block6 >>> 14) & 16383;
				values[valuesOffset++] = block6 & 16383;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 6) | (byte1 >>> 2);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 3) << 12) | (byte2 << 4) | (byte3 >>> 4);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 15) << 10) | (byte4 << 2) | (byte5 >>> 6);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 63) << 8) | byte6;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked14;