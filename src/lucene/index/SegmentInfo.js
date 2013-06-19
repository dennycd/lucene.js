var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var IllegalStateException = require('library/lucene/util/IllegalStateException.js');
/**
 * Information about a segment such as it's name, directory, and files related
 * to the segment.
 *
 * @lucene.experimental
 */
var SegmentInfo = defineClass({
	name: "SegmentInfo",
	statics: {
		// TODO: remove these from this class, for now this is the representation
		/** Used by some member fields to mean not present (e.g.,
		 *  norms, deletions). */
		NO: -1,
		// e.g. no norms; no deletes;
		/** Used by some member fields to mean present (e.g.,
		 *  norms, deletions). */
		YES: 1 // e.g. have norms; have deletes;
	},
	variables: { /** Unique segment name in the directory. */
		name: null,
		//String
		docCount: null,
		// number of docs in seg //int
		/** Where this segment resides. */
		dir: null,
		//Directory
		isCompoundFile: null,
		//boolean
		codec: null,
		//Codec
		diagnostics: null,
		//Map<String,String>
		attributes: null,
		//Map<String,String>
		// Tracks the Lucene version this segment was created with, since 3.1. Null
		// indicates an older than 3.0 index, and it's used to detect a too old index.
		// The format expected is "x.y" - "2.x" for pre-3.0 indexes (or null), and
		// specific versions afterwards ("3.0", "3.1" etc.).
		// see Constants.LUCENE_MAIN_VERSION.
		version: null,
		//String
		_setFiles: null,
		//Set<String>
	},
	/**
	 * Construct a new complete SegmentInfo instance from input.
	 * <p>Note: this is public only to allow access from
	 * the codecs package.</p>
	 */
	construct: function( /* Directory */ dir, /* String */ version, /* String */ name, /* int */ docCount, /* boolean */ isCompoundFile, /* Codec */ codec, /* Map<String,String> */ diagnostics, /* Map<String,String> */ attributes) {
		console.log("SegmentInfo::construct");
		assert(!(Class.isInstanceOfClass(dir, "TrackingDirectoryWrapper")));
		this.dir = dir;
		this.version = version;
		this.name = name;
		this.docCount = docCount;
		this.isCompoundFile = isCompoundFile;
		this.codec = codec;
		this.diagnostics = diagnostics;
		this.attributes = attributes;
		console.log("SegmentInfo::construct done");
	},
	methods: {
		setDiagnostics: function( /* Map<String, String> */ diagnostics) {
			this.diagnostics = diagnostics;
		},
		/** Returns diagnostics saved into the segment when it was
		 *  written. */
		getDiagnostics: function() {
			return diagnostics;
		},
		/**
		 * @deprecated separate norms are not supported in >= 4.0
		 */
		//@Deprecated
/*
   boolean  hasSeparateNorms : function() {
    return this.getAttribute(Lucene3xSegmentInfoFormat.NORMGEN_KEY) != null;
  }
*/
		/**
		 * Mark whether this segment is stored as a compound file.
		 *
		 * @param isCompoundFile true if this is a compound file;
		 * else, false
		 */
		setUseCompoundFile: function( /* boolean */ isCompoundFile) {
			this.isCompoundFile = isCompoundFile;
		},
		/**
		 * Returns true if this segment is stored as a compound
		 * file; else, false.
		 */
		getUseCompoundFile: function() {
			return this.isCompoundFile;
		},
		/** Can only be called once. */
		setCodec: function( /* Codec */ codec) {
			assert(this.codec == null);
			if (codec == null) {
				throw new IllegalArgumentException("segmentCodecs must be non-null");
			}
			this.codec = codec;
		},
		/** Return {@link Codec} that wrote this segment. */
		getCodec: function() {
			return this.codec;
		},
		/** Returns number of documents in this segment (deletions
		 *  are not taken into account). */
		getDocCount: function() {
			if (this.docCount == -1) {
				throw new IllegalStateException("docCount isn't set yet");
			}
			return this.docCount;
		},
		// NOTE: leave package private
		setDocCount: function( /* int */ docCount) {
			if (this.docCount != -1) {
				throw new IllegalStateException("docCount was already set");
			}
			this.docCount = docCount;
		},
		/** Return all files referenced by this SegmentInfo. */
		//return Set<String> 
		files: function() {
			if (this._setFiles == null) {
				throw new IllegalStateException("files were not computed yet");
			}
			return this._setFiles;
			//return Collections.unmodifiableSet(setFiles);
		},
/*
  //@Override
  toString : function() {
    return toString(dir, 0);
  }
*/
		/** Used for debugging.  Format may suddenly change.
		 *
		 *  <p>Current format looks like
		 *  <code>_a(3.1):c45/4</code>, which means the segment's
		 *  name is <code>_a</code>; it was created with Lucene 3.1 (or
		 *  '?' if it's unknown); it's using compound file
		 *  format (would be <code>C</code> if not compound); it
		 *  has 45 documents; it has 4 deletions (this part is
		 *  left off when there are no deletions).</p>
		 */
		toString: function( /* Directory */ dir, /* int */ delCount) {
			//StringBuilder s = new StringBuilder();
			var s = this.name + "(" + (this.version == null ? "?" : this.version) + ")" + ":";
			//s.append(name).append('(').append(version == null ? "?" : version).append(')').append(':');
			var cfs = this.getUseCompoundFile() ? 'c' : 'C';
			s += cfs; //s.append(cfs);
			if (this.dir != dir) {
				s += 'x'; //s.append('x');
			}
			s += this.docCount; //s.append(docCount);
			if (delCount != 0) {
				s += "/" + delCount; //s.append('/').append(delCount);
			}
			// TODO: we could append toString of attributes() here?
			return s; //s.toString();
		},
		/** We consider another SegmentInfo instance equal if it
		 *  has the same dir and same name. */
		//@Override
		equals: function( /* Object */ obj) {
			if (this === obj) return true;
			if (Class.isInstanceOfClass(obj, "SegmentInfo")) {
				var other = obj;
				return other.dir == this.dir && other.name.equals(this.name); //TODO - fix the euqality check for directory here
			} else {
				return false;
			}
		},
		//@Override
		hashCode: function() {
			return this.dir.hashCode() + this.name.hashCode();
		},
		/**
		 * Used by DefaultSegmentInfosReader to upgrade a 3.0 segment to record its
		 * version is "3.0". This method can be removed when we're not required to
		 * support 3x indexes anymore, e.g. in 5.0.
		 * <p>
		 * <b>NOTE:</b> this method is used for internal purposes only - you should
		 * not modify the version of a SegmentInfo, or it may result in unexpected
		 * exceptions thrown when you attempt to open the index.
		 *
		 * @lucene.internal
		 */
		setVersion: function( /* String */ version) {
			this.version = version;
		},
		/** Returns the version of the code which wrote the segment. */
		getVersion: function() {
			return this.version;
		},
		/** Sets the files written for this segment. */
		setFiles: function( /* Set<String> */ files) {
			this.checkFileNames(files);
			this._setFiles = files;
		},
		/** Add these files to the set of files written for this
		 *  segment. */
		addFiles: function( /* Collection<String> */ files) {
			this.checkFileNames(files);
			//this.setFiles.addAll(files);
			for (var file in files)
			this._setFiles[file] = true;
		},
		/** Add this file to the set of files written for this
		 *  segment. */
		addFile: function( /* String */ file) {
			this.checkFileNames([file]); /* Collections.singleton(file) */
			;
			this._setFiles[file] = true; //setFiles.add(file);
		},
		checkFileNames: function( /* Collection<String> */ files) {
			//TODO - fix this matcher her e
/*
    Matcher m = IndexFileNames.CODEC_FILE_PATTERN.matcher("");
    for (String file : files) {
      m.reset(file);
      if (!m.matches()) {
        throw new IllegalArgumentException("invalid codec filename '" + file + "', must match: " + IndexFileNames.CODEC_FILE_PATTERN.pattern());
      }
    }
    */
		},
		/**
		 * Get a codec attribute value, or null if it does not exist
		 */
		getAttribute: function( /* String */ key) {
			if (this.attributes == null) {
				return null;
			} else {
				return this.attributes[key]; //attributes.get(key);
			}
		},
		/**
		 * Puts a codec attribute value.
		 * <p>
		 * This is a key-value mapping for the field that the codec can use
		 * to store additional metadata, and will be available to the codec
		 * when reading the segment via {@link #getAttribute(String)}
		 * <p>
		 * If a value already exists for the field, it will be replaced with
		 * the new value.
		 */
		putAttribute: function( /* String */ key, /* String */ value) {
			if (this.attributes == null) {
				this.attributes = {}; //new HashMap();
			}
			this.attributes[key] = value;
			return this.attributes[key];
		},
		/**
		 * Returns the internal codec attributes map.
		 *
		 * @return internal codec attributes map. May be null if no mappings exist.
		 */
		/* public Map<String,String> */
		attributes: function() {
			return this.attributes;
		},
	}
})
module.exports = exports = SegmentInfo;