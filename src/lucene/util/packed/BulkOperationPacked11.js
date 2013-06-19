var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked11 = defineClass({
	name: "BulkOperationPacked11",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 11);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 53);
				values[valuesOffset++] = ((block0 >>> 42) & 2047);
				values[valuesOffset++] = ((block0 >>> 31) & 2047);
				values[valuesOffset++] = ((block0 >>> 20) & 2047);
				values[valuesOffset++] = ((block0 >>> 9) & 2047);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 511) << 2) | (block1 >>> 62));
				values[valuesOffset++] = ((block1 >>> 51) & 2047);
				values[valuesOffset++] = ((block1 >>> 40) & 2047);
				values[valuesOffset++] = ((block1 >>> 29) & 2047);
				values[valuesOffset++] = ((block1 >>> 18) & 2047);
				values[valuesOffset++] = ((block1 >>> 7) & 2047);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 127) << 4) | (block2 >>> 60));
				values[valuesOffset++] = ((block2 >>> 49) & 2047);
				values[valuesOffset++] = ((block2 >>> 38) & 2047);
				values[valuesOffset++] = ((block2 >>> 27) & 2047);
				values[valuesOffset++] = ((block2 >>> 16) & 2047);
				values[valuesOffset++] = ((block2 >>> 5) & 2047);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 31) << 6) | (block3 >>> 58));
				values[valuesOffset++] = ((block3 >>> 47) & 2047);
				values[valuesOffset++] = ((block3 >>> 36) & 2047);
				values[valuesOffset++] = ((block3 >>> 25) & 2047);
				values[valuesOffset++] = ((block3 >>> 14) & 2047);
				values[valuesOffset++] = ((block3 >>> 3) & 2047);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 7) << 8) | (block4 >>> 56));
				values[valuesOffset++] = ((block4 >>> 45) & 2047);
				values[valuesOffset++] = ((block4 >>> 34) & 2047);
				values[valuesOffset++] = ((block4 >>> 23) & 2047);
				values[valuesOffset++] = ((block4 >>> 12) & 2047);
				values[valuesOffset++] = ((block4 >>> 1) & 2047);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 1) << 10) | (block5 >>> 54));
				values[valuesOffset++] = ((block5 >>> 43) & 2047);
				values[valuesOffset++] = ((block5 >>> 32) & 2047);
				values[valuesOffset++] = ((block5 >>> 21) & 2047);
				values[valuesOffset++] = ((block5 >>> 10) & 2047);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 1023) << 1) | (block6 >>> 63));
				values[valuesOffset++] = ((block6 >>> 52) & 2047);
				values[valuesOffset++] = ((block6 >>> 41) & 2047);
				values[valuesOffset++] = ((block6 >>> 30) & 2047);
				values[valuesOffset++] = ((block6 >>> 19) & 2047);
				values[valuesOffset++] = ((block6 >>> 8) & 2047);
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block6 & 255) << 3) | (block7 >>> 61));
				values[valuesOffset++] = ((block7 >>> 50) & 2047);
				values[valuesOffset++] = ((block7 >>> 39) & 2047);
				values[valuesOffset++] = ((block7 >>> 28) & 2047);
				values[valuesOffset++] = ((block7 >>> 17) & 2047);
				values[valuesOffset++] = ((block7 >>> 6) & 2047);
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block7 & 63) << 5) | (block8 >>> 59));
				values[valuesOffset++] = ((block8 >>> 48) & 2047);
				values[valuesOffset++] = ((block8 >>> 37) & 2047);
				values[valuesOffset++] = ((block8 >>> 26) & 2047);
				values[valuesOffset++] = ((block8 >>> 15) & 2047);
				values[valuesOffset++] = ((block8 >>> 4) & 2047);
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block8 & 15) << 7) | (block9 >>> 57));
				values[valuesOffset++] = ((block9 >>> 46) & 2047);
				values[valuesOffset++] = ((block9 >>> 35) & 2047);
				values[valuesOffset++] = ((block9 >>> 24) & 2047);
				values[valuesOffset++] = ((block9 >>> 13) & 2047);
				values[valuesOffset++] = ((block9 >>> 2) & 2047);
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block9 & 3) << 9) | (block10 >>> 55));
				values[valuesOffset++] = ((block10 >>> 44) & 2047);
				values[valuesOffset++] = ((block10 >>> 33) & 2047);
				values[valuesOffset++] = ((block10 >>> 22) & 2047);
				values[valuesOffset++] = ((block10 >>> 11) & 2047);
				values[valuesOffset++] = (block10 & 2047);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 3) | (byte1 >>> 5);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 31) << 6) | (byte2 >>> 2);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 3) << 9) | (byte3 << 1) | (byte4 >>> 7);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 127) << 4) | (byte5 >>> 4);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 15) << 7) | (byte6 >>> 1);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 1) << 10) | (byte7 << 2) | (byte8 >>> 6);
				var byte9 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte8 & 63) << 5) | (byte9 >>> 3);
				var byte10 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte9 & 7) << 8) | byte10;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 53;
				values[valuesOffset++] = (block0 >>> 42) & 2047;
				values[valuesOffset++] = (block0 >>> 31) & 2047;
				values[valuesOffset++] = (block0 >>> 20) & 2047;
				values[valuesOffset++] = (block0 >>> 9) & 2047;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 511) << 2) | (block1 >>> 62);
				values[valuesOffset++] = (block1 >>> 51) & 2047;
				values[valuesOffset++] = (block1 >>> 40) & 2047;
				values[valuesOffset++] = (block1 >>> 29) & 2047;
				values[valuesOffset++] = (block1 >>> 18) & 2047;
				values[valuesOffset++] = (block1 >>> 7) & 2047;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 127) << 4) | (block2 >>> 60);
				values[valuesOffset++] = (block2 >>> 49) & 2047;
				values[valuesOffset++] = (block2 >>> 38) & 2047;
				values[valuesOffset++] = (block2 >>> 27) & 2047;
				values[valuesOffset++] = (block2 >>> 16) & 2047;
				values[valuesOffset++] = (block2 >>> 5) & 2047;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 31) << 6) | (block3 >>> 58);
				values[valuesOffset++] = (block3 >>> 47) & 2047;
				values[valuesOffset++] = (block3 >>> 36) & 2047;
				values[valuesOffset++] = (block3 >>> 25) & 2047;
				values[valuesOffset++] = (block3 >>> 14) & 2047;
				values[valuesOffset++] = (block3 >>> 3) & 2047;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 7) << 8) | (block4 >>> 56);
				values[valuesOffset++] = (block4 >>> 45) & 2047;
				values[valuesOffset++] = (block4 >>> 34) & 2047;
				values[valuesOffset++] = (block4 >>> 23) & 2047;
				values[valuesOffset++] = (block4 >>> 12) & 2047;
				values[valuesOffset++] = (block4 >>> 1) & 2047;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 1) << 10) | (block5 >>> 54);
				values[valuesOffset++] = (block5 >>> 43) & 2047;
				values[valuesOffset++] = (block5 >>> 32) & 2047;
				values[valuesOffset++] = (block5 >>> 21) & 2047;
				values[valuesOffset++] = (block5 >>> 10) & 2047;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 1023) << 1) | (block6 >>> 63);
				values[valuesOffset++] = (block6 >>> 52) & 2047;
				values[valuesOffset++] = (block6 >>> 41) & 2047;
				values[valuesOffset++] = (block6 >>> 30) & 2047;
				values[valuesOffset++] = (block6 >>> 19) & 2047;
				values[valuesOffset++] = (block6 >>> 8) & 2047;
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block6 & 255) << 3) | (block7 >>> 61);
				values[valuesOffset++] = (block7 >>> 50) & 2047;
				values[valuesOffset++] = (block7 >>> 39) & 2047;
				values[valuesOffset++] = (block7 >>> 28) & 2047;
				values[valuesOffset++] = (block7 >>> 17) & 2047;
				values[valuesOffset++] = (block7 >>> 6) & 2047;
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block7 & 63) << 5) | (block8 >>> 59);
				values[valuesOffset++] = (block8 >>> 48) & 2047;
				values[valuesOffset++] = (block8 >>> 37) & 2047;
				values[valuesOffset++] = (block8 >>> 26) & 2047;
				values[valuesOffset++] = (block8 >>> 15) & 2047;
				values[valuesOffset++] = (block8 >>> 4) & 2047;
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block8 & 15) << 7) | (block9 >>> 57);
				values[valuesOffset++] = (block9 >>> 46) & 2047;
				values[valuesOffset++] = (block9 >>> 35) & 2047;
				values[valuesOffset++] = (block9 >>> 24) & 2047;
				values[valuesOffset++] = (block9 >>> 13) & 2047;
				values[valuesOffset++] = (block9 >>> 2) & 2047;
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block9 & 3) << 9) | (block10 >>> 55);
				values[valuesOffset++] = (block10 >>> 44) & 2047;
				values[valuesOffset++] = (block10 >>> 33) & 2047;
				values[valuesOffset++] = (block10 >>> 22) & 2047;
				values[valuesOffset++] = (block10 >>> 11) & 2047;
				values[valuesOffset++] = block10 & 2047;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 3) | (byte1 >>> 5);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 31) << 6) | (byte2 >>> 2);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 3) << 9) | (byte3 << 1) | (byte4 >>> 7);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 127) << 4) | (byte5 >>> 4);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 15) << 7) | (byte6 >>> 1);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 1) << 10) | (byte7 << 2) | (byte8 >>> 6);
				var byte9 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte8 & 63) << 5) | (byte9 >>> 3);
				var byte10 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte9 & 7) << 8) | byte10;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked11;