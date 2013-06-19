var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked24 = defineClass({
	name: "BulkOperationPacked24",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 24);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 40);
				values[valuesOffset++] = ((block0 >>> 16) & 16777215);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 65535) << 8) | (block1 >>> 56));
				values[valuesOffset++] = ((block1 >>> 32) & 16777215);
				values[valuesOffset++] = ((block1 >>> 8) & 16777215);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 255) << 16) | (block2 >>> 48));
				values[valuesOffset++] = ((block2 >>> 24) & 16777215);
				values[valuesOffset++] = (block2 & 16777215);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 16) | (byte1 << 8) | byte2;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 40;
				values[valuesOffset++] = (block0 >>> 16) & 16777215;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 65535) << 8) | (block1 >>> 56);
				values[valuesOffset++] = (block1 >>> 32) & 16777215;
				values[valuesOffset++] = (block1 >>> 8) & 16777215;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 255) << 16) | (block2 >>> 48);
				values[valuesOffset++] = (block2 >>> 24) & 16777215;
				values[valuesOffset++] = block2 & 16777215;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 16) | (byte1 << 8) | byte2;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked24;