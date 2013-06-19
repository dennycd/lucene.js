var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked22 = defineClass({
	name: "BulkOperationPacked22",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 22);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 42);
				values[valuesOffset++] = ((block0 >>> 20) & 4194303);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 1048575) << 2) | (block1 >>> 62));
				values[valuesOffset++] = ((block1 >>> 40) & 4194303);
				values[valuesOffset++] = ((block1 >>> 18) & 4194303);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 262143) << 4) | (block2 >>> 60));
				values[valuesOffset++] = ((block2 >>> 38) & 4194303);
				values[valuesOffset++] = ((block2 >>> 16) & 4194303);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 65535) << 6) | (block3 >>> 58));
				values[valuesOffset++] = ((block3 >>> 36) & 4194303);
				values[valuesOffset++] = ((block3 >>> 14) & 4194303);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 16383) << 8) | (block4 >>> 56));
				values[valuesOffset++] = ((block4 >>> 34) & 4194303);
				values[valuesOffset++] = ((block4 >>> 12) & 4194303);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 4095) << 10) | (block5 >>> 54));
				values[valuesOffset++] = ((block5 >>> 32) & 4194303);
				values[valuesOffset++] = ((block5 >>> 10) & 4194303);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 1023) << 12) | (block6 >>> 52));
				values[valuesOffset++] = ((block6 >>> 30) & 4194303);
				values[valuesOffset++] = ((block6 >>> 8) & 4194303);
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block6 & 255) << 14) | (block7 >>> 50));
				values[valuesOffset++] = ((block7 >>> 28) & 4194303);
				values[valuesOffset++] = ((block7 >>> 6) & 4194303);
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block7 & 63) << 16) | (block8 >>> 48));
				values[valuesOffset++] = ((block8 >>> 26) & 4194303);
				values[valuesOffset++] = ((block8 >>> 4) & 4194303);
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block8 & 15) << 18) | (block9 >>> 46));
				values[valuesOffset++] = ((block9 >>> 24) & 4194303);
				values[valuesOffset++] = ((block9 >>> 2) & 4194303);
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block9 & 3) << 20) | (block10 >>> 44));
				values[valuesOffset++] = ((block10 >>> 22) & 4194303);
				values[valuesOffset++] = (block10 & 4194303);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 14) | (byte1 << 6) | (byte2 >>> 2);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 3) << 20) | (byte3 << 12) | (byte4 << 4) | (byte5 >>> 4);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 15) << 18) | (byte6 << 10) | (byte7 << 2) | (byte8 >>> 6);
				var byte9 = blocks[blocksOffset++] & 0xFF;
				var byte10 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte8 & 63) << 16) | (byte9 << 8) | byte10;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 42;
				values[valuesOffset++] = (block0 >>> 20) & 4194303;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 1048575) << 2) | (block1 >>> 62);
				values[valuesOffset++] = (block1 >>> 40) & 4194303;
				values[valuesOffset++] = (block1 >>> 18) & 4194303;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 262143) << 4) | (block2 >>> 60);
				values[valuesOffset++] = (block2 >>> 38) & 4194303;
				values[valuesOffset++] = (block2 >>> 16) & 4194303;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 65535) << 6) | (block3 >>> 58);
				values[valuesOffset++] = (block3 >>> 36) & 4194303;
				values[valuesOffset++] = (block3 >>> 14) & 4194303;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 16383) << 8) | (block4 >>> 56);
				values[valuesOffset++] = (block4 >>> 34) & 4194303;
				values[valuesOffset++] = (block4 >>> 12) & 4194303;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 4095) << 10) | (block5 >>> 54);
				values[valuesOffset++] = (block5 >>> 32) & 4194303;
				values[valuesOffset++] = (block5 >>> 10) & 4194303;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 1023) << 12) | (block6 >>> 52);
				values[valuesOffset++] = (block6 >>> 30) & 4194303;
				values[valuesOffset++] = (block6 >>> 8) & 4194303;
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block6 & 255) << 14) | (block7 >>> 50);
				values[valuesOffset++] = (block7 >>> 28) & 4194303;
				values[valuesOffset++] = (block7 >>> 6) & 4194303;
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block7 & 63) << 16) | (block8 >>> 48);
				values[valuesOffset++] = (block8 >>> 26) & 4194303;
				values[valuesOffset++] = (block8 >>> 4) & 4194303;
				var block9 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block8 & 15) << 18) | (block9 >>> 46);
				values[valuesOffset++] = (block9 >>> 24) & 4194303;
				values[valuesOffset++] = (block9 >>> 2) & 4194303;
				var block10 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block9 & 3) << 20) | (block10 >>> 44);
				values[valuesOffset++] = (block10 >>> 22) & 4194303;
				values[valuesOffset++] = block10 & 4194303;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 14) | (byte1 << 6) | (byte2 >>> 2);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				var byte5 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 3) << 20) | (byte3 << 12) | (byte4 << 4) | (byte5 >>> 4);
				var byte6 = blocks[blocksOffset++] & 0xFF;
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte5 & 15) << 18) | (byte6 << 10) | (byte7 << 2) | (byte8 >>> 6);
				var byte9 = blocks[blocksOffset++] & 0xFF;
				var byte10 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte8 & 63) << 16) | (byte9 << 8) | byte10;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked22;