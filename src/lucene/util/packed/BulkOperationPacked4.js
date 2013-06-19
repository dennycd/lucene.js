var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked4 = defineClass({
	name: "BulkOperationPacked4",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 4);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = blocks[blocksOffset++];
				for (var shift = 60; shift >= 0; shift -= 4) {
					values[valuesOffset++] = ((block >>> shift) & 15);
				}
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var j = 0; j < iterations; ++j) {
				var block = blocks[blocksOffset++];
				values[valuesOffset++] = (block >>> 4) & 15;
				values[valuesOffset++] = block & 15;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = blocks[blocksOffset++];
				for (var shift = 60; shift >= 0; shift -= 4) {
					values[valuesOffset++] = (block >>> shift) & 15;
				}
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var j = 0; j < iterations; ++j) {
				var block = blocks[blocksOffset++];
				values[valuesOffset++] = (block >>> 4) & 15;
				values[valuesOffset++] = block & 15;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked4;