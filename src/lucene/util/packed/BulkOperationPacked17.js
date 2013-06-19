var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked17 = defineClass({
	name: "BulkOperationPacked17",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 17);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 47);
				values[valuesOffset++] = ((block0 >>> 30) & 131071);
				values[valuesOffset++] = ((block0 >>> 13) & 131071);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 8191) << 4) | (block1 >>> 60));
				values[valuesOffset++] = ((block1 >>> 43) & 131071);
				values[valuesOffset++] = ((block1 >>> 26) & 131071);
				values[valuesOffset++] = ((block1 >>> 9) & 131071);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 511) << 8) | (block2 >>> 56));
				values[valuesOffset++] = ((block2 >>> 39) & 131071);
				values[valuesOffset++] = ((block2 >>> 22) & 131071);
				values[valuesOffset++] = ((block2 >>> 5) & 131071);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 31) << 12) | (block3 >>> 52));
				values[valuesOffset++] = ((block3 >>> 35) & 131071);
				values[valuesOffset++] = ((block3 >>> 18) & 131071);
				values[valuesOffset++] = ((block3 >>> 1) & 131071);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 1) << 16) | (block4 >>> 48));
				values[valuesOffset++] = ((block4 >>> 31) & 131071);
				values[valuesOffset++] = ((block4 >>> 14) & 131071);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 16383) << 3) | (block5 >>> 61));
				values[valuesOffset++] = ((block5 >>> 44) & 131071);
				values[valuesOffset++] = ((block5 >>> 27) & 131071);
				values[valuesOffset++] = ((block5 >>> 10) & 131071);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 1023) << 7) | (block6 >>> 57));
				values[valuesOffset++] = ((block6 >>> 40) & 131071);
				values[valuesOffset++] = ((block6 >>> 23) & 131071);
				values[valuesOffset++] = ((block6 >>> 6) & 131071);
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block6 & 63) << 11) | (block7 >>> 53));
				values[valuesOffset++] = ((block7 >>> 36) & 131071);
				values[valuesOffset++] = ((block7 >>> 19) & 131071);
				values[valuesOffset++] = ((block7 >>> 2) & 131071);
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block7 & 3) << 15) | (block8 >>> 49));
				values[valuesOffset++] = ((block8 >>> 32) & 131071);
				values[valuesOffset++] = ((block8 >>> 15) & 131071);
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block8 & 32767) << 2) | (block9 >>> 62));
				values[valuesOffset++] = ((block9 >>> 45) & 131071);
				values[valuesOffset++] = ((block9 >>> 28) & 131071);
				values[valuesOffset++] = ((block9 >>> 11) & 131071);
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block9 & 2047) << 6) | (block10 >>> 58));
				values[valuesOffset++] = ((block10 >>> 41) & 131071);
				values[valuesOffset++] = ((block10 >>> 24) & 131071);
				values[valuesOffset++] = ((block10 >>> 7) & 131071);
				var block11 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block10 & 127) << 10) | (block11 >>> 54));
				values[valuesOffset++] = ((block11 >>> 37) & 131071);
				values[valuesOffset++] = ((block11 >>> 20) & 131071);
				values[valuesOffset++] = ((block11 >>> 3) & 131071);
				var block12 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block11 & 7) << 14) | (block12 >>> 50));
				values[valuesOffset++] = ((block12 >>> 33) & 131071);
				values[valuesOffset++] = ((block12 >>> 16) & 131071);
				var block13 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block12 & 65535) << 1) | (block13 >>> 63));
				values[valuesOffset++] = ((block13 >>> 46) & 131071);
				values[valuesOffset++] = ((block13 >>> 29) & 131071);
				values[valuesOffset++] = ((block13 >>> 12) & 131071);
				var block14 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block13 & 4095) << 5) | (block14 >>> 59));
				values[valuesOffset++] = ((block14 >>> 42) & 131071);
				values[valuesOffset++] = ((block14 >>> 25) & 131071);
				values[valuesOffset++] = ((block14 >>> 8) & 131071);
				var block15 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block14 & 255) << 9) | (block15 >>> 55));
				values[valuesOffset++] = ((block15 >>> 38) & 131071);
				values[valuesOffset++] = ((block15 >>> 21) & 131071);
				values[valuesOffset++] = ((block15 >>> 4) & 131071);
				var block16 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block15 & 15) << 13) | (block16 >>> 51));
				values[valuesOffset++] = ((block16 >>> 34) & 131071);
				values[valuesOffset++] = ((block16 >>> 17) & 131071);
				values[valuesOffset++] = (block16 & 131071);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 9) | (byte1 << 1) | (byte2 >>> 7);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 127) << 10) | (byte3 << 2) | (byte4 >>> 6);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 63) << 11) | (byte5 << 3) | (byte6 >>> 5);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 31) << 12) | (byte7 << 4) | (byte8 >>> 4);
				var byte9 = blocks[blocksOffset++] & 0xFF;
				var byte10 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte8 & 15) << 13) | (byte9 << 5) | (byte10 >>> 3);
				var byte11 = blocks[blocksOffset++] & 0xFF;
				var byte12 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte10 & 7) << 14) | (byte11 << 6) | (byte12 >>> 2);
				var byte13 = blocks[blocksOffset++] & 0xFF;
				var byte14 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte12 & 3) << 15) | (byte13 << 7) | (byte14 >>> 1);
				var byte15 = blocks[blocksOffset++] & 0xFF;
				var byte16 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte14 & 1) << 16) | (byte15 << 8) | byte16;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 47;
				values[valuesOffset++] = (block0 >>> 30) & 131071;
				values[valuesOffset++] = (block0 >>> 13) & 131071;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 8191) << 4) | (block1 >>> 60);
				values[valuesOffset++] = (block1 >>> 43) & 131071;
				values[valuesOffset++] = (block1 >>> 26) & 131071;
				values[valuesOffset++] = (block1 >>> 9) & 131071;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 511) << 8) | (block2 >>> 56);
				values[valuesOffset++] = (block2 >>> 39) & 131071;
				values[valuesOffset++] = (block2 >>> 22) & 131071;
				values[valuesOffset++] = (block2 >>> 5) & 131071;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 31) << 12) | (block3 >>> 52);
				values[valuesOffset++] = (block3 >>> 35) & 131071;
				values[valuesOffset++] = (block3 >>> 18) & 131071;
				values[valuesOffset++] = (block3 >>> 1) & 131071;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 1) << 16) | (block4 >>> 48);
				values[valuesOffset++] = (block4 >>> 31) & 131071;
				values[valuesOffset++] = (block4 >>> 14) & 131071;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 16383) << 3) | (block5 >>> 61);
				values[valuesOffset++] = (block5 >>> 44) & 131071;
				values[valuesOffset++] = (block5 >>> 27) & 131071;
				values[valuesOffset++] = (block5 >>> 10) & 131071;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 1023) << 7) | (block6 >>> 57);
				values[valuesOffset++] = (block6 >>> 40) & 131071;
				values[valuesOffset++] = (block6 >>> 23) & 131071;
				values[valuesOffset++] = (block6 >>> 6) & 131071;
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block6 & 63) << 11) | (block7 >>> 53);
				values[valuesOffset++] = (block7 >>> 36) & 131071;
				values[valuesOffset++] = (block7 >>> 19) & 131071;
				values[valuesOffset++] = (block7 >>> 2) & 131071;
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block7 & 3) << 15) | (block8 >>> 49);
				values[valuesOffset++] = (block8 >>> 32) & 131071;
				values[valuesOffset++] = (block8 >>> 15) & 131071;
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block8 & 32767) << 2) | (block9 >>> 62);
				values[valuesOffset++] = (block9 >>> 45) & 131071;
				values[valuesOffset++] = (block9 >>> 28) & 131071;
				values[valuesOffset++] = (block9 >>> 11) & 131071;
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block9 & 2047) << 6) | (block10 >>> 58);
				values[valuesOffset++] = (block10 >>> 41) & 131071;
				values[valuesOffset++] = (block10 >>> 24) & 131071;
				values[valuesOffset++] = (block10 >>> 7) & 131071;
				var block11 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block10 & 127) << 10) | (block11 >>> 54);
				values[valuesOffset++] = (block11 >>> 37) & 131071;
				values[valuesOffset++] = (block11 >>> 20) & 131071;
				values[valuesOffset++] = (block11 >>> 3) & 131071;
				var block12 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block11 & 7) << 14) | (block12 >>> 50);
				values[valuesOffset++] = (block12 >>> 33) & 131071;
				values[valuesOffset++] = (block12 >>> 16) & 131071;
				var block13 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block12 & 65535) << 1) | (block13 >>> 63);
				values[valuesOffset++] = (block13 >>> 46) & 131071;
				values[valuesOffset++] = (block13 >>> 29) & 131071;
				values[valuesOffset++] = (block13 >>> 12) & 131071;
				var block14 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block13 & 4095) << 5) | (block14 >>> 59);
				values[valuesOffset++] = (block14 >>> 42) & 131071;
				values[valuesOffset++] = (block14 >>> 25) & 131071;
				values[valuesOffset++] = (block14 >>> 8) & 131071;
				var block15 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block14 & 255) << 9) | (block15 >>> 55);
				values[valuesOffset++] = (block15 >>> 38) & 131071;
				values[valuesOffset++] = (block15 >>> 21) & 131071;
				values[valuesOffset++] = (block15 >>> 4) & 131071;
				var block16 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block15 & 15) << 13) | (block16 >>> 51);
				values[valuesOffset++] = (block16 >>> 34) & 131071;
				values[valuesOffset++] = (block16 >>> 17) & 131071;
				values[valuesOffset++] = block16 & 131071;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 9) | (byte1 << 1) | (byte2 >>> 7);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 127) << 10) | (byte3 << 2) | (byte4 >>> 6);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 63) << 11) | (byte5 << 3) | (byte6 >>> 5);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 31) << 12) | (byte7 << 4) | (byte8 >>> 4);
				var byte9 = blocks[blocksOffset++] & 0xFF;
				var byte10 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte8 & 15) << 13) | (byte9 << 5) | (byte10 >>> 3);
				var byte11 = blocks[blocksOffset++] & 0xFF;
				var byte12 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte10 & 7) << 14) | (byte11 << 6) | (byte12 >>> 2);
				var byte13 = blocks[blocksOffset++] & 0xFF;
				var byte14 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte12 & 3) << 15) | (byte13 << 7) | (byte14 >>> 1);
				var byte15 = blocks[blocksOffset++] & 0xFF;
				var byte16 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte14 & 1) << 16) | (byte15 << 8) | byte16;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked17;