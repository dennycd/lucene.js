var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var BulkOperation = require('./BulkOperation.js');
var BulkOperationPacked = require('./BulkOperationPacked.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperationPacked18 = defineClass({
	name: "BulkOperationPacked18",
	extend: BulkOperationPacked,
	construct: function() {
		BulkOperationPacked.call(this, 18);
	},
	methods: {
		decodeWithLongBlockIntVal: function( /* long[ ]*/ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = (block0 >>> 46);
				values[valuesOffset++] = ((block0 >>> 28) & 262143);
				values[valuesOffset++] = ((block0 >>> 10) & 262143);
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block0 & 1023) << 8) | (block1 >>> 56));
				values[valuesOffset++] = ((block1 >>> 38) & 262143);
				values[valuesOffset++] = ((block1 >>> 20) & 262143);
				values[valuesOffset++] = ((block1 >>> 2) & 262143);
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block1 & 3) << 16) | (block2 >>> 48));
				values[valuesOffset++] = ((block2 >>> 30) & 262143);
				values[valuesOffset++] = ((block2 >>> 12) & 262143);
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block2 & 4095) << 6) | (block3 >>> 58));
				values[valuesOffset++] = ((block3 >>> 40) & 262143);
				values[valuesOffset++] = ((block3 >>> 22) & 262143);
				values[valuesOffset++] = ((block3 >>> 4) & 262143);
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block3 & 15) << 14) | (block4 >>> 50));
				values[valuesOffset++] = ((block4 >>> 32) & 262143);
				values[valuesOffset++] = ((block4 >>> 14) & 262143);
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block4 & 16383) << 4) | (block5 >>> 60));
				values[valuesOffset++] = ((block5 >>> 42) & 262143);
				values[valuesOffset++] = ((block5 >>> 24) & 262143);
				values[valuesOffset++] = ((block5 >>> 6) & 262143);
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block5 & 63) << 12) | (block6 >>> 52));
				values[valuesOffset++] = ((block6 >>> 34) & 262143);
				values[valuesOffset++] = ((block6 >>> 16) & 262143);
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block6 & 65535) << 2) | (block7 >>> 62));
				values[valuesOffset++] = ((block7 >>> 44) & 262143);
				values[valuesOffset++] = ((block7 >>> 26) & 262143);
				values[valuesOffset++] = ((block7 >>> 8) & 262143);
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = (((block7 & 255) << 10) | (block8 >>> 54));
				values[valuesOffset++] = ((block8 >>> 36) & 262143);
				values[valuesOffset++] = ((block8 >>> 18) & 262143);
				values[valuesOffset++] = (block8 & 262143);
			}
		},
		decodeWithByteBlockIntVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* int[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 10) | (byte1 << 2) | (byte2 >>> 6);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 63) << 12) | (byte3 << 4) | (byte4 >>> 4);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 15) << 14) | (byte5 << 6) | (byte6 >>> 2);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 3) << 16) | (byte7 << 8) | byte8;
			}
		}
		decodeWithLongBlockLongVal: function( /* long[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var block0 = blocks[blocksOffset++];
				values[valuesOffset++] = block0 >>> 46;
				values[valuesOffset++] = (block0 >>> 28) & 262143;
				values[valuesOffset++] = (block0 >>> 10) & 262143;
				var block1 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block0 & 1023) << 8) | (block1 >>> 56);
				values[valuesOffset++] = (block1 >>> 38) & 262143;
				values[valuesOffset++] = (block1 >>> 20) & 262143;
				values[valuesOffset++] = (block1 >>> 2) & 262143;
				var block2 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block1 & 3) << 16) | (block2 >>> 48);
				values[valuesOffset++] = (block2 >>> 30) & 262143;
				values[valuesOffset++] = (block2 >>> 12) & 262143;
				var block3 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block2 & 4095) << 6) | (block3 >>> 58);
				values[valuesOffset++] = (block3 >>> 40) & 262143;
				values[valuesOffset++] = (block3 >>> 22) & 262143;
				values[valuesOffset++] = (block3 >>> 4) & 262143;
				var block4 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block3 & 15) << 14) | (block4 >>> 50);
				values[valuesOffset++] = (block4 >>> 32) & 262143;
				values[valuesOffset++] = (block4 >>> 14) & 262143;
				var block5 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block4 & 16383) << 4) | (block5 >>> 60);
				values[valuesOffset++] = (block5 >>> 42) & 262143;
				values[valuesOffset++] = (block5 >>> 24) & 262143;
				values[valuesOffset++] = (block5 >>> 6) & 262143;
				var block6 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block5 & 63) << 12) | (block6 >>> 52);
				values[valuesOffset++] = (block6 >>> 34) & 262143;
				values[valuesOffset++] = (block6 >>> 16) & 262143;
				var block7 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block6 & 65535) << 2) | (block7 >>> 62);
				values[valuesOffset++] = (block7 >>> 44) & 262143;
				values[valuesOffset++] = (block7 >>> 26) & 262143;
				values[valuesOffset++] = (block7 >>> 8) & 262143;
				var block8 = blocks[blocksOffset++];
				values[valuesOffset++] = ((block7 & 255) << 10) | (block8 >>> 54);
				values[valuesOffset++] = (block8 >>> 36) & 262143;
				values[valuesOffset++] = (block8 >>> 18) & 262143;
				values[valuesOffset++] = block8 & 262143;
			}
		},
		decodeWithByteBlockLongVal: function( /* byte[] */ blocks, /* int */ blocksOffset, /* long[] */ values, /* int */ valuesOffset, /* int */ iterations) {
			for (var i = 0; i < iterations; ++i) {
				var byte0 = blocks[blocksOffset++] & 0xFF;
				var byte1 = blocks[blocksOffset++] & 0xFF;
				var byte2 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = (byte0 << 10) | (byte1 << 2) | (byte2 >>> 6);
				var byte3 = blocks[blocksOffset++] & 0xFF;
				var byte4 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte2 & 63) << 12) | (byte3 << 4) | (byte4 >>> 4);
				var byte5 = blocks[blocksOffset++] & 0xFF;
				var byte6 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte4 & 15) << 14) | (byte5 << 6) | (byte6 >>> 2);
				var byte7 = blocks[blocksOffset++] & 0xFF;
				var byte8 = blocks[blocksOffset++] & 0xFF;
				values[valuesOffset++] = ((byte6 & 3) << 16) | (byte7 << 8) | byte8;
			}
		}
	}
});
module.exports = exports = BulkOperationPacked18;