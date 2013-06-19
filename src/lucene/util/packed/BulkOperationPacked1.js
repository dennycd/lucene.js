var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked1 = defineClass({
	name: "BulkOperationPacked1",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 1);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = blocks[blocksOffset++];
				for (var shift = 63; shift >= 0; shift -= 1) {
					values[valuesOffset++] = ((block >>> shift) & 1);
				}
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var j = 0; j < iterations; ++j) {
				var block = blocks[blocksOffset++];
				values[valuesOffset++] = (block >>> 7) & 1;
				values[valuesOffset++] = (block >>> 6) & 1;
				values[valuesOffset++] = (block >>> 5) & 1;
				values[valuesOffset++] = (block >>> 4) & 1;
				values[valuesOffset++] = (block >>> 3) & 1;
				values[valuesOffset++] = (block >>> 2) & 1;
				values[valuesOffset++] = (block >>> 1) & 1;
				values[valuesOffset++] = block & 1;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = blocks[blocksOffset++];
				for (var shift = 63; shift >= 0; shift -= 1) {
					values[valuesOffset++] = (block >>> shift) & 1;
				}
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var j = 0; j < iterations; ++j) {
				var block = blocks[blocksOffset++];
				values[valuesOffset++] = (block >>> 7) & 1;
				values[valuesOffset++] = (block >>> 6) & 1;
				values[valuesOffset++] = (block >>> 5) & 1;
				values[valuesOffset++] = (block >>> 4) & 1;
				values[valuesOffset++] = (block >>> 3) & 1;
				values[valuesOffset++] = (block >>> 2) & 1;
				values[valuesOffset++] = (block >>> 1) & 1;
				values[valuesOffset++] = block & 1;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked1;