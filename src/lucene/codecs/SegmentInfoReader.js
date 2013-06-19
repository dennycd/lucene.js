var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/**
 * Specifies an API for classes that can read {@link SegmentInfo} information.
 * @lucene.experimental
 */
var SegmentInfoReader = defineClass({
	name: "SegmentInfoReader",
	methods: {
		/**
		 * Read {@link SegmentInfo} data from a directory.
		 * @param directory directory to read from
		 * @param segmentName name of the segment to read
		 * @return infos instance to be populated with data
		 * @throws IOException If an I/O error occurs
		 */
		/*return SegmentInfo */
		read: function( /* Directory */ directory, /* String */ segmentName, /* IOContext */ context) {
			throw new ImplNotSupportedException("SegmentInfoReader::read");
		}
	}
});
module.exports = exports = SegmentInfoReader;