var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked9 = defineClass({
	name: "BulkOperationPacked9",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 9);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 55);
				values[valuesOffset++] = ((block0 >>> 46) & 511);
				values[valuesOffset++] = ((block0 >>> 37) & 511);
				values[valuesOffset++] = ((block0 >>> 28) & 511);
				values[valuesOffset++] = ((block0 >>> 19) & 511);
				values[valuesOffset++] = ((block0 >>> 10) & 511);
				values[valuesOffset++] = ((block0 >>> 1) & 511);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 1) << 8) | (block1 >>> 56));
				values[valuesOffset++] = ((block1 >>> 47) & 511);
				values[valuesOffset++] = ((block1 >>> 38) & 511);
				values[valuesOffset++] = ((block1 >>> 29) & 511);
				values[valuesOffset++] = ((block1 >>> 20) & 511);
				values[valuesOffset++] = ((block1 >>> 11) & 511);
				values[valuesOffset++] = ((block1 >>> 2) & 511);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 3) << 7) | (block2 >>> 57));
				values[valuesOffset++] = ((block2 >>> 48) & 511);
				values[valuesOffset++] = ((block2 >>> 39) & 511);
				values[valuesOffset++] = ((block2 >>> 30) & 511);
				values[valuesOffset++] = ((block2 >>> 21) & 511);
				values[valuesOffset++] = ((block2 >>> 12) & 511);
				values[valuesOffset++] = ((block2 >>> 3) & 511);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 7) << 6) | (block3 >>> 58));
				values[valuesOffset++] = ((block3 >>> 49) & 511);
				values[valuesOffset++] = ((block3 >>> 40) & 511);
				values[valuesOffset++] = ((block3 >>> 31) & 511);
				values[valuesOffset++] = ((block3 >>> 22) & 511);
				values[valuesOffset++] = ((block3 >>> 13) & 511);
				values[valuesOffset++] = ((block3 >>> 4) & 511);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 15) << 5) | (block4 >>> 59));
				values[valuesOffset++] = ((block4 >>> 50) & 511);
				values[valuesOffset++] = ((block4 >>> 41) & 511);
				values[valuesOffset++] = ((block4 >>> 32) & 511);
				values[valuesOffset++] = ((block4 >>> 23) & 511);
				values[valuesOffset++] = ((block4 >>> 14) & 511);
				values[valuesOffset++] = ((block4 >>> 5) & 511);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 31) << 4) | (block5 >>> 60));
				values[valuesOffset++] = ((block5 >>> 51) & 511);
				values[valuesOffset++] = ((block5 >>> 42) & 511);
				values[valuesOffset++] = ((block5 >>> 33) & 511);
				values[valuesOffset++] = ((block5 >>> 24) & 511);
				values[valuesOffset++] = ((block5 >>> 15) & 511);
				values[valuesOffset++] = ((block5 >>> 6) & 511);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 63) << 3) | (block6 >>> 61));
				values[valuesOffset++] = ((block6 >>> 52) & 511);
				values[valuesOffset++] = ((block6 >>> 43) & 511);
				values[valuesOffset++] = ((block6 >>> 34) & 511);
				values[valuesOffset++] = ((block6 >>> 25) & 511);
				values[valuesOffset++] = ((block6 >>> 16) & 511);
				values[valuesOffset++] = ((block6 >>> 7) & 511);
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block6 & 127) << 2) | (block7 >>> 62));
				values[valuesOffset++] = ((block7 >>> 53) & 511);
				values[valuesOffset++] = ((block7 >>> 44) & 511);
				values[valuesOffset++] = ((block7 >>> 35) & 511);
				values[valuesOffset++] = ((block7 >>> 26) & 511);
				values[valuesOffset++] = ((block7 >>> 17) & 511);
				values[valuesOffset++] = ((block7 >>> 8) & 511);
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block7 & 255) << 1) | (block8 >>> 63));
				values[valuesOffset++] = ((block8 >>> 54) & 511);
				values[valuesOffset++] = ((block8 >>> 45) & 511);
				values[valuesOffset++] = ((block8 >>> 36) & 511);
				values[valuesOffset++] = ((block8 >>> 27) & 511);
				values[valuesOffset++] = ((block8 >>> 18) & 511);
				values[valuesOffset++] = ((block8 >>> 9) & 511);
				values[valuesOffset++] = (block8 & 511);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 1) | (byte1 >>> 7);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 127) << 2) | (byte2 >>> 6);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 63) << 3) | (byte3 >>> 5);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 31) << 4) | (byte4 >>> 4);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 15) << 5) | (byte5 >>> 3);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 7) << 6) | (byte6 >>> 2);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 3) << 7) | (byte7 >>> 1);
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte7 & 1) << 8) | byte8;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 55;
				values[valuesOffset++] = (block0 >>> 46) & 511;
				values[valuesOffset++] = (block0 >>> 37) & 511;
				values[valuesOffset++] = (block0 >>> 28) & 511;
				values[valuesOffset++] = (block0 >>> 19) & 511;
				values[valuesOffset++] = (block0 >>> 10) & 511;
				values[valuesOffset++] = (block0 >>> 1) & 511;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 1) << 8) | (block1 >>> 56);
				values[valuesOffset++] = (block1 >>> 47) & 511;
				values[valuesOffset++] = (block1 >>> 38) & 511;
				values[valuesOffset++] = (block1 >>> 29) & 511;
				values[valuesOffset++] = (block1 >>> 20) & 511;
				values[valuesOffset++] = (block1 >>> 11) & 511;
				values[valuesOffset++] = (block1 >>> 2) & 511;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 3) << 7) | (block2 >>> 57);
				values[valuesOffset++] = (block2 >>> 48) & 511;
				values[valuesOffset++] = (block2 >>> 39) & 511;
				values[valuesOffset++] = (block2 >>> 30) & 511;
				values[valuesOffset++] = (block2 >>> 21) & 511;
				values[valuesOffset++] = (block2 >>> 12) & 511;
				values[valuesOffset++] = (block2 >>> 3) & 511;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 7) << 6) | (block3 >>> 58);
				values[valuesOffset++] = (block3 >>> 49) & 511;
				values[valuesOffset++] = (block3 >>> 40) & 511;
				values[valuesOffset++] = (block3 >>> 31) & 511;
				values[valuesOffset++] = (block3 >>> 22) & 511;
				values[valuesOffset++] = (block3 >>> 13) & 511;
				values[valuesOffset++] = (block3 >>> 4) & 511;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 15) << 5) | (block4 >>> 59);
				values[valuesOffset++] = (block4 >>> 50) & 511;
				values[valuesOffset++] = (block4 >>> 41) & 511;
				values[valuesOffset++] = (block4 >>> 32) & 511;
				values[valuesOffset++] = (block4 >>> 23) & 511;
				values[valuesOffset++] = (block4 >>> 14) & 511;
				values[valuesOffset++] = (block4 >>> 5) & 511;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 31) << 4) | (block5 >>> 60);
				values[valuesOffset++] = (block5 >>> 51) & 511;
				values[valuesOffset++] = (block5 >>> 42) & 511;
				values[valuesOffset++] = (block5 >>> 33) & 511;
				values[valuesOffset++] = (block5 >>> 24) & 511;
				values[valuesOffset++] = (block5 >>> 15) & 511;
				values[valuesOffset++] = (block5 >>> 6) & 511;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 63) << 3) | (block6 >>> 61);
				values[valuesOffset++] = (block6 >>> 52) & 511;
				values[valuesOffset++] = (block6 >>> 43) & 511;
				values[valuesOffset++] = (block6 >>> 34) & 511;
				values[valuesOffset++] = (block6 >>> 25) & 511;
				values[valuesOffset++] = (block6 >>> 16) & 511;
				values[valuesOffset++] = (block6 >>> 7) & 511;
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block6 & 127) << 2) | (block7 >>> 62);
				values[valuesOffset++] = (block7 >>> 53) & 511;
				values[valuesOffset++] = (block7 >>> 44) & 511;
				values[valuesOffset++] = (block7 >>> 35) & 511;
				values[valuesOffset++] = (block7 >>> 26) & 511;
				values[valuesOffset++] = (block7 >>> 17) & 511;
				values[valuesOffset++] = (block7 >>> 8) & 511;
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block7 & 255) << 1) | (block8 >>> 63);
				values[valuesOffset++] = (block8 >>> 54) & 511;
				values[valuesOffset++] = (block8 >>> 45) & 511;
				values[valuesOffset++] = (block8 >>> 36) & 511;
				values[valuesOffset++] = (block8 >>> 27) & 511;
				values[valuesOffset++] = (block8 >>> 18) & 511;
				values[valuesOffset++] = (block8 >>> 9) & 511;
				values[valuesOffset++] = block8 & 511;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 1) | (byte1 >>> 7);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 127) << 2) | (byte2 >>> 6);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 63) << 3) | (byte3 >>> 5);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 31) << 4) | (byte4 >>> 4);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 15) << 5) | (byte5 >>> 3);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 7) << 6) | (byte6 >>> 2);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 3) << 7) | (byte7 >>> 1);
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte7 & 1) << 8) | byte8;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked9;