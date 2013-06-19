var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
/** Embeds a [read-only] SegmentInfo and adds per-commit
 *  fields.
 *
 *  @lucene.experimental
 */
var SegmentInfoPerCommit = defineClass({
	name: "SegmentInfoPerCommit",
	variables: { /** The {@link SegmentInfo} that we wrap. */
		info: null,
		//SegmentInfo
		// How many deleted docs in the segment:
		delCount: null,
		//int
		// Generation number of the live docs file (-1 if there
		// are no deletes yet):
		delGen: null,
		//long
		// Normally 1+delGen, unless an exception was hit on last
		// attempt to write:
		nextWriteDelGen: null,
		//long
		_sizeInBytes: -1,
		//long
		// NOTE: only used in-RAM by IW to track buffered deletes;
		// this is never written to/read from the Directory
		bufferedDeletesGen: null,
		//long
	},
/** Sole constructor.
   * @param info {@link SegmentInfo} that we wrap
   * @param delCount number of deleted documents in this segment
   * @param delGen deletion generation number (used to name
             deletion files)
   **/
	construct: function( /* SegmentInfo */ info, /* int */ delCount, /* long */ delGen) {
		this.info = info;
		this.delCount = delCount;
		this.delGen = delGen;
		if (delGen == -1) {
			this.nextWriteDelGen = 1;
		} else {
			this.nextWriteDelGen = delGen + 1;
		}
	},
	methods: { /** Called when we succeed in writing deletes */
		advanceDelGen: function() {
			this.delGen = this.nextWriteDelGen;
			this.nextWriteDelGen = this.delGen + 1;
			this._sizeInBytes = -1;
		},
		/** Called if there was an exception while writing
		 *  deletes, so that we don't try to write to the same
		 *  file more than once. */
		advanceNextWriteDelGen: function() {
			this.nextWriteDelGen++;
		},
		/** Returns total size in bytes of all files for this
		 *  segment.
		 * <p><b>NOTE:</b> This value is not correct for 3.0 segments
		 * that have shared docstores. To get the correct value, upgrade! */
		sizeInBytes: function() {
			if (this._sizeInBytes == -1) {
				var sum = 0;
				var files = this.files();
				for (var fileName in files) {
					sum += this.info.dir.fileLength(fileName);
				}
				this._sizeInBytes = sum;
			}
			return this._sizeInBytes;
		},
		/** Returns all files in use by this segment. */
		/* Collection<String> */
		files: function() {
			// Start from the wrapped info's files:
			//Collection<String> files = new HashSet<String>(info.files());
			var files = {};
			for (var file in this.info.files())
			files[file] = true;
			// Must separately add any live docs files:
			info.getCodec().liveDocsFormat().files(this, files);
			return files;
		},
		getBufferedDeletesGen: function() {
			return this.bufferedDeletesGen;
		},
		setBufferedDeletesGen: function( /* long */ v) {
			this.bufferedDeletesGen = v;
			this._sizeInBytes = -1;
		},
		clearDelGen: function() {
			this.delGen = -1;
			this._sizeInBytes = -1;
		},
		/**
		 * Sets the generation number of the live docs file.
		 * @see #getDelGen()
		 */
		setDelGen: function( /* long */ delGen) {
			this.delGen = delGen;
			this._sizeInBytes = -1;
		},
		/** Returns true if there are any deletions for the 
		 * segment at this commit. */
		hasDeletions: function() {
			return this.delGen != -1;
		},
		/**
		 * Returns the next available generation number
		 * of the live docs file.
		 */
		getNextDelGen: function() {
			return this.nextWriteDelGen;
		},
		/**
		 * Returns generation number of the live docs file
		 * or -1 if there are no deletes yet.
		 */
		getDelGen: function() {
			return this.delGen;
		},
		/**
		 * Returns the number of deleted docs in the segment.
		 */
		getDelCount: function() {
			return this.delCount;
		},
		setDelCount: function( /* int */ delCount) {
			this.delCount = delCount;
			assert(delCount <= this.info.getDocCount());
		},
		/** Returns a description of this segment. */
		toStringWithDirDelCount: function( /* Directory */ dir, /* int */ pendingDelCount) {
			return this.info.toString(dir, this.delCount + pendingDelCount);
		},
		//@Override
		toString : function() {
			var s = this.info.toString(this.info.dir, this.delCount);
			if (this.delGen != -1) {
				s += ":delGen=" + this.delGen;
			}
			return s;
		},
		//@Override
		//reurn SegmentInfoPerCommit
		clone: function() {
			var other = new SegmentInfoPerCommit(this.info, this.delCount, this.delGen);
			// Not clear that we need to carry over nextWriteDelGen
			// (i.e. do we ever clone after a failed write and
			// before the next successful write?), but just do it to
			// be safe:
			other.nextWriteDelGen = this.nextWriteDelGen;
			return other;
		},
	}
});
module.exports = exports = SegmentInfoPerCommit;