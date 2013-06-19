var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Closeable = require('library/lucene/util/Closeable.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var Arrays = require('library/java/util/Arrays.js');
var BLOCK_SIZE = require('./Lucene41PostingsFormat.js').BLOCK_SIZE;
var PackedInts = require('/library/lucene/util/packed/PackedInts.js');

/*
import org.apache.lucene.store.DataInput;
import org.apache.lucene.store.DataOutput;
import org.apache.lucene.store.IndexInput;
import org.apache.lucene.store.IndexOutput;
import org.apache.lucene.util.packed.PackedInts.Decoder;
import org.apache.lucene.util.packed.PackedInts.FormatAndBits;
import org.apache.lucene.util.packed.PackedInts;
*/
/**
 * Encode all values in normal area with fixed bit width,
 * which is determined by the max value in this block.
 */
var ForUtil = defineClass({
	name: "ForUtil",
	statics: {
		/**
		 * Special number of bits per value used whenever all values to encode are equal.
		 */
		ALL_VALUES_EQUAL: 0,
		/**
		 * Upper limit of the number of bytes that might be required to stored
		 * <code>BLOCK_SIZE</code> encoded values.
		 */
		MAX_ENCODED_SIZE: BLOCK_SIZE * 4,
		/**
		 * Upper limit of the number of values that might be decoded in a single call to
		 * {@link #readBlock(IndexInput, byte[], int[])}. Although values after
		 * <code>BLOCK_SIZE</code> are garbage, it is necessary to allocate value buffers
		 * whose size is >= MAX_DATA_SIZE to avoid {@link ArrayIndexOutOfBoundsException}s.
		 */
		MAX_DATA_SIZE: null,
		//int
		/**
		 * Compute the number of iterations required to decode <code>BLOCK_SIZE</code>
		 * values with the provided {@link Decoder}.
		 */
		//@return int
		computeIterations: function( /* PackedInts.Decoder */ decoder) {
			return Math.ceil(BLOCK_SIZE / decoder.byteValueCount()); //(int) Math.ceil((float) BLOCK_SIZE / decoder.byteValueCount());
		},
		/**
		 * Compute the number of bytes required to encode a block of values that require
		 * <code>bitsPerValue</code> bits per value with format <code>format</code>.
		 */
		//@return int
		encodedSize: function( /* PackedInts.Format */ format, /* int */ packedIntsVersion, /* int */ bitsPerValue) {
			var byteCount = format.byteCount(packedIntsVersion, BLOCK_SIZE, bitsPerValue); //long
			assert(byteCount >= 0 && byteCount <= Number.MAX_VALUE, "ERROR: byteCount=" + byteCount);
			return byteCount;
		},
		/**
		 * Compute the number of bits required to serialize any of the longs in
		 * <code>data</code>.
		 */
		//int 
		bitsRequired: function( /* int[] */ data) {
			var or = 0;
			for (var i = 0; i < BLOCK_SIZE; ++i) {
				assert(data[i] >= 0);
				or |= data[i];
			}
			return PackedInts.bitsRequired(or);
		},
		isAllEqual: function( /* int[] */ data) {
			var v = data[0]; //int
			for (var i = 1; i < BLOCK_SIZE; ++i) {
				if (data[i] != v) {
					return false;
				}
			}
			return true;
		}
	},
	variables: {
		encodedSizes: null,
		// int[] 
		encoders: null,
		//PackedInts.Encoder[]
		decoders: null,
		//PackedInts.Decoder[]
		iterations: null //int[]
	},
	construct: function() {
		/**
		 * Create a new {@link ForUtil} instance and save state into <code>out</code>.
		 */
		var c1 = function( /* float */ acceptableOverheadRatio, /* DataOutput */ out) {
				out.writeVInt(PackedInts.VERSION_CURRENT);
				this.encodedSizes = new Array(33); //new int[33];
				this.encoders = new Array(33); //new PackedInts.Encoder[33];
				this.decoders = new Array(33); //new PackedInts.Decoder[33];
				this.iterations = new Array(33); //new int[33];
				for (var bpv = 1; bpv <= 32; ++bpv) {
					var formatAndBits = PackedInts.fastestFormatAndBits(BLOCK_SIZE, bpv, acceptableOverheadRatio); //FormatAndBits
					assert(formatAndBits.format.isSupported(formatAndBits.bitsPerValue));
					assert(formatAndBits.bitsPerValue <= 32);
					this.encodedSizes[bpv] = ForUtil.encodedSize(formatAndBits.format, PackedInts.VERSION_CURRENT, formatAndBits.bitsPerValue);
					this.encoders[bpv] = PackedInts.getEncoder(formatAndBits.format, PackedInts.VERSION_CURRENT, formatAndBits.bitsPerValue);
					this.decoders[bpv] = PackedInts.getDecoder(formatAndBits.format, PackedInts.VERSION_CURRENT, formatAndBits.bitsPerValue);
					this.iterations[bpv] = ForUtil.computeIterations(this.decoders[bpv]);
					out.writeVInt(formatAndBits.format.getId() << 5 | (formatAndBits.bitsPerValue - 1));
				}
			};
		/**
		 * Restore a {@link ForUtil} from a {@link DataInput}.
		 */
		var c2 = function( /* DataInput */ _in) {
				var packedIntsVersion = _in.readVInt(); //int
				PackedInts.checkVersion(packedIntsVersion);
				this.encodedSizes = new Array(33); //new int[33];
				this.encoders = new Array(33); //new PackedInts.Encoder[33];
				this.decoders = new Array(33); //new PackedInts.Decoder[33];
				this.iterations = new Array(33); //new int[33];
				for (var bpv = 1; bpv <= 32; ++bpv) {
					var code = _in.readVInt();
					var formatId = code >>> 5;
					var bitsPerValue = (code & 31) + 1;
					var format = PackedInts.Format.byId(formatId); //PackedInts.Format
					assert(format.isSupported(bitsPerValue));
					this.encodedSizes[bpv] = ForUtil.encodedSize(format, packedIntsVersion, bitsPerValue);
					this.encoders[bpv] = PackedInts.getEncoder(format, packedIntsVersion, bitsPerValue);
					this.decoders[bpv] = PackedInts.getDecoder(format, packedIntsVersion, bitsPerValue);
					this.iterations[bpv] = ForUtil.computeIterations(this.decoders[bpv]);
				}
			};
		if (arguments.length == 1) c2.call(this, arguments[0]);
		else c1.apply(this, arguments);
	},
	methods: {
		/**
		 * Write a block of data (<code>For</code> format).
		 *
		 * @param data     the data to write
		 * @param encoded  a buffer to use to encode data
		 * @param out      the destination output
		 * @throws IOException If there is a low-level I/O error
		 */
		writeBlock: function( /* int[] */ data, /* byte[] */ encoded, /* IndexOutput */ out) {
			if (this.isAllEqual(data)) {
				out.writeByte(ForUtil.ALL_VALUES_EQUAL);
				out.writeVInt(data[0]);
				return;
			}
			var numBits = this.bitsRequired(data); //int
			assert(numBits > 0 && numBits <= 32, "ERROR: numBits=" + numBits);
			var encoder = this.encoders[numBits]; //PackedInts.Encoder
			var iters = this.iterations[numBits]; //int
			assert(iters * encoder.byteValueCount() >= BLOCK_SIZE);
			var encodedSize = this.encodedSizes[numBits]; //int
			assert(iters * encoder.byteBlockCount() >= encodedSize);
			out.writeByte(numBits);
			encoder.encode(data, 0, encoded, 0, iters);
			out.writeBytes(encoded, encodedSize);
		},
		/**
		 * Read the next block of data (<code>For</code> format).
		 *
		 * @param in        the input to use to read data
		 * @param encoded   a buffer that can be used to store encoded data
		 * @param decoded   where to write decoded data
		 * @throws IOException If there is a low-level I/O error
		 */
		readBlock: function( /* IndexInput */ _in, /* byte[] */ encoded, /* int[] */ decoded) {
			var numBits = _in.readByte(); //int
			assert(numBits <= 32, "numBits=" + numBits);
			if (numBits == ForUtil.ALL_VALUES_EQUAL) {
				var value = _in.readVInt(); //int
				Arrays.fillWithRangeValue(decoded, 0, BLOCK_SIZE, value);
				return;
			}
			var encodedSize = this.encodedSizes[numBits];
			_in.readBytes(encoded, 0, encodedSize);
			var decoder = this.decoders[numBits]; //PackedInts.Decoder
			var iters = this.iterations[numBits]; //int
			assert(iters * decoder.byteValueCount() >= BLOCK_SIZE);
			decoder.decode(encoded, 0, decoded, 0, iters);
		},
		/**
		 * Skip the next block of data.
		 *
		 * @param in      the input where to read data
		 * @throws IOException If there is a low-level I/O error
		 */
		skipBlock: function( /* IndexInput */ _in) {
			var numBits = _in.readByte(); //int
			if (numBits == ForUtil.ALL_VALUES_EQUAL) {
				_in.readVInt();
				return;
			}
			assert(numBits > 0 && numBits <= 32, "numBits=" + numBits);
			var encodedSize = this.encodedSizes[numBits]; //int
			_in.seek(_in.getFilePointer() + encodedSize);
		},
	}
});
//static code run after class definition
(function() {
	var maxDataSize = 0;
	for (var version = PackedInts.VERSION_START; version <= PackedInts.VERSION_CURRENT; version++) {
	
		debugger; //fix the values loop here 
		for ( /* PackedInts.Format */
		var format in PackedInts.Format.values()) {
			for (var bpv = 1; bpv <= 32; ++bpv) {
				if (!format.isSupported(bpv)) {
					continue;
				}
				var decoder = PackedInts.getDecoder(format, version, bpv); //PackedInts.Decoder
				var iterations = ForUtil.computeIterations(decoder); //int
				maxDataSize = Math.max(maxDataSize, iterations * decoder.byteValueCount());
			}
		}
	}
	ForUtil.MAX_DATA_SIZE = maxDataSize;
})();
module.exports = exports = ForUtil;