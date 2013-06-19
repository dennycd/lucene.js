var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/** Format for live/deleted documents
 * @lucene.experimental */
var LiveDocsFormat = defineClass({
	name: "LiveDocsFormat",
	construct: function() {},
	methods: { /** Creates a new MutableBits, with all bits set, for the specified size. */
		//return MutableBits
		newLiveDocsWithSize: function( /* int */ size) {
			throw new ImplNotSupportedException("LiveDocsFormat::newLiveDocsWithSize");
		},
		/** Creates a new mutablebits of the same bits set and size of existing. */
		//MutableBits
		newLiveDocsWithBits: function( /* Bits */ existing) {
			throw new ImplNotSupportedException("LiveDocsFormat::newLiveDocsWithBits");
		},
		/** Read live docs bits. */
		//@return Bits
		readLiveDocs: function( /* Directory */ dir, /* SegmentInfoPerCommit */ info, /* IOContext */ context) {
			throw new ImplNotSupportedException("LiveDocsFormat::readLiveDocs");
		},
		/** Persist live docs bits.  Use {@link
		 *  SegmentInfoPerCommit#getNextDelGen} to determine the
		 *  generation of the deletes file you should write to. */
		writeLiveDocs: function( /* MutableBits */ bits, /* Directory */ dir, /* SegmentInfoPerCommit */ info, /* int */ newDelCount, /* IOContext */ context) {
			throw new ImplNotSupportedException("LiveDocsFormat::writeLiveDocs");
		},
		/** Records all files in use by this {@link SegmentInfoPerCommit} into the files argument. */
		files: function( /* SegmentInfoPerCommit */ info, /* Collection<String> */ files) {
			throw new ImplNotSupportedException("LiveDocsFormat::files");
		},
	}
})
module.exports = exports = LiveDocsFormat;