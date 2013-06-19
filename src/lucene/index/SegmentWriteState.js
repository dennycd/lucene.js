var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
/**
 * Holder class for common parameters used during write.
 * @lucene.experimental
 */
var SegmentWriteState = defineClass({
	name: "SegmentWriteState",
	construct: function() { /** Sole constructor. */
		var c1 = function( /* InfoStream */ infoStream, /* Directory */ directory, /* SegmentInfo */ segmentInfo, /* FieldInfos */ fieldInfos, /* int */ termIndexInterval, /* BufferedDeletes */ segDeletes, /* IOContext */ context) {
				this.infoStream = infoStream;
				this.segDeletes = segDeletes;
				this.directory = directory;
				this.segmentInfo = segmentInfo;
				this.fieldInfos = fieldInfos;
				this.termIndexInterval = termIndexInterval;
				this.segmentSuffix = "";
				this.context = context;
			};
		/**
		 * Create a shallow {@link SegmentWriteState} copy final a format ID
		 */
		var c2 = function( /* SegmentWriteState */ state, /* String */ segmentSuffix) {
				this.infoStream = state.infoStream;
				this.directory = state.directory;
				this.segmentInfo = state.segmentInfo;
				this.fieldInfos = state.fieldInfos;
				this.termIndexInterval = state.termIndexInterval;
				this.context = state.context;
				this.segmentSuffix = segmentSuffix;
				this.segDeletes = state.segDeletes;
				this.delCountOnFlush = state.delCountOnFlush;
			};
		if (arguments.length == 2) c2.apply(this, arguments);
		else if (arguments.length == 7) c1.apply(this, arguments);
	},
	variables: { /** {@link InfoStream} used for debugging messages. */
		infoStream: null,
		//InfoStream
		/** {@link Directory} where this segment will be written
		 *  to. */
		directory: null,
		//Directory
		/** {@link SegmentInfo} describing this segment. */
		segmentInfo: null,
		//SegmentInfo
		/** {@link FieldInfos} describing all fields in this
		 *  segment. */
		fieldInfos: null,
		//FieldInfos
		/** Number of deleted documents set while flushing the
		 *  segment. */
		delCountOnFlush: null,
		//int
		/** Deletes to apply while we are flushing the segment.  A
		 *  Term is enrolled in here if it was deleted at one
		 *  point, and it's mapped to the docIDUpto, meaning any
		 *  docID &lt; docIDUpto containing this term should be
		 *  deleted. */
		segDeletes: null,
		//BufferedDeletes
		/** {@link MutableBits} recording live documents; this is
		 *  only set if there is one or more deleted documents. */
		liveDocs: null,
		//MutableBits
		/** Unique suffix for any postings files written for this
		 *  segment.  {@link PerFieldPostingsFormat} sets this for
		 *  each of the postings formats it wraps.  If you create
		 *  a new {@link PostingsFormat} then any files you
		 *  write/read must be derived using this suffix (use
		 *  {@link IndexFileNames#segmentFileName(String,String,String)}). */
		segmentSuffix: null,
		//String
		/** Expert: The fraction of terms in the "dictionary" which should be stored
		 * in RAM.  Smaller values use more memory, but make searching slightly
		 * faster, while larger values use less memory and make searching slightly
		 * slower.  Searching is typically not dominated by dictionary lookup, so
		 * tweaking this is rarely useful.*/
		termIndexInterval: null,
		//int                   // TODO: this should be private to the codec, not settable here or in IWC
		/** {@link IOContext} for all writes; you should pass this
		 *  to {@link Directory#createOutput(String,IOContext)}. */
		context: null,
		//IOContext
	}
});
module.exports = exports = SegmentWriteState;