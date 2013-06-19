var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked13 = defineClass({
	name: "BulkOperationPacked13",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 13);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 51);
				values[valuesOffset++] = ((block0 >>> 38) & 8191);
				values[valuesOffset++] = ((block0 >>> 25) & 8191);
				values[valuesOffset++] = ((block0 >>> 12) & 8191);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 4095) << 1) | (block1 >>> 63));
				values[valuesOffset++] = ((block1 >>> 50) & 8191);
				values[valuesOffset++] = ((block1 >>> 37) & 8191);
				values[valuesOffset++] = ((block1 >>> 24) & 8191);
				values[valuesOffset++] = ((block1 >>> 11) & 8191);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 2047) << 2) | (block2 >>> 62));
				values[valuesOffset++] = ((block2 >>> 49) & 8191);
				values[valuesOffset++] = ((block2 >>> 36) & 8191);
				values[valuesOffset++] = ((block2 >>> 23) & 8191);
				values[valuesOffset++] = ((block2 >>> 10) & 8191);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 1023) << 3) | (block3 >>> 61));
				values[valuesOffset++] = ((block3 >>> 48) & 8191);
				values[valuesOffset++] = ((block3 >>> 35) & 8191);
				values[valuesOffset++] = ((block3 >>> 22) & 8191);
				values[valuesOffset++] = ((block3 >>> 9) & 8191);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 511) << 4) | (block4 >>> 60));
				values[valuesOffset++] = ((block4 >>> 47) & 8191);
				values[valuesOffset++] = ((block4 >>> 34) & 8191);
				values[valuesOffset++] = ((block4 >>> 21) & 8191);
				values[valuesOffset++] = ((block4 >>> 8) & 8191);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 255) << 5) | (block5 >>> 59));
				values[valuesOffset++] = ((block5 >>> 46) & 8191);
				values[valuesOffset++] = ((block5 >>> 33) & 8191);
				values[valuesOffset++] = ((block5 >>> 20) & 8191);
				values[valuesOffset++] = ((block5 >>> 7) & 8191);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 127) << 6) | (block6 >>> 58));
				values[valuesOffset++] = ((block6 >>> 45) & 8191);
				values[valuesOffset++] = ((block6 >>> 32) & 8191);
				values[valuesOffset++] = ((block6 >>> 19) & 8191);
				values[valuesOffset++] = ((block6 >>> 6) & 8191);
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block6 & 63) << 7) | (block7 >>> 57));
				values[valuesOffset++] = ((block7 >>> 44) & 8191);
				values[valuesOffset++] = ((block7 >>> 31) & 8191);
				values[valuesOffset++] = ((block7 >>> 18) & 8191);
				values[valuesOffset++] = ((block7 >>> 5) & 8191);
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block7 & 31) << 8) | (block8 >>> 56));
				values[valuesOffset++] = ((block8 >>> 43) & 8191);
				values[valuesOffset++] = ((block8 >>> 30) & 8191);
				values[valuesOffset++] = ((block8 >>> 17) & 8191);
				values[valuesOffset++] = ((block8 >>> 4) & 8191);
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block8 & 15) << 9) | (block9 >>> 55));
				values[valuesOffset++] = ((block9 >>> 42) & 8191);
				values[valuesOffset++] = ((block9 >>> 29) & 8191);
				values[valuesOffset++] = ((block9 >>> 16) & 8191);
				values[valuesOffset++] = ((block9 >>> 3) & 8191);
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block9 & 7) << 10) | (block10 >>> 54));
				values[valuesOffset++] = ((block10 >>> 41) & 8191);
				values[valuesOffset++] = ((block10 >>> 28) & 8191);
				values[valuesOffset++] = ((block10 >>> 15) & 8191);
				values[valuesOffset++] = ((block10 >>> 2) & 8191);
				var block11 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block10 & 3) << 11) | (block11 >>> 53));
				values[valuesOffset++] = ((block11 >>> 40) & 8191);
				values[valuesOffset++] = ((block11 >>> 27) & 8191);
				values[valuesOffset++] = ((block11 >>> 14) & 8191);
				values[valuesOffset++] = ((block11 >>> 1) & 8191);
				var block12 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block11 & 1) << 12) | (block12 >>> 52));
				values[valuesOffset++] = ((block12 >>> 39) & 8191);
				values[valuesOffset++] = ((block12 >>> 26) & 8191);
				values[valuesOffset++] = ((block12 >>> 13) & 8191);
				values[valuesOffset++] = (block12 & 8191);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 5) | (byte1 >>> 3);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 7) << 10) | (byte2 << 2) | (byte3 >>> 6);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 63) << 7) | (byte4 >>> 1);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 1) << 12) | (byte5 << 4) | (byte6 >>> 4);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 15) << 9) | (byte7 << 1) | (byte8 >>> 7);
				var byte9 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte8 & 127) << 6) | (byte9 >>> 2);
				var byte10 = blocks[blocksOffset++] & 0xFF;
				var byte11 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte9 & 3) << 11) | (byte10 << 3) | (byte11 >>> 5);
				var byte12 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte11 & 31) << 8) | byte12;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 51;
				values[valuesOffset++] = (block0 >>> 38) & 8191;
				values[valuesOffset++] = (block0 >>> 25) & 8191;
				values[valuesOffset++] = (block0 >>> 12) & 8191;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 4095) << 1) | (block1 >>> 63);
				values[valuesOffset++] = (block1 >>> 50) & 8191;
				values[valuesOffset++] = (block1 >>> 37) & 8191;
				values[valuesOffset++] = (block1 >>> 24) & 8191;
				values[valuesOffset++] = (block1 >>> 11) & 8191;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 2047) << 2) | (block2 >>> 62);
				values[valuesOffset++] = (block2 >>> 49) & 8191;
				values[valuesOffset++] = (block2 >>> 36) & 8191;
				values[valuesOffset++] = (block2 >>> 23) & 8191;
				values[valuesOffset++] = (block2 >>> 10) & 8191;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 1023) << 3) | (block3 >>> 61);
				values[valuesOffset++] = (block3 >>> 48) & 8191;
				values[valuesOffset++] = (block3 >>> 35) & 8191;
				values[valuesOffset++] = (block3 >>> 22) & 8191;
				values[valuesOffset++] = (block3 >>> 9) & 8191;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 511) << 4) | (block4 >>> 60);
				values[valuesOffset++] = (block4 >>> 47) & 8191;
				values[valuesOffset++] = (block4 >>> 34) & 8191;
				values[valuesOffset++] = (block4 >>> 21) & 8191;
				values[valuesOffset++] = (block4 >>> 8) & 8191;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 255) << 5) | (block5 >>> 59);
				values[valuesOffset++] = (block5 >>> 46) & 8191;
				values[valuesOffset++] = (block5 >>> 33) & 8191;
				values[valuesOffset++] = (block5 >>> 20) & 8191;
				values[valuesOffset++] = (block5 >>> 7) & 8191;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 127) << 6) | (block6 >>> 58);
				values[valuesOffset++] = (block6 >>> 45) & 8191;
				values[valuesOffset++] = (block6 >>> 32) & 8191;
				values[valuesOffset++] = (block6 >>> 19) & 8191;
				values[valuesOffset++] = (block6 >>> 6) & 8191;
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block6 & 63) << 7) | (block7 >>> 57);
				values[valuesOffset++] = (block7 >>> 44) & 8191;
				values[valuesOffset++] = (block7 >>> 31) & 8191;
				values[valuesOffset++] = (block7 >>> 18) & 8191;
				values[valuesOffset++] = (block7 >>> 5) & 8191;
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block7 & 31) << 8) | (block8 >>> 56);
				values[valuesOffset++] = (block8 >>> 43) & 8191;
				values[valuesOffset++] = (block8 >>> 30) & 8191;
				values[valuesOffset++] = (block8 >>> 17) & 8191;
				values[valuesOffset++] = (block8 >>> 4) & 8191;
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block8 & 15) << 9) | (block9 >>> 55);
				values[valuesOffset++] = (block9 >>> 42) & 8191;
				values[valuesOffset++] = (block9 >>> 29) & 8191;
				values[valuesOffset++] = (block9 >>> 16) & 8191;
				values[valuesOffset++] = (block9 >>> 3) & 8191;
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block9 & 7) << 10) | (block10 >>> 54);
				values[valuesOffset++] = (block10 >>> 41) & 8191;
				values[valuesOffset++] = (block10 >>> 28) & 8191;
				values[valuesOffset++] = (block10 >>> 15) & 8191;
				values[valuesOffset++] = (block10 >>> 2) & 8191;
				var block11 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block10 & 3) << 11) | (block11 >>> 53);
				values[valuesOffset++] = (block11 >>> 40) & 8191;
				values[valuesOffset++] = (block11 >>> 27) & 8191;
				values[valuesOffset++] = (block11 >>> 14) & 8191;
				values[valuesOffset++] = (block11 >>> 1) & 8191;
				var block12 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block11 & 1) << 12) | (block12 >>> 52);
				values[valuesOffset++] = (block12 >>> 39) & 8191;
				values[valuesOffset++] = (block12 >>> 26) & 8191;
				values[valuesOffset++] = (block12 >>> 13) & 8191;
				values[valuesOffset++] = block12 & 8191;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 5) | (byte1 >>> 3);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 7) << 10) | (byte2 << 2) | (byte3 >>> 6);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 63) << 7) | (byte4 >>> 1);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 1) << 12) | (byte5 << 4) | (byte6 >>> 4);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 15) << 9) | (byte7 << 1) | (byte8 >>> 7);
				var byte9 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte8 & 127) << 6) | (byte9 >>> 2);
				var byte10 = blocks[blocksOffset++] & 0xFF;
				var byte11 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte9 & 3) << 11) | (byte10 << 3) | (byte11 >>> 5);
				var byte12 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte11 & 31) << 8) | byte12;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked13;