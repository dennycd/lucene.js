/**
 * File: Packed8ThreeBlocks.js
 * Revision: 4301321048
 * Created by Denny C. Dai on 2013-04-12
 **/
var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var PackedInts = require('./PackedInts.js');
var ArrayIndexOutOfBoundsException = require('library/java/lang/ArrayIndexOutOfBoundsException.js');
var Arrays = require('library/java/util/Arrays.js');
var RamUsageEstimator = require('library/lucene/util/RamUsageEstimator.js');
/**
 * Packs integers into 3 bytes (24 bits per value).
 * @lucene.internal
 */
var Packed8ThreeBlocks = defineClass({
	name: "Packed8ThreeBlocks",
	extend: PackedInts.MutableImpl,
	statics: {
		MAX_SIZE = Math.floor(Number.MAX_VALUE / 3)
	},
	variables: {
		blocks: null //new Buffer(0), //byte[]
	},
	construct: function() {
		var c1 = function( /* int */ valueCount) {
				PackedInts.MutableImpl.call(this, valueCount, 24);
				if (valueCount > Packed8ThreeBlocks.MAX_SIZE) {
					throw new ArrayIndexOutOfBoundsException("MAX_SIZE exceeded");
				}
				this.blocks = new Buffer(valueCount * 3); // new byte[valueCount * 3];
			};
		var c2 = function( /* int */ packedIntsVersion, /* DataInput */ _in, /* int */ valueCount) {
				c1.call(this, valueCount);
				_in.readBytes(this.blocks, 0, 3 * valueCount);
				// because packed ints have not always been byte-aligned
				var remaining = Math.floor((PackedInts.Format.PACKED.byteCount(packedIntsVersion, valueCount, 24) - 3 * valueCount * 1));
				for (var i = 0; i < remaining; ++i) {
					_in.readByte();
				}
			};
		if (arguments.length == 1) c1.call(this, arguments[0]);
		else if (arguments.length == 3) c2.apply(this, arguments);
	},
	methods: {
		//@Override
		//@return long
		get: function( /* int */ index) {
			var o = index * 3;
			return (this.blocks[o] & 0xFF) << 16 | (this.blocks[o + 1] & 0xFF) << 8 | (this.blocks[o + 2] & 0xFF);
		},
		//@Override
		//@return int
		get: function( /* int */ index, /* long[] */ arr, /* int */ off, /* int */ len) {
			assert(len > 0, "len must be > 0 (got " + len + ")");
			assert(index >= 0 && index < this.valueCount);
			assert(off + len <= arr.length);
			var gets = Math.min(this.valueCount - index, len); //int
			for (var i = index * 3, end = (index + gets) * 3; i < end; i += 3) {
				arr[off++] = (this.blocks[i] & 0xFF) << 16 | (this.blocks[i + 1] & 0xFF) << 8 | (this.blocks[i + 2] & 0xFF);
			}
			return gets;
		},
		//@Override
		set: function( /* int */ index, /* long */ value) {
			var o = index * 3;
			this.blocks[o] = (value >>> 16);
			this.blocks[o + 1] = (value >>> 8);
			this.blocks[o + 2] = value;
		},
		//@Override
		//@return int
		set: function( /* int */ index, /* long[] */ arr, /* int */ off, /* int */ len) {
			assert(len > 0, "len must be > 0 (got " + len + ")");
			assert(index >= 0 && index < this.valueCount);
			assert(off + len <= arr.length);
			var sets = Math.min(this.valueCount - index, len);
			for (var i = off, o = index * 3, end = off + sets; i < end; ++i) {
				var value = arr[i];
				this.blocks[o++] = (value >>> 16);
				this.blocks[o++] = (value >>> 8);
				this.blocks[o++] = value;
			}
			return sets;
		},
		//@Override
		fill: function( /* int */ fromIndex, /* int */ toIndex, /* long */ val) {
			var block1 = (val >>> 16);
			var block2 = (val >>> 8);
			var block3 = val;
			for (var i = fromIndex * 3, end = toIndex * 3; i < end; i += 3) {
				this.blocks[i] = block1;
				this.blocks[i + 1] = block2;
				this.blocks[i + 2] = block3;
			}
		},
		//@Override
		clear: function() {
			Arrays.fill(this.blocks, 0);
		},
		// @Override
		//@return long
		ramBytesUsed: function() {
			/*
			return RamUsageEstimator.alignObjectSize(
			RamUsageEstimator.NUM_BYTES_OBJECT_HEADER + 2 * RamUsageEstimator.NUM_BYTES_INT // valueCount,bitsPerValue
			+ RamUsageEstimator.NUM_BYTES_OBJECT_REF) // blocks ref
			+ RamUsageEstimator.sizeOf(blocks);
			*/
			assert("Packed8ThreeBlocks::ramBytesUsed");
		},
		//@Override
		toString: function() {
			return this.getClass().getSimpleName() + "(bitsPerValue=" + this.bitsPerValue + ", size=" + this.size() + ", elements.length=" + this.blocks.length + ")";
		}
	}
});
module.exports = exports = Packed8ThreeBlocks;