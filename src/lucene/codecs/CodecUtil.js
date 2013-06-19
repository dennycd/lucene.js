/**
 General Codecs Utility 
 REFERENCE org.apache.lucene.codecs.CodecUtil.java

**/
var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var CorruptIndexException = require('library/lucene/index/CorruptIndexException.js');
/**

REFERENCE http://lucene.apache.org/core/4_2_0/core/org/apache/lucene/codecs/CodecUtil.html

 Manage Read/Write of Indexing Codecs
**/
var CodecUtil = defineClass({
	name: "CodecUtil",
	construct: function(name, value, options) {},
	statics: {
/*
		 constant to identify the start of a codec header
		*/
		CODEC_MAGIC: 0x3fd76c17,
/**
		 Write a codec header
		 @param out - bytes output stream
		 @param codec - string to identify the file. should be simple ASCII less than 128 chars in length
		 @param version - integer version number 
		**/
		writeHeader: function(outstream, codec, version) {},
		/**
		 * Reads and validates a header previously written with
		 * {@link #writeHeader(DataOutput, String, int)}.
		 * <p>
		 * When reading a file, supply the expected <code>codec</code> and
		 * an expected version range (<code>minVersion to maxVersion</code>).
		 *
		 * @param in Input stream, positioned at the point where the
		 *        header was previously written. Typically this is located
		 *        at the beginning of the file.
		 * @param codec The expected codec name.
		 * @param minVersion The minimum supported expected version number.
		 * @param maxVersion The maximum supported expected version number.
		 * @return The actual version found, when a valid header is found
		 *         that matches <code>codec</code>, with an actual version
		 *         where <code>minVersion <= actual <= maxVersion</code>.
		 *         Otherwise an exception is thrown.
		 * @throws CorruptIndexException If the first four bytes are not
		 *         {@link #CODEC_MAGIC}, or if the actual codec found is
		 *         not <code>codec</code>.
		 * @throws IndexFormatTooOldException If the actual version is less
		 *         than <code>minVersion</code>.
		 * @throws IndexFormatTooNewException If the actual version is greater
		 *         than <code>maxVersion</code>.
		 * @throws IOException If there is an I/O error reading from the underlying medium.
		 * @see #writeHeader(DataOutput, String, int)
		 */
		/* int */
		checkHeader: function( /* DataInput */ _in, /* String */ codec, /* int */ minVersion, /* int */ maxVersion) {
			// Safety to guard against reading a bogus string:
			var actualHeader = _in.readInt();
			if (actualHeader != CodecUtil.CODEC_MAGIC) {
				throw new CorruptIndexException("codec header mismatch: actual header=" + actualHeader + " vs expected header=" + CodecUtil.CODEC_MAGIC + " (resource: " + _in + ")");
			}
			return this.checkHeaderNoMagic(_in, codec, minVersion, maxVersion);
		},
		/** Like {@link
		 *  #checkHeader(DataInput,String,int,int)} except this
		 *  version assumes the first int has already been read
		 *  and validated from the input. */
		checkHeaderNoMagic: function( /* DataInput */ _in, /* String */ codec, /* int */ minVersion, /* int */ maxVersion) {
			var actualCodec = _in.readString();
			console.log("actualCodec=" + actualCodec);
			if (actualCodec != codec) {
				throw new CorruptIndexException("codec mismatch: actual codec=" + actualCodec + " vs expected codec=" + codec + " (resource: " + _in + ")");
			}
			var actualVersion = _in.readInt();
			console.log("actual version=" + actualVersion);
			if (actualVersion < minVersion) {
				throw new IndexFormatTooOldException(_in, actualVersion, minVersion, maxVersion);
			}
			if (actualVersion > maxVersion) {
				throw new IndexFormatTooNewException(_in, actualVersion, minVersion, maxVersion);
			}
			return actualVersion;
		},
	},
});
module.exports = exports = CodecUtil;