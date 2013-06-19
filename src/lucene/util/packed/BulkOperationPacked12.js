var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked12 = defineClass({
	name: "BulkOperationPacked12",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 12);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 52);
				values[valuesOffset++] = ((block0 >>> 40) & 4095);
				values[valuesOffset++] = ((block0 >>> 28) & 4095);
				values[valuesOffset++] = ((block0 >>> 16) & 4095);
				values[valuesOffset++] = ((block0 >>> 4) & 4095);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 15) << 8) | (block1 >>> 56));
				values[valuesOffset++] = ((block1 >>> 44) & 4095);
				values[valuesOffset++] = ((block1 >>> 32) & 4095);
				values[valuesOffset++] = ((block1 >>> 20) & 4095);
				values[valuesOffset++] = ((block1 >>> 8) & 4095);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 255) << 4) | (block2 >>> 60));
				values[valuesOffset++] = ((block2 >>> 48) & 4095);
				values[valuesOffset++] = ((block2 >>> 36) & 4095);
				values[valuesOffset++] = ((block2 >>> 24) & 4095);
				values[valuesOffset++] = ((block2 >>> 12) & 4095);
				values[valuesOffset++] = (block2 & 4095);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 4) | (byte1 >>> 4);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 15) << 8) | byte2;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 52;
				values[valuesOffset++] = (block0 >>> 40) & 4095;
				values[valuesOffset++] = (block0 >>> 28) & 4095;
				values[valuesOffset++] = (block0 >>> 16) & 4095;
				values[valuesOffset++] = (block0 >>> 4) & 4095;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 15) << 8) | (block1 >>> 56);
				values[valuesOffset++] = (block1 >>> 44) & 4095;
				values[valuesOffset++] = (block1 >>> 32) & 4095;
				values[valuesOffset++] = (block1 >>> 20) & 4095;
				values[valuesOffset++] = (block1 >>> 8) & 4095;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 255) << 4) | (block2 >>> 60);
				values[valuesOffset++] = (block2 >>> 48) & 4095;
				values[valuesOffset++] = (block2 >>> 36) & 4095;
				values[valuesOffset++] = (block2 >>> 24) & 4095;
				values[valuesOffset++] = (block2 >>> 12) & 4095;
				values[valuesOffset++] = block2 & 4095;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 4) | (byte1 >>> 4);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 15) << 8) | byte2;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked12;