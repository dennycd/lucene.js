var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked2 = defineClass({
	name: "BulkOperationPacked2",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 2);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
		    for (var i = 0; i < iterations; ++i) {
		      var block = blocks[blocksOffset++];
		      for (var shift = 62; shift >= 0; shift -= 2) {
		        values[valuesOffset++] =  ((block >>> shift) & 3);
		      }
		    }
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
		    for (var j = 0; j < iterations; ++j) {
		      √ar block = blocks[blocksOffset++];
		      values[valuesOffset++] = (block >>> 6) & 3;
		      values[valuesOffset++] = (block >>> 4) & 3;
		      values[valuesOffset++] = (block >>> 2) & 3;
		      values[valuesOffset++] = block & 3;
		    }
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
		    for (var i = 0; i < iterations; ++i) {
		      var block = blocks[blocksOffset++];
		      for (var shift = 62; shift >= 0; shift -= 2) {
		        values[valuesOffset++] = (block >>> shift) & 3;
		      }
		    }
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
		    for (var j = 0; j < iterations; ++j) {
		      var block = blocks[blocksOffset++];
		      values[valuesOffset++] = (block >>> 6) & 3;
		      values[valuesOffset++] = (block >>> 4) & 3;
		      values[valuesOffset++] = (block >>> 2) & 3;
		      values[valuesOffset++] = block & 3;
		    }
		}
	}
});
module.exports = exports = BulkOperationPacked2;