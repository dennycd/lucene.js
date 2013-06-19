var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked20 = defineClass({
	name: "BulkOperationPacked20",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 20);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 44);
				values[valuesOffset++] = ((block0 >>> 24) & 1048575);
				values[valuesOffset++] = ((block0 >>> 4) & 1048575);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 15) << 16) | (block1 >>> 48));
				values[valuesOffset++] = ((block1 >>> 28) & 1048575);
				values[valuesOffset++] = ((block1 >>> 8) & 1048575);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 255) << 12) | (block2 >>> 52));
				values[valuesOffset++] = ((block2 >>> 32) & 1048575);
				values[valuesOffset++] = ((block2 >>> 12) & 1048575);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 4095) << 8) | (block3 >>> 56));
				values[valuesOffset++] = ((block3 >>> 36) & 1048575);
				values[valuesOffset++] = ((block3 >>> 16) & 1048575);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 65535) << 4) | (block4 >>> 60));
				values[valuesOffset++] = ((block4 >>> 40) & 1048575);
				values[valuesOffset++] = ((block4 >>> 20) & 1048575);
				values[valuesOffset++] = (block4 & 1048575);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 12) | (byte1 << 4) | (byte2 >>> 4);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 15) << 16) | (byte3 << 8) | byte4;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 44;
				values[valuesOffset++] = (block0 >>> 24) & 1048575;
				values[valuesOffset++] = (block0 >>> 4) & 1048575;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 15) << 16) | (block1 >>> 48);
				values[valuesOffset++] = (block1 >>> 28) & 1048575;
				values[valuesOffset++] = (block1 >>> 8) & 1048575;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 255) << 12) | (block2 >>> 52);
				values[valuesOffset++] = (block2 >>> 32) & 1048575;
				values[valuesOffset++] = (block2 >>> 12) & 1048575;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 4095) << 8) | (block3 >>> 56);
				values[valuesOffset++] = (block3 >>> 36) & 1048575;
				values[valuesOffset++] = (block3 >>> 16) & 1048575;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 65535) << 4) | (block4 >>> 60);
				values[valuesOffset++] = (block4 >>> 40) & 1048575;
				values[valuesOffset++] = (block4 >>> 20) & 1048575;
				values[valuesOffset++] = block4 & 1048575;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 12) | (byte1 << 4) | (byte2 >>> 4);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 15) << 16) | (byte3 << 8) | byte4;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked20;