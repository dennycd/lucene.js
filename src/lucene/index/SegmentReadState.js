var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');
/**
 * Holder class for common parameters used during read.
 * @lucene.experimental
 */
var SegmentReadState = defineClass({
	name: "SegmentReadState",
	variables: { /** {@link Directory} where this segment is read from. */
		directory: null,
		//Directory
		/** {@link SegmentInfo} describing this segment. */
		segmentInfo: null,
		//SegmentInfo
		/** {@link FieldInfos} describing all fields in this
		 *  segment. */
		fieldInfos: null,
		//FieldInfos
		/** {@link IOContext} to pass to {@link
		 *  Directory#openInput(String,IOContext)}. */
		context: null,
		//IOContext
		/** The {@code termInfosIndexDivisor} to use, if
		 *  appropriate (not all {@link PostingsFormat}s support
		 *  it; in particular the current default does not).
		 *
		 * <p>  NOTE: if this is &lt; 0, that means "defer terms index
		 *  load until needed".  But if the codec must load the
		 *  terms index on init (preflex is the only once currently
		 *  that must do so), then it should negate this value to
		 *  get the app's terms divisor */
		termsIndexDivisor: null,
		//int
		/** Unique suffix for any postings files read for this
		 *  segment.  {@link PerFieldPostingsFormat} sets this for
		 *  each of the postings formats it wraps.  If you create
		 *  a new {@link PostingsFormat} then any files you
		 *  write/read must be derived using this suffix (use
		 *  {@link IndexFileNames#segmentFileName(String,String,String)}). */
		segmentSuffix: null //String
	},
	construct: function() {
		var self = this; /** Create a {@code SegmentReadState}. */
		var c1 = function( /* Directory */ dir, /* SegmentInfo */ info, /* FieldInfos */ fieldInfos, /* IOContext */ context, /* int */ termsIndexDivisor) {
				c2.call(this, dir, info, fieldInfos, context, termsIndexDivisor, "");
			}; /** Create a {@code SegmentReadState}. */
		var c2 = function( /* Directory */ dir, /* SegmentInfo */ info, /* FieldInfos */ fieldInfos, /* IOContext */ context, /* int */ termsIndexDivisor, /* String */ segmentSuffix) {
				self.directory = dir;
				self.segmentInfo = info;
				self.fieldInfos = fieldInfos;
				self.context = context;
				self.termsIndexDivisor = termsIndexDivisor;
				self.segmentSuffix = segmentSuffix;
			}; /** Create a {@code SegmentReadState}. */
		var c3 = function( /* SegmentReadState */ other, /* String */ newSegmentSuffix) {
				self.directory = other.directory;
				self.segmentInfo = other.segmentInfo;
				self.fieldInfos = other.fieldInfos;
				self.context = other.context;
				self.termsIndexDivisor = other.termsIndexDivisor;
				self.segmentSuffix = newSegmentSuffix;
			};
		if (arguments.length == 2) c3.apply(this, arguments);
		else if (arguments.length == 5) c1.apply(this, arguments);
		else if (arguments.length == 6) c2.apply(this, arguments);
	}
});
module.exports = exports = SegmentReadState;