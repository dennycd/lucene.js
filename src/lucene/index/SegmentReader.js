var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var IndexOutOfBoundsException = require('library/java/lang/IndexOutOfBoundsException.js');
var IOContext = require('library/lucene/store/IOContext.js');

var AtomicReader = require('./AtomicReader.js');
var SegmentCoreReaders = require('./SegmentCoreReaders.js');


console.log("SegmentReader MODULE");

/**
 * IndexReader implementation over a single segment.
 * <p>
 * Instances pointing to the same segment (but with different deletes, etc)
 * may share the same core data.
 * @lucene.experimental
 */
var SegmentReader = defineClass({
	name: "SegmentReader",
	extend: AtomicReader,
	variables: {
		si: null,
		//SegmentInfoPerCommit
		liveDocs: null,
		//Bits
		// Normally set to si.docCount - si.delDocCount, unless we
		// were created as an NRT reader from IW, in which case IW
		// tells us the docCount:
		numDocs: null,
		//int 
		core: null,
		//SegmentCoreReaders
	},
	construct: function() {
		console.log("SegmentReader::construct");
		AtomicReader.call(this);		
		var self = this;


		/**
		 * Constructs a new SegmentReader with a new core.
		 * @throws CorruptIndexException if the index is corrupt
		 * @throws IOException if there is a low-level IO error
		 */
		// TODO: why is this public?
		var c1 = function( /* SegmentInfoPerCommit */ si, /* int */ termInfosIndexDivisor, /* IOContext */ context) {
				debugger;
				self.si = si;
				self.core = new SegmentCoreReaders(self, si.info.dir, si, context, termInfosIndexDivisor);
				var success = false;
				try {
					if (si.hasDeletions()) {
						// NOTE: the bitvector is stored using the regular directory, not cfs
						self.liveDocs = si.info.getCodec().liveDocsFormat().readLiveDocs(self.directory(), si, new IOContext(IOContext.READ, true));
					} else {
						assert(si.getDelCount() == 0);
						self.liveDocs = null;
					}
					self.numDocs = si.info.getDocCount() - si.getDelCount();
					success = true;
				} finally {
					// With lock-less commits, it's entirely possible (and
					// fine) to hit a FileNotFound exception above.  In
					// this case, we want to explicitly close any subset
					// of things that were opened so that we don't have to
					// wait for a GC to do so.
					if (!success) {
						self.core.decRef();
					}
				}
			};
		/** Create new SegmentReader sharing core from a previous
		 *  SegmentReader and loading new live docs from a new
		 *  deletes file.  Used by openIfChanged. */
		var c2 = function( /* SegmentInfoPerCommit */ si, /* SegmentCoreReaders */ core, /* IOContext */ context) {
				c3.call(this,si, core, si.info.getCodec().liveDocsFormat().readLiveDocs(si.info.dir, si, context), si.info.getDocCount() - si.getDelCount());
			};
		/** Create new SegmentReader sharing core from a previous
		 *  SegmentReader and using the provided in-memory
		 *  liveDocs.  Used by IndexWriter to provide a new NRT
		 *  reader */
		var c3 = function( /* SegmentInfoPerCommit */ si, /* SegmentCoreReaders */ core, /* Bits */ liveDocs, /* int */ numDocs) {
				self.si = si;
				self.core = core;
				self.core.incRef();
				assert(liveDocs != null);
				self.liveDocs = liveDocs;
				self.numDocs = numDocs;
			}


		if (arguments.length == 3) {
			if (typeof(arguments[1]) == "number") c1.apply(this, arguments);
			else if (Class.isInstanceOfClass("SegmentCoreReaders")) c2.apply(this, arguments);
			else throw new IllegalArgumentException("SegmentReader::construct");
		} else if (arguments.length == 4) c3.apply(this, arguments);
				
		console.log("SegmentReader::construct done");

	},
	methods: {
		//@Override
		//return Bits
		getLiveDocs: function() {
			this.ensureOpen();
			return this.liveDocs;
		},
		//@Override
		doClose: function() {
			//System.out.println("SR.close seg=" + si);
			this.core.decRef();
		},
		///@Override
		hasDeletions: function() {
			// Don't call ensureOpen() here (it could affect performance)
			return this.liveDocs != null;
		},
		//@Override
		//@return FieldInfos 
		getFieldInfos: function() {
			this.ensureOpen();
			return this.core.fieldInfos;
		},
		/** Expert: retrieve thread-private {@link
		 *  StoredFieldsReader}
		 *  @lucene.internal */
		//return StoredFieldsReader
		getFieldsReader: function() {
			this.ensureOpen();
			return this.core.fieldsReaderLocal.get();
		},
		//@Override
		document: function( /* int */ docID, /* StoredFieldVisitor */ visitor) {
			this.checkBounds(docID);
			this.getFieldsReader().visitDocument(docID, visitor);
		},
		//@Override
		//@return Fields
		fields: function() {
			this.ensureOpen();
			return this.core.fields;
		},
		//@Override
		numDocs: function() {
			// Don't call ensureOpen() here (it could affect performance)
			return this.numDocs;
		},
		//@Override
		maxDoc: function() {
			// Don't call ensureOpen() here (it could affect performance)
			return this.si.info.getDocCount();
		},
		/** Expert: retrieve thread-private {@link
		 *  TermVectorsReader}
		 *  @lucene.internal */
		//return TermVectorsReader
		getTermVectorsReader: function() {
			this.ensureOpen();
			return this.core.termVectorsLocal.get();
		},
		//@Override
		//return Fields
		getTermVectors: function( /* int */ docID) {
			var termVectorsReader = this.getTermVectorsReader();
			if (termVectorsReader == null) {
				return null;
			}
			this.checkBounds(docID);
			return termVectorsReader.get(docID);
		},
		checkBounds: function( /* int */ docID) {
			if (docID < 0 || docID >= this.maxDoc()) {
				throw new IndexOutOfBoundsException("docID must be >= 0 and < maxDoc=" + this.maxDoc() + " (got docID=" + docID + ")");
			}
		},
		//@Override
		toString: function() {
			// SegmentInfo.toString takes dir and number of
			// *pending* deletions; so we reverse compute that here:
			return this.si.toString(this.si.info.dir, this.si.info.getDocCount() - this.numDocs - this.si.getDelCount());
		},
		/**
		 * Return the name of the segment this reader is reading.
		 */
		getSegmentName: function() {
			return this.si.info.name;
		},
		/**
		 * Return the SegmentInfoPerCommit of the segment this reader is reading.
		 */
		//SegmentInfoPerCommit
		getSegmentInfo: function() {
			return this.si;
		},
		/** Returns the directory this index resides in. */
		//Directory
		directory: function() {
			// Don't ensureOpen here -- in certain cases, when a
			// cloned/reopened reader needs to commit, it may call
			// this method on the closed original reader
			return this.si.info.dir;
		},
		// This is necessary so that cloned SegmentReaders (which
		// share the underlying postings data) will map to the
		// same entry in the FieldCache.  See LUCENE-1579.
		//@Override
		getCoreCacheKey: function() {
			return this.core;
		},
		//@Override
		getCombinedCoreAndDeletesKey: function() {
			return this;
		},
		/** Returns term infos index divisor originally passed to
		 *  {@link #SegmentReader(SegmentInfoPerCommit, int, IOContext)}. */
		getTermInfosIndexDivisor: function() {
			return this.core.termsIndexDivisor;
		},
		//@Override
		//return NumericDocValues
		getNumericDocValues: function( /* String */ field) {
			this.ensureOpen();
			return this.core.getNumericDocValues(field);
		},
		//@Override
		//BinaryDocValues
		getBinaryDocValues: function( /* String */ field) {
			this.ensureOpen();
			return this.core.getBinaryDocValues(field);
		},
		//@Override
		//SortedDocValues
		getSortedDocValues: function( /* String */ field) {
			this.ensureOpen();
			return this.core.getSortedDocValues(field);
		},
		//@Override
		//@return SortedSetDocValues
		getSortedSetDocValues: function( /* String */ field) {
			this.ensureOpen();
			return this.core.getSortedSetDocValues(field);
		},
		//@Override
		//NumericDocValues
		getNormValues: function( /* String */ field) {
			this.ensureOpen();
			return this.core.getNormValues(field);
		},
		/** Expert: adds a CoreClosedListener to this reader's shared core */
		addCoreClosedListener: function( /* CoreClosedListener */ listener) {
			this.ensureOpen();
			this.core.addCoreClosedListener(listener);
		},
		/** Expert: removes a CoreClosedListener from this reader's shared core */
		removeCoreClosedListener: function( /* CoreClosedListener */ listener) {
			this.ensureOpen();
			this.core.removeCoreClosedListener(listener);
		}
	}
});
/**
 * Called when the shared core for this SegmentReader
 * is closed.
 * <p>
 * This listener is called only once all SegmentReaders
 * sharing the same core are closed.  At this point it
 * is safe for apps to evict this reader from any caches
 * keyed on {@link #getCoreCacheKey}.  This is the same
 * interface that {@link FieldCache} uses, internally,
 * to evict entries.</p>
 *
 * @lucene.experimental
 */
var CoreClosedListener = defineInterface({
	name: "CoreClosedListener",
	methods: {
		/** Invoked when the shared core of the provided {@link
		 *  SegmentReader} has closed. */
		onClose: function( /* SegmentReader */ owner) {}
	}
});

console.log("SegmentReader MODULE DONE");

module.exports = exports = SegmentReader;