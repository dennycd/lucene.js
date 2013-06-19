var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked8 = defineClass({
	name: "BulkOperationPacked8",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 8);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = blocks[blocksOffset++];
				for (var shift = 56; shift >= 0; shift -= 8) {
					values[valuesOffset++] = ((block >>> shift) & 255);
				}
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var j = 0; j < iterations; ++j) {
				values[valuesOffset++] = blocks[blocksOffset++] & 0xFF;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block = blocks[blocksOffset++];
				for (var shift = 56; shift >= 0; shift -= 8) {
					values[valuesOffset++] = (block >>> shift) & 255;
				}
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var j = 0; j < iterations; ++j) {
				values[valuesOffset++] = blocks[blocksOffset++] & 0xFF;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked8;