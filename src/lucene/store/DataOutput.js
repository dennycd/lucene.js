var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');

/*
var BytesRef = require('library/lucene/util/BytesRef.js');
var UnicodeUtil = require('library/lucene/util/UnicodeUtil.js');
*/

/**
 * Abstract base class for performing write operations of Lucene's low-level
 * data types.

 * <p>{@code DataOutput} may only be used from one thread, because it is not
 * thread safe (it keeps internal state like file position).
 */
var DataOutput = defineClass({
	name: "DataOutput",
	statics: {
		COPY_BUFFER_SIZE: 16384
	},
	construct: function() {
		this.copyBuffer = null;
	},
	methods: {
		/** Writes a single byte.
		 * <p>
		 * The most primitive data type is an eight-bit byte. Files are
		 * accessed as sequences of bytes. All other data types are defined
		 * as sequences of bytes, so file formats are byte-order independent.
		 *
		 * @see IndexInput#readByte()
		 */
		writeByte: function(b) {
			throw new ImplNotSupportedException()
		},
		/** Writes an array of bytes.
		 * @param b the bytes to write
		 * @param length the number of bytes to write
		 * @see DataInput#readBytes(byte[],int,int)
		 */
		writeBytes: function(b, length) {
			this.writeBytes(b, 0, length);
		},
		/** Writes an array of bytes.
		 * @param b the bytes to write
		 * @param offset the offset in the byte array
		 * @param length the number of bytes to write
		 * @see DataInput#readBytes(byte[],int,int)
		 */
		writeBytes: function(b, offset, length) {
			throw new ImplNotSupportedException()
		},
		/** Writes an int as four bytes.
		 * <p>
		 * 32-bit unsigned integer written as four bytes, high-order bytes first.
		 *
		 * @see DataInput#readInt()
		 */
		writeInt: function(i) {
			this.writeByte((i >> 24) & 0xFF);
			this.writeByte((i >> 16) & 0xFF);
			this.writeByte((i >> 8) & 0xFF);
			this.writeByte(i & 0xFF);
		},
		/** Writes a short 16bit as two bytes.
		 * @see DataInput#readShort()
		 */
		writeShort: function(i) {
			this.writeByte((i >> 8) & 0xFF);
			this.writeByte(i & 0xFF);
		},
		/** Writes an int in a variable-length format.  Writes between one and
		 * five bytes.  Smaller values take fewer bytes.  Negative numbers are
		 * supported, but should be avoided.
		 * <p>VByte is a variable-length format for positive integers is defined where the
		 * high-order bit of each byte indicates whether more bytes remain to be read. The
		 * low-order seven bits are appended as increasingly more significant bits in the
		 * resulting integer value. Thus values from zero to 127 may be stored in a single
		 * byte, values from 128 to 16,383 may be stored in two bytes, and so on.</p>
		 * <p>VByte Encoding Example</p>
		 * <table cellspacing="0" cellpadding="2" border="0">
		 * <col width="64*">
		 * <col width="64*">
		 * <col width="64*">
		 * <col width="64*">
		 * <tr valign="top">
		 *   <th align="left" width="25%">Value</th>
		 *   <th align="left" width="25%">Byte 1</th>
		 *   <th align="left" width="25%">Byte 2</th>
		 *   <th align="left" width="25%">Byte 3</th>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">0</td>
		 *   <td width="25%"><kbd>00000000</kbd></td>
		 *   <td width="25%"></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">1</td>
		 *   <td width="25%"><kbd>00000001</kbd></td>
		 *   <td width="25%"></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">2</td>
		 *   <td width="25%"><kbd>00000010</kbd></td>
		 *   <td width="25%"></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr>
		 *   <td valign="top" width="25%">...</td>
		 *   <td valign="bottom" width="25%"></td>
		 *   <td valign="bottom" width="25%"></td>
		 *   <td valign="bottom" width="25%"></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">127</td>
		 *   <td width="25%"><kbd>01111111</kbd></td>
		 *   <td width="25%"></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">128</td>
		 *   <td width="25%"><kbd>10000000</kbd></td>
		 *   <td width="25%"><kbd>00000001</kbd></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">129</td>
		 *   <td width="25%"><kbd>10000001</kbd></td>
		 *   <td width="25%"><kbd>00000001</kbd></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">130</td>
		 *   <td width="25%"><kbd>10000010</kbd></td>
		 *   <td width="25%"><kbd>00000001</kbd></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr>
		 *   <td valign="top" width="25%">...</td>
		 *   <td width="25%"></td>
		 *   <td width="25%"></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">16,383</td>
		 *   <td width="25%"><kbd>11111111</kbd></td>
		 *   <td width="25%"><kbd>01111111</kbd></td>
		 *   <td width="25%"></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">16,384</td>
		 *   <td width="25%"><kbd>10000000</kbd></td>
		 *   <td width="25%"><kbd>10000000</kbd></td>
		 *   <td width="25%"><kbd>00000001</kbd></td>
		 * </tr>
		 * <tr valign="bottom">
		 *   <td width="25%">16,385</td>
		 *   <td width="25%"><kbd>10000001</kbd></td>
		 *   <td width="25%"><kbd>10000000</kbd></td>
		 *   <td width="25%"><kbd>00000001</kbd></td>
		 * </tr>
		 * <tr>
		 *   <td valign="top" width="25%">...</td>
		 *   <td valign="bottom" width="25%"></td>
		 *   <td valign="bottom" width="25%"></td>
		 *   <td valign="bottom" width="25%"></td>
		 * </tr>
		 * </table>
		 * <p>This provides compression while still being efficient to decode.</p>
		 *
		 * @param i Smaller values take fewer bytes.  Negative numbers are
		 * supported, but should be avoided.
		 * @throws IOException If there is an I/O error writing to the underlying medium.
		 * @see DataInput#readVInt()
		 */
		writeVInt: function(i) {
			while ((i & ~0x7F) != 0) {
				this.writeByte(((i & 0x7F) | 0x80));
				i >>>= 7;
			}
			this.writeByte(i);
		},
		/** Writes a long as eight bytes.
		 * <p>
		 * 64-bit unsigned integer written as eight bytes, high-order bytes first.
		 *
		 * @see DataInput#readLong()
		 */
		writeLong: function(i) {
			this.writeInt((i >> 32) & 0xFFFFFFFF);
			this.writeInt(i & 0xFFFFFFFF);
		},
		/** Writes an long in a variable-length format.  Writes between one and nine
		 * bytes.  Smaller values take fewer bytes.  Negative numbers are not
		 * supported.
		 * <p>
		 * The format is described further in {@link DataOutput#writeVInt(int)}.
		 * @see DataInput#readVLong()
		 */
		writeVLong: function(i) {
			assert(i >= 0);
			while ((i & ~0x7F) != 0) {
				this.writeByte(((i & 0x7F) | 0x80));
				i >>>= 7;
			}
			this.writeByte(i);
		},
		/** Writes a string.
		 * <p>
		 * Writes strings as UTF-8 encoded bytes. First the length, in bytes, is
		 * written as a {@link #writeVInt VInt}, followed by the bytes.
		 *
		 * @see DataInput#readString()
		 */
		writeString: function(s) {
/*
			//final BytesRef utf8Result = new BytesRef(10);
			var utf8Result = new BytesRef(10);
			UnicodeUtil.UTF16toUTF8(s, 0, s.length(), utf8Result);
			this.writeVInt(utf8Result.length);
			this.writeBytes(utf8Result.bytes, 0, utf8Result.length);
*/
			var utf8Buf = new Buffer(s, 'utf8');
			this.writeVInt(utf8Buf.length);
			this.writeBytes(utf8Buf, 0, utf8Buf.length);
		},
		/** Copy numBytes bytes from input to ourself. */
		//input: DataInput
		copyBytes: function(input, numBytes) {
			assert(numBytes >= 0, "numBytes=" + numBytes);
			assert(Class.isInstanceOfClass(input, "DataInput"));
			var left = numBytes;
			if (this.copyBuffer == null) this.copyBuffer = new Buffer(DataOutput.COPY_BUFFER_SIZE);
			while (left > 0) {
				var toCopy;
				if (left > DataOutput.COPY_BUFFER_SIZE) toCopy = DataOutput.COPY_BUFFER_SIZE;
				else toCopy = left;
				input.readBytes(this.copyBuffer, 0, toCopy);
				this.writeBytes(this.copyBuffer, 0, toCopy);
				left -= toCopy;
			}
		},
		/**
		 * Writes a String map.
		 * <p>
		 * First the size is written as an {@link #writeInt(int) Int32},
		 * followed by each key-value pair written as two consecutive
		 * {@link #writeString(String) String}s.
		 *
		 * @param map Input map. May be null (equivalent to an empty map)
		 *
		 * @param map - Map<String,String>
		 */
		writeStringStringMap: function(map) {
			if (map == null) {
				this.writeInt(0);
			} else {
				this.writeInt(map.size());
				for (var key in map) {
					this.writeString(key);
					this.writeString(map[key]);
				}
			}
		},
		/**
		 * Writes a String set.
		 * <p>
		 * First the size is written as an {@link #writeInt(int) Int32},
		 * followed by each value written as a
		 * {@link #writeString(String) String}.
		 *
		 * @param set Input set. May be null (equivalent to an empty set) Set<String>
		 */
		writeStringSet : function(set) {
			if (set == null) {
				this.writeInt(0);
			} else {
				this.writeInt(set.length);
				for (var i in set) {
					this.writeString(set[i]);
				}
			}
		}
	}
});
module.exports = exports = DataOutput;