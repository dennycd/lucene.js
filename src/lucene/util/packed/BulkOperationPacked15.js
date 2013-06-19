var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked15 = defineClass({
	name: "BulkOperationPacked15",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 15);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 49);
				values[valuesOffset++] = ((block0 >>> 34) & 32767);
				values[valuesOffset++] = ((block0 >>> 19) & 32767);
				values[valuesOffset++] = ((block0 >>> 4) & 32767);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 15L) << 11) | (block1 >>> 53));
				values[valuesOffset++] = ((block1 >>> 38) & 32767);
				values[valuesOffset++] = ((block1 >>> 23) & 32767);
				values[valuesOffset++] = ((block1 >>> 8) & 32767);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 255) << 7) | (block2 >>> 57));
				values[valuesOffset++] = ((block2 >>> 42) & 32767);
				values[valuesOffset++] = ((block2 >>> 27) & 32767);
				values[valuesOffset++] = ((block2 >>> 12) & 32767);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 4095) << 3) | (block3 >>> 61));
				values[valuesOffset++] = ((block3 >>> 46) & 32767);
				values[valuesOffset++] = ((block3 >>> 31) & 32767);
				values[valuesOffset++] = ((block3 >>> 16) & 32767);
				values[valuesOffset++] = ((block3 >>> 1) & 32767);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 1) << 14) | (block4 >>> 50));
				values[valuesOffset++] = ((block4 >>> 35) & 32767);
				values[valuesOffset++] = ((block4 >>> 20) & 32767);
				values[valuesOffset++] = ((block4 >>> 5) & 32767);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 31) << 10) | (block5 >>> 54));
				values[valuesOffset++] = ((block5 >>> 39) & 32767);
				values[valuesOffset++] = ((block5 >>> 24) & 32767);
				values[valuesOffset++] = ((block5 >>> 9) & 32767);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 511) << 6) | (block6 >>> 58));
				values[valuesOffset++] = ((block6 >>> 43) & 32767);
				values[valuesOffset++] = ((block6 >>> 28) & 32767);
				values[valuesOffset++] = ((block6 >>> 13) & 32767);
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block6 & 8191) << 2) | (block7 >>> 62));
				values[valuesOffset++] = ((block7 >>> 47) & 32767);
				values[valuesOffset++] = ((block7 >>> 32) & 32767);
				values[valuesOffset++] = ((block7 >>> 17) & 32767);
				values[valuesOffset++] = ((block7 >>> 2) & 32767);
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block7 & 3) << 13) | (block8 >>> 51));
				values[valuesOffset++] = ((block8 >>> 36) & 32767);
				values[valuesOffset++] = ((block8 >>> 21) & 32767);
				values[valuesOffset++] = ((block8 >>> 6) & 32767);
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block8 & 63) << 9) | (block9 >>> 55));
				values[valuesOffset++] = ((block9 >>> 40) & 32767);
				values[valuesOffset++] = ((block9 >>> 25) & 32767);
				values[valuesOffset++] = ((block9 >>> 10) & 32767);
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block9 & 1023) << 5) | (block10 >>> 59));
				values[valuesOffset++] = ((block10 >>> 44) & 32767);
				values[valuesOffset++] = ((block10 >>> 29) & 32767);
				values[valuesOffset++] = ((block10 >>> 14) & 32767);
				var block11 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block10 & 16383) << 1) | (block11 >>> 63));
				values[valuesOffset++] = ((block11 >>> 48) & 32767);
				values[valuesOffset++] = ((block11 >>> 33) & 32767);
				values[valuesOffset++] = ((block11 >>> 18) & 32767);
				values[valuesOffset++] = ((block11 >>> 3) & 32767);
				var block12 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block11 & 7) << 12) | (block12 >>> 52));
				values[valuesOffset++] = ((block12 >>> 37) & 32767);
				values[valuesOffset++] = ((block12 >>> 22) & 32767);
				values[valuesOffset++] = ((block12 >>> 7) & 32767);
				var block13 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block12 & 127) << 8) | (block13 >>> 56));
				values[valuesOffset++] = ((block13 >>> 41) & 32767);
				values[valuesOffset++] = ((block13 >>> 26) & 32767);
				values[valuesOffset++] = ((block13 >>> 11) & 32767);
				var block14 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block13 & 2047) << 4) | (block14 >>> 60));
				values[valuesOffset++] = ((block14 >>> 45) & 32767);
				values[valuesOffset++] = ((block14 >>> 30) & 32767);
				values[valuesOffset++] = ((block14 >>> 15) & 32767);
				values[valuesOffset++] = (block14 & 32767);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 7) | (byte1 >>> 1);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 1) << 14) | (byte2 << 6) | (byte3 >>> 2);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 3) << 13) | (byte4 << 5) | (byte5 >>> 3);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				var byte7 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 7) << 12) | (byte6 << 4) | (byte7 >>> 4);
				var byte8 = blocks[blocksOffset++] & 0xFF;
				var byte9 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte7 & 15) << 11) | (byte8 << 3) | (byte9 >>> 5);
				var byte10 = blocks[blocksOffset++] & 0xFF;
				var byte11 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte9 & 31) << 10) | (byte10 << 2) | (byte11 >>> 6);
				var byte12 = blocks[blocksOffset++] & 0xFF;
				var byte13 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte11 & 63) << 9) | (byte12 << 1) | (byte13 >>> 7);
				var byte14 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte13 & 127) << 8) | byte14;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 49;
				values[valuesOffset++] = (block0 >>> 34) & 32767;
				values[valuesOffset++] = (block0 >>> 19) & 32767;
				values[valuesOffset++] = (block0 >>> 4) & 32767;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 15) << 11) | (block1 >>> 53);
				values[valuesOffset++] = (block1 >>> 38) & 32767;
				values[valuesOffset++] = (block1 >>> 23) & 32767;
				values[valuesOffset++] = (block1 >>> 8) & 32767;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 255) << 7) | (block2 >>> 57);
				values[valuesOffset++] = (block2 >>> 42) & 32767;
				values[valuesOffset++] = (block2 >>> 27) & 32767;
				values[valuesOffset++] = (block2 >>> 12) & 32767;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 4095) << 3) | (block3 >>> 61);
				values[valuesOffset++] = (block3 >>> 46) & 32767;
				values[valuesOffset++] = (block3 >>> 31) & 32767;
				values[valuesOffset++] = (block3 >>> 16) & 32767;
				values[valuesOffset++] = (block3 >>> 1) & 32767;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 1) << 14) | (block4 >>> 50);
				values[valuesOffset++] = (block4 >>> 35) & 32767;
				values[valuesOffset++] = (block4 >>> 20) & 32767;
				values[valuesOffset++] = (block4 >>> 5) & 32767;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 31) << 10) | (block5 >>> 54);
				values[valuesOffset++] = (block5 >>> 39) & 32767;
				values[valuesOffset++] = (block5 >>> 24) & 32767;
				values[valuesOffset++] = (block5 >>> 9) & 32767;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 511) << 6) | (block6 >>> 58);
				values[valuesOffset++] = (block6 >>> 43) & 32767;
				values[valuesOffset++] = (block6 >>> 28) & 32767;
				values[valuesOffset++] = (block6 >>> 13) & 32767;
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block6 & 8191) << 2) | (block7 >>> 62);
				values[valuesOffset++] = (block7 >>> 47) & 32767;
				values[valuesOffset++] = (block7 >>> 32) & 32767;
				values[valuesOffset++] = (block7 >>> 17) & 32767;
				values[valuesOffset++] = (block7 >>> 2) & 32767;
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block7 & 3) << 13) | (block8 >>> 51);
				values[valuesOffset++] = (block8 >>> 36) & 32767;
				values[valuesOffset++] = (block8 >>> 21) & 32767;
				values[valuesOffset++] = (block8 >>> 6) & 32767;
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block8 & 63) << 9) | (block9 >>> 55);
				values[valuesOffset++] = (block9 >>> 40) & 32767;
				values[valuesOffset++] = (block9 >>> 25) & 32767;
				values[valuesOffset++] = (block9 >>> 10) & 32767;
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block9 & 1023) << 5) | (block10 >>> 59);
				values[valuesOffset++] = (block10 >>> 44) & 32767;
				values[valuesOffset++] = (block10 >>> 29) & 32767;
				values[valuesOffset++] = (block10 >>> 14) & 32767;
				var block11 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block10 & 16383) << 1) | (block11 >>> 63);
				values[valuesOffset++] = (block11 >>> 48) & 32767;
				values[valuesOffset++] = (block11 >>> 33) & 32767;
				values[valuesOffset++] = (block11 >>> 18) & 32767;
				values[valuesOffset++] = (block11 >>> 3) & 32767;
				var block12 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block11 & 7) << 12) | (block12 >>> 52);
				values[valuesOffset++] = (block12 >>> 37) & 32767;
				values[valuesOffset++] = (block12 >>> 22) & 32767;
				values[valuesOffset++] = (block12 >>> 7) & 32767;
				var block13 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block12 & 127) << 8) | (block13 >>> 56);
				values[valuesOffset++] = (block13 >>> 41) & 32767;
				values[valuesOffset++] = (block13 >>> 26) & 32767;
				values[valuesOffset++] = (block13 >>> 11) & 32767;
				var block14 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block13 & 2047) << 4) | (block14 >>> 60);
				values[valuesOffset++] = (block14 >>> 45) & 32767;
				values[valuesOffset++] = (block14 >>> 30) & 32767;
				values[valuesOffset++] = (block14 >>> 15) & 32767;
				values[valuesOffset++] = block14 & 32767;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 7) | (byte1 >>> 1);
				var byte2 = blocks[blocksOffset++] & 0xFF;
				var byte3 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte1 & 1) << 14) | (byte2 << 6) | (byte3 >>> 2);
				var byte4 = blocks[blocksOffset++] & 0xFF;
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte3 & 3) << 13) | (byte4 << 5) | (byte5 >>> 3);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				var byte7 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 7) << 12) | (byte6 << 4) | (byte7 >>> 4);
				var byte8 = blocks[blocksOffset++] & 0xFF;
				var byte9 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte7 & 15) << 11) | (byte8 << 3) | (byte9 >>> 5);
				var byte10 = blocks[blocksOffset++] & 0xFF;
				var byte11 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte9 & 31) << 10) | (byte10 << 2) | (byte11 >>> 6);
				var byte12 = blocks[blocksOffset++] & 0xFF;
				var byte13 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte11 & 63) << 9) | (byte12 << 1) | (byte13 >>> 7);
				var byte14 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte13 & 127) << 8) | byte14;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked15;