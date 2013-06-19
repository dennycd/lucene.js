var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var LiveIndexWriterConfig = require('library/lucene/index/LiveIndexWriterConfig.js');
var BufferedDeletesStream = require('library/lucene/index/BufferedDeletesStream.js');
var OpenMode = require('library/lucene/index/IndexWriterConfig.js').OpenMode;
var DirectoryReader = require('library/lucene/index/DirectoryReader.js');
var SegmentInfos = require('library/lucene/index/SegmentInfos.js');
var IndexCommit = require('library/lucene/index/IndexCommit.js');
var DocumentsWriter = require('library/lucene/index/DocumentsWriter.js');
var synchronized = require('library/thread').Synchronized;
var Lockable = require('library/thread').Lockable;
var Constants = require('library/lucene/util/Constants.js');
var IndexFileDeleter = require('library/lucene/index/IndexFileDeleter.js');
var LockObtainFailedException = require('library/lucene/store/LockObtainFailedException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var AlreadyClosedException = require('library/lucene/store/AlreadyClosedException.js');
var IllegalStateException = require('library/lucene/util/IllegalStateException.js');
var ThreadInterruptedException = require('library/lucene/util/ThreadInterruptedException.js');
var MergeTrigger = require('library/lucene/index/MergePolicy.js').MergeTrigger;
var StringBuilder = require('library/lucene/util/StringBuilder.js');
var Collections = require('library/java/util/Collections.js');
var IOUtils = require('library/lucene/util/IOUtils.js');
var Thread = require('library/thread').Thread;
var wait = require('library/thread').sleep; //milisecond sleep
var HashMap = require('library/lucene/util/HashMap.js');

/**

**/
var IndexWriter = defineClass({
	name: "IndexWriter",
	extend: Lockable,
	statics: {
		WRITE_LOCK_NAME: "write.lock",
		//Name of the write lock in the index dir
		UNBOUNDED_MAX_MERGE_SEGMENTS: -1,
	},
	variables: {},
	/**
	 * Constructs a new IndexWriter per the settings given in <code>conf</code>.
	 * Note that the passed in {@link IndexWriterConfig} is
	 * privately cloned; if you need to make subsequent "live"
	 * changes to the configuration use {@link #getConfig}.
	 * <p>
	 *
	 * @param d
	 *          the index directory. The index is either created or appended
	 *          according <code>conf.getOpenMode()</code>.
	 * @param conf
	 *          the configuration settings according to which IndexWriter should
	 *          be initialized.
	 * @throws IOException
	 *           if the directory cannot be read/written to, or if it does not
	 *           exist and <code>conf.getOpenMode()</code> is
	 *           <code>OpenMode.APPEND</code> or if there is any other low-level
	 *           IO error
	 */
	construct: function(d, conf) {
		console.log("IndexWriter::construct");
		
		this.config = new LiveIndexWriterConfig(conf.clone()); console.log("here");
		this.directory = d;
		this.analyzer = this.config.getAnalyzer();  
		this.infoStream = this.config.getInfoStream();
		this.mergePolicy = this.config.getMergePolicy();  
		this.mergePolicy.setIndexWriter(this);
		this.mergeScheduler = this.config.getMergeScheduler(); 
		this.codec = this.config.getCodec();  
		this.bufferedDeletesStream = new BufferedDeletesStream(this.infoStream);
		this.poolReaders = this.config.getReaderPooling();
		this.writeLock = this.directory.makeLock(IndexWriter.WRITE_LOCK_NAME); 
		if (!this.writeLock.obtain(this.config.getWriteLockTimeout())) // obtain write lock
		throw new LockObtainFailedException("Index locked for write: " + this.writeLock);
		var success = false;
		try {
			var mode = this.config.getOpenMode();
			var create;
			if (mode == OpenMode.CREATE) {
				create = true;
			} else if (mode == OpenMode.APPEND) {
				create = false;
			} else {
				// CREATE_OR_APPEND - create only if an index does not exist
				create = !DirectoryReader.indexExists(this.directory);
			}
			// If index is too old, reading the segments will throw
			// IndexFormatTooOldException.
			this.segmentInfos = new SegmentInfos();
			if (create) {
				// Try to read first.  This is to allow create
				// against an index that's currently open for
				// searching.  In this case we write the next
				// segments_N file with no segments:
				try {
					this.segmentInfos.read(this.directory);
					this.segmentInfos.clear();
				} catch (e) {
					// Likely this means it's a fresh directory
					console.log("a fresh directory");
				}
				// Record that we have a change (zero out all
				// segments) pending:
				this.changeCount++;
				this.segmentInfos.changed();
			} else {
				this.segmentInfos.read(this.directory);
				var commit = this.config.getIndexCommit(); //IndexCommit
				if (commit != null) {
					// Swap out all segments, but, keep metadata in
					// SegmentInfos, like version & generation, to
					// preserve write-once.  This is important if
					// readers are open against the future commit
					// points.
					if (commit.getDirectory() != this.directory) throw new IllegalArgumentException("IndexCommit's directory doesn't match my directory");
					var oldInfos = new SegmentInfos();
					oldInfos.read(this.directory, commit.getSegmentsFileName());
					this.segmentInfos.replace(oldInfos);
					this.changeCount++;
					this.segmentInfos.changed();
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "init: loaded commit \"" + commit.getSegmentsFileName() + "\"");
					}
				}
			}
			this.rollbackSegments = this.segmentInfos.createBackupSegmentInfos();
			// start with previous field numbers, but new FieldInfos
			this.globalFieldNumberMap = getFieldNumberMap();
			this.docWriter = new DocumentsWriter(this.codec, this.config, this.directory, this, this.globalFieldNumberMap, this.bufferedDeletesStream);
			// Default deleter (for backwards compatibility) is
			// KeepOnlyLastCommitDeleter:
			var self = this;
			synchronized(this, function() {
				self.deleter = new IndexFileDeleter(self.directory, self.config.getIndexDeletionPolicy(), self.segmentInfos, self.infoStream, self);
			});
			if (this.deleter.startingCommitDeleted) {
				// Deletion policy deleted the "head" commit point.
				// We have to mark ourself as changed so that if we
				// are closed w/o any further changes we write a new
				// segments_N file.
				this.changeCount++;
				this.segmentInfos.changed();
			}
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "init: create=" + create);
				this.messageState();
			}
			success = true;
		} finally {
			if (!success) {
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "init: hit exception on init; releasing write lock");
				}
				try {
					this.writeLock.release();
				} catch (t) {
					// don't mask the original exception
				}
				this.writeLock = null;
			}
		}
	},
	methods: {
		addDocumentWithDoc: function( /* Iterable<? extends IndexableField> */ doc) {
			this.addDocumentWithDocAnalyzer(doc, this.analyzer);
		},
		addDocumentWithDocAnalyzer: function( /* Iterable<? extends IndexableField> */ doc, /* Analyzer */ analyzer) {
			this.updateDocumentWithTermDocAnalyzer(null, doc, analyzer);
		},
		updateDocumentWithTermDoc: function( /* Term */ term, /* Iterable<? extends IndexableField> */ doc) {
			this.ensureOpen();
			this.updateDocumentWithTermDocAnalyzer(term, doc, this.analyzer);
		},
		updateDocumentWithTermDocAnalyzer: function( /* Term */ term, /* Iterable<? extends IndexableField> */ doc, /* Analyzer */ analyzer) {
			this.ensureOpen();
			try {
				var success = false;
				var anySegmentFlushed = false;
				try {
					anySegmentFlushed = this.docWriter.updateDocument(doc, analyzer, term);
					success = true;
				} finally {
					if (!success) {
						if (this.infoStream.isEnabled("IW")) {
							this.infoStream.message("IW", "hit exception updating document");
						}
					}
				}
				if (anySegmentFlushed) {
					this.maybeMerge(MergeTrigger.SEGMENT_FLUSH, IndexWriter.UNBOUNDED_MAX_MERGE_SEGMENTS);
				}
			} catch (oom) { //OutOfMemoryError
				this.handleOOM(oom, "updateDocument");
			}
		},
		maybeMerge: function(trigger, maxNumSegments) {
			this.ensureOpen(false);
			this.updatePendingMerges(trigger, maxNumSegments);
			this.mergeScheduler.merge(this);
		},
		updatePendingMerges: function(trigger, maxNumSegments) {
			assert(maxNumSegments == -1 || maxNumSegments > 0);
			assert(trigger != null);
			if (this.stopMerges) {
				return;
			}
			// Do not start new merges if we've hit OOME
			if (this.hitOOM) {
				return;
			}
			var spec = null;
			//final MergePolicy.MergeSpecification spec;
			if (maxNumSegments != IndexWriter.UNBOUNDED_MAX_MERGE_SEGMENTS) {
				assert(trigger == MergeTrigger.EXPLICIT || trigger == MergeTrigger.MERGE_FINISHED, 
							"Expected EXPLICT or MERGE_FINISHED as trigger even with maxNumSegments set but was: " + trigger.name());
							
				spec = this.mergePolicy.findForcedMerges(this.segmentInfos, maxNumSegments, Collections.unmodifiableMap(this.segmentsToMerge));
				if (spec != null) {
					var numMerges = spec.merges.size();
					for (var i = 0; i < numMerges; i++) {
						var merge = spec.merges.get(i); //final MergePolicy.OneMerge merge = spec.merges.get(i);
						merge.maxNumSegments = maxNumSegments;
					}
				}
			} else {
				spec = this.mergePolicy.findMerges(trigger, this.segmentInfos);
			}
			if (spec != null) {
				var numMerges = spec.merges.size();
				for (var i = 0; i < numMerges; i++) {
					this.registerMerge(spec.merges.get(i));
				}
			}
		},
		handleOOM: function(oom, location) {
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "hit OutOfMemoryError inside " + location);
			}
			this.hitOOM = true;
			throw oom;
		},
		/**
		 * Used internally to throw an {@link AlreadyClosedException} if this
		 * IndexWriter has been closed or is in the process of closing.
		 *
		 * @param failIfClosing
		 *          if true, also fail when {@code IndexWriter} is in the process of
		 *          closing ({@code closing=true}) but not yet done closing (
		 *          {@code closed=false})
		 * @throws AlreadyClosedException
		 *           if this IndexWriter is closed or in the process of closing
		 */
		ensureOpen: function(failIfClosing) {
			if (this.closed || (failIfClosing && this.closing)) {
				throw new AlreadyClosedException("this IndexWriter is closed");
			}
		},
		/**
		 * Returns a {@link LiveIndexWriterConfig}, which can be used to query the IndexWriter
		 * current settings, as well as modify "live" ones.
		 */
		getConfig: function() {
			this.ensureOpen(false);
			return this.config;
		},
		messageState: function() {
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "\ndir=" + this.directory + "\n" + "index=" + this.segString() + "\n" + "version=" + Constants.LUCENE_VERSION + "\n" + this.config.toString());
			}
		},
		/** Returns a string description of all segments, for
		 *  debugging.
		 *
		 * @lucene.internal */
		segString: function() {
			return ""; //segString(segmentInfos);
		},
		/** Checks whether this merge involves any segments
		 *  already participating in a merge.  If not, this merge
		 *  is "registered", meaning we record that its segments
		 *  are now participating in a merge, and true is
		 *  returned.  Else (the merge conflicts) false is
		 *  returned. */
		registerMerge: function( /* MergePolicy.OneMerge */ merge) /*  throws IOException  */
		{
			if (merge.registerDone) {
				return true;
			}
			assert(merge.segments.size() > 0);
			if (this.stopMerges) {
				merge.abort();
				throw new MergePolicy.MergeAbortedException("merge is aborted: " + this.segString(merge.segments));
			}
			var isExternal = false;
			for ( /* SegmentInfoPerCommit */
			var info in merge.segments) {
				if (this.mergingSegments.contains(info)) {
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "reject merge " + this.segString(merge.segments) + ": segment " + this.segString(info) + " is already marked for merge");
					}
					return false;
				}
				if (!this.segmentInfos.contains(info)) {
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "reject merge " + this.segString(merge.segments) + ": segment " + this.segString(info) + " does not exist in live infos");
					}
					return false;
				}
				if (info.info.dir != this.directory) {
					isExternal = true;
				}
				if (this.segmentsToMerge.containsKey(info)) {
					merge.maxNumSegments = this.mergeMaxNumSegments;
				}
			}
			this.ensureValidMerge(merge);
			this.pendingMerges.add(merge);
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "add merge to pendingMerges: " + this.segString(merge.segments) + " [total " + this.pendingMerges.size() + " pending]");
			}
			merge.mergeGen = this.mergeGen;
			merge.isExternal = isExternal;
			// OK it does not conflict; now record that this merge
			// is running (while synchronized) to avoid race
			// condition where two conflicting merges from different
			// threads, start
			if (this.infoStream.isEnabled("IW")) {
				var builder = new StringBuilder("registerMerge merging= [");
				for ( /* SegmentInfoPerCommit */
				var info in this.mergingSegments) {
					builder.append(info.info.name).append(", ");
				}
				builder.append("]");
				// don't call mergingSegments.toString() could lead to ConcurrentModException
				// since merge updates the segments FieldInfos
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", builder.toString());
				}
			}
			for ( /* SegmentInfoPerCommit */
			var info in merge.segments) {
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "registerMerge info=" + this.segString(info));
				}
				this.mergingSegments.add(info);
			}
			assert(merge.estimatedMergeBytes == 0);
			assert(merge.totalMergeBytes == 0);
			for ( /* SegmentInfoPerCommit */
			var info in merge.segments) {
				if (info.info.getDocCount() > 0) {
					var delCount = this.numDeletedDocs(info);
					assert(delCount <= info.info.getDocCount());
					var delRatio = delCount / info.info.getDocCount(); //((double) delCount)/info.info.getDocCount();
					merge.estimatedMergeBytes += info.sizeInBytes() * (1.0 - delRatio);
					merge.totalMergeBytes += info.sizeInBytes();
				}
			}
			// Merge is now registered
			merge.registerDone = true;
			return true;
		},
		ensureValidMerge: function( /* MergePolicy.OneMerge */ merge) {
			for ( /* SegmentInfoPerCommit */
			var info in merge.segments) {
				if (!this.segmentInfos.contains(info)) {
					throw new MergePolicy.MergeException("MergePolicy selected a segment (" + info.info.name + ") that is not in the current index " + this.segString(), this.directory);
				}
			}
		},
		/**
		 * Obtain the number of deleted docs for a pooled reader.
		 * If the reader isn't being pooled, the segmentInfo's
		 * delCount is returned.
		 */
		numDeletedDocs: function( /* SegmentInfoPerCommit */ info) {
			this.ensureOpen(false);
			var delCount = info.getDelCount(); /* final ReadersAndLiveDocs */
			var rld = this.readerPool.get(info, false);
			if (rld != null) {
				delCount += rld.getPendingDeleteCount();
			}
			return delCount;
		},
		//@Override
		close$override$1: function() {
			this.close(true);
		},
		close$override$2: function(waitForMerges) {
			// Ensure that only one thread actually gets to do the
			// closing, and make sure no commit is also in progress:	
			var self = this;
			synchronized(this.commitLock, function() {
				if (shouldClose()) {
					// If any methods have hit OutOfMemoryError, then abort
					// on close, in case the internal state of IndexWriter
					// or DocumentsWriter is corrupt
					if (self.hitOOM) {
						self.rollbackInternal();
					} else {
						self.closeInternal(waitForMerges, true);
					}
				}
			});
		},
		rollbackInternal: function() {
			var self = this;
			var success = false;
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "rollback");
			}
			try {
				synchronized(this, function() {
					self.finishMerges(false);
					self.stopMerges = true;
				});
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "rollback: done finish merges");
				}
				// Must pre-close these two, in case they increment
				// changeCount so that we can then set it to false
				// before calling closeInternal
				this.mergePolicy.close();
				this.mergeScheduler.close();
				this.bufferedDeletesStream.clear();
				this.docWriter.close(); // mark it as closed first to prevent subsequent indexing actions/flushes 
				this.docWriter.abort();
				synchronized(this, function() {
					if (self.pendingCommit != null) {
						self.pendingCommit.rollbackCommit(self.directory);
						self.deleter.decRef(self.pendingCommit);
						self.pendingCommit = null;
						//notifyAll();
						console.log("TODO - notifyAll() commented out here...");
					}
					// Don't bother saving any changes in our segmentInfos
					self.readerPool.dropAll(false);
					// Keep the same segmentInfos instance but replace all
					// of its SegmentInfo instances.  This is so the next
					// attempt to commit using this instance of IndexWriter
					// will always write to a new generation ("write
					// once").
					self.segmentInfos.rollbackSegmentInfos(self.rollbackSegments);
					if (self.infoStream.isEnabled("IW")) {
						self.infoStream.message("IW", "rollback: infos=" + self.segString(self.segmentInfos));
					}
					assert(self.testPoint("rollback before checkpoint"));
					// Ask deleter to locate unreferenced files & remove
					// them:
					self.deleter.checkpoint(self.segmentInfos, false);
					self.deleter.refresh();
					self.lastCommitChangeCount = this.changeCount;
				});
				success = true;
			} catch ( /* OutOfMemoryError */ oom) {
				this.handleOOM(oom, "rollbackInternal");
			} finally {
				synchronized(this, function() {
					if (!success) {
						self.closing = false;
						//notifyAll(); 
						console.log("TODO - notifyAll() commented out here...");
						if (self.infoStream.isEnabled("IW")) {
							self.infoStream.message("IW", "hit exception during rollback");
						}
					}
				});
			}
			this.closeInternal(false, false);
		},
		// Used only by assert for testing.  Current points:
		//   startDoFlush
		//   startCommitMerge
		//   startStartCommit
		//   midStartCommit
		//   midStartCommit2
		//   midStartCommitSuccess
		//   finishStartCommit
		//   startCommitMergeDeletes
		//   startMergeInit
		//   DocumentsWriter.ThreadState.init start
		testPoint: function(name) {
			return true;
		},
		closeInternal: function( /* boolean */ waitForMerges, /* boolean */ doFlush) {
			var self = this;
			var interrupted = false;
			try {
				if (this.pendingCommit != null) {
					throw new IllegalStateException("cannot close: prepareCommit was already called with no corresponding call to commit");
				}
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "now flush at close waitForMerges=" + waitForMerges);
				}
				this.docWriter.close();
				try {
					// Only allow a new merge to be triggered if we are
					// going to wait for merges:
					if (doFlush) {
						this.flush(waitForMerges, true);
					} else {
						this.docWriter.abort(); // already closed
					}
				} finally {
					try {
						// clean up merge scheduler in all cases, although flushing may have failed:
						interrupted = Thread.interrupted();
						if (waitForMerges) {
							try {
								// Give merge scheduler last chance to run, in case
								// any pending merges are waiting:
								this.mergeScheduler.merge(this);
							} catch ( /* ThreadInterruptedException */ tie) {
								// ignore any interruption, does not matter
								interrupted = true;
								if (this.infoStream.isEnabled("IW")) {
									this.infoStream.message("IW", "interrupted while waiting for final merges");
								}
							}
						}
						synchronized(this, function() {
							for (;;) {
								try {
									self.finishMerges(waitForMerges && !interrupted);
									break;
								} catch ( /* ThreadInterruptedException */ tie) {
									// by setting the interrupted status, the
									// next call to finishMerges will pass false,
									// so it will not wait
									interrupted = true;
									if (this.infoStream.isEnabled("IW")) {
										this.infoStream.message("IW", "interrupted while waiting for merges to finish");
									}
								}
							}
							this.stopMerges = true;
						});
					} finally {
						// shutdown policy, scheduler and all threads (this call is not interruptible):
						IOUtils.closeWhileHandlingException(this.mergePolicy, this.mergeScheduler);
					}
				}
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "now call final commit()");
				}
				if (doFlush) {
					this.commitInternal();
				}
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "at close: " + this.segString());
				}
				// used by assert below
				oldWriter = this.docWriter;
				synchronized(this, function() {
					self.readerPool.dropAll(true);
					self.docWriter = null;
					self.deleter.close();
				});
				if (this.writeLock != null) {
					this.writeLock.release(); // release write lock
					this.writeLock = null;
				}
				synchronized(this, function() {
					self.closed = true;
				});
				assert(oldWriter.perThreadPool.numDeactivatedThreadStates() == oldWriter.perThreadPool.getMaxThreadStates());
			} catch ( /* OutOfMemoryError */ oom) {
				this.handleOOM(oom, "closeInternal");
			} finally {
				synchronized(this, function() {
					self.closing = false;
					console.log("TODO - notifyALL"); //notifyAll();
					if (!self.closed) {
						if (self.infoStream.isEnabled("IW")) {
							self.infoStream.message("IW", "hit exception while closing");
						}
					}
				});
				// finally, restore interrupt status:
				if (interrupted) Thread.currentThread().interrupt();
			}
		},
		/**
		 * Flush all in-memory buffered updates (adds and deletes)
		 * to the Directory.
		 * @param triggerMerge if true, we may merge segments (if
		 *  deletes or docs were flushed) if necessary
		 * @param applyAllDeletes whether pending deletes should also
		 */
		flush: function( /* boolean */ triggerMerge, /* boolean */ applyAllDeletes) {
			// NOTE: this method cannot be sync'd because
			// maybeMerge() in turn calls mergeScheduler.merge which
			// in turn can take a long time to run and we don't want
			// to hold the lock for that.  In the case of
			// ConcurrentMergeScheduler this can lead to deadlock
			// when it stalls due to too many running merges.
			// We can be called during close, when closing==true, so we must pass false to ensureOpen:
			this.ensureOpen(false);
			if (this.doFlush(applyAllDeletes) && triggerMerge) {
				this.maybeMerge(MergeTrigger.FULL_FLUSH, IndexWriter.UNBOUNDED_MAX_MERGE_SEGMENTS);
			}
		},
		finishMerges: function( /* boolean */ waitForMerges) {
			if (!waitForMerges) {
				this.stopMerges = true;
				// Abort all pending & running merges:
				for ( /* MergePolicy.OneMerge */
				var merge in this.pendingMerges) {
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "now abort pending merge " + this.segString(merge.segments));
					}
					merge.abort();
					this.mergeFinish(merge);
				}
				this.pendingMerges.clear();
				for ( /* MergePolicy.OneMerge */
				var merge in this.runningMerges) {
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "now abort running merge " + this.segString(merge.segments));
					}
					merge.abort();
				}
				// These merges periodically check whether they have
				// been aborted, and stop if so.  We wait here to make
				// sure they all stop.  It should not take very long
				// because the merge threads periodically check if
				// they are aborted.
				while (this.runningMerges.size() > 0) {
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "now wait for " + this.runningMerges.size() + " running merge/s to abort");
					}
					doWait();
				}
				this.stopMerges = false;
				//notifyAll();
				console.log("TODO notifyALL---");
				assert(0 == this.mergingSegments.size());
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "all running merges have aborted");
				}
			} else {
				// waitForMerges() will ensure any running addIndexes finishes.
				// It's fine if a new one attempts to start because from our
				// caller above the call will see that we are in the
				// process of closing, and will throw an
				// AlreadyClosedException.
				this.waitForMerges();
			}
		},
		/**
		 * Wait for any currently outstanding merges to finish.
		 *
		 * <p>It is guaranteed that any merges started prior to calling this method
		 *    will have completed once this method completes.</p>
		 */
		waitForMerges: function() {
			this.ensureOpen(false);
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "waitForMerges");
			}
			while (this.pendingMerges.size() > 0 || this.runningMerges.size() > 0) {
				this.doWait();
			}
			// sanity check
			assert(0 == mergingSegments.size());
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "waitForMerges done");
			}
		},
		doWait: function() {
			// NOTE: the callers of this method should in theory
			// be able to do simply wait(), but, as a defense
			// against thread timing hazards where notifyAll()
			// fails to be called, we wait for at most 1 second
			// and then return so caller can check if wait
			// conditions are satisfied:
			try {
				wait(1000);
			} catch ( /* InterruptedException */ ie) {
				throw new ThreadInterruptedException(ie);
			}
		},
		/** Does fininishing for a merge, which is fast but holds
		 *  the synchronized lock on IndexWriter instance. */
		mergeFinish: function( /* MergePolicy.OneMerge */ merge) {
			// forceMerge, addIndexes or finishMerges may be waiting
			// on merges to finish.
			//notifyAll(); 
			console.log("TODO - notifyALL");
			// It's possible we are called twice, eg if there was an
			// exception inside mergeInit
			if (merge.registerDone) {
				var sourceSegments = merge.segments; //final List<SegmentInfoPerCommit> sourceSegments = merge.segments;
				for ( /* SegmentInfoPerCommit */
				var info in sourceSegments) {
					this.mergingSegments.remove(info);
				}
				merge.registerDone = false;
			}
			this.runningMerges.remove(merge);
		},
		commitInternal: function() {
			var self = this;
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "commit: start");
			}
			synchronized(this.commitLock, function() {
				self.ensureOpen(false);
				if (self.infoStream.isEnabled("IW")) {
					self.infoStream.message("IW", "commit: enter lock");
				}
				if (self.pendingCommit == null) {
					if (self.infoStream.isEnabled("IW")) {
						self.infoStream.message("IW", "commit: now prepare");
					}
					self.prepareCommitInternal();
				} else {
					if (self.infoStream.isEnabled("IW")) {
						self.infoStream.message("IW", "commit: already prepared");
					}
				}
				self.finishCommit();
			});
		},
		finishCommit: function() {
			if (this.pendingCommit != null) {
				try {
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "commit: pendingCommit != null");
					}
					this.pendingCommit.finishCommit(this.directory);
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "commit: wrote segments file \"" + this.pendingCommit.getSegmentsFileName() + "\"");
					}
					this.lastCommitChangeCount = this.pendingCommitChangeCount;
					this.segmentInfos.updateGeneration(this.pendingCommit);
					this.rollbackSegments = this.pendingCommit.createBackupSegmentInfos();
					this.deleter.checkpoint(this.pendingCommit, true);
				} finally {
					// Matches the incRef done in prepareCommit:
					this.deleter.decRef(this.filesToCommit);
					this.filesToCommit = null;
					this.pendingCommit = null;
					//notifyAll();
					console.log("TODO- notifyall");
				}
			} else {
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "commit: pendingCommit == null; skip");
				}
			}
			if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "commit: done");
			}
		},
		prepareCommitInternal: function() {
			var self = this;
			synchronized(this.commitLock, function() {
				self.ensureOpen(false);
				if (self.infoStream.isEnabled("IW")) {
					self.infoStream.message("IW", "prepareCommit: flush");
					self.infoStream.message("IW", "  index before flush " + self.segString());
				}
				if (self.hitOOM) {
					throw new IllegalStateException("this writer hit an OutOfMemoryError; cannot commit");
				}
				if (self.pendingCommit != null) {
					throw new IllegalStateException("prepareCommit was already called with no corresponding call to commit");
				}
				self.doBeforeFlush();
				assert(testPoint("startDoFlush"));
				var toCommit = null; /* SegmentInfos */
				var anySegmentsFlushed = false;
				// This is copied from doFlush, except it's modified to
				// clone & incRef the flushed SegmentInfos inside the
				// sync block:
				try {
					synchronized(self.fullFlushLock, function() {
						var flushSuccess = false;
						var success = false;
						try {
							anySegmentsFlushed = self.docWriter.flushAllThreads();
							if (!anySegmentsFlushed) {
								// prevent double increment since docWriter#doFlush increments the flushcount
								// if we flushed anything.
								self.flushCount.incrementAndGet();
							}
							flushSuccess = true;
							synchronized(this, function() {
								self.maybeApplyDeletes(true);
								self.readerPool.commit(segmentInfos);
								// Must clone the segmentInfos while we still
								// hold fullFlushLock and while sync'd so that
								// no partial changes (eg a delete w/o
								// corresponding add from an updateDocument) can
								// sneak into the commit point:
								toCommit = segmentInfos.clone();
								self.pendingCommitChangeCount = self.changeCount;
								// This protects the segmentInfos we are now going
								// to commit.  This is important in case, eg, while
								// we are trying to sync all referenced files, a
								// merge completes which would otherwise have
								// removed the files we are now syncing.    
								self.filesToCommit = toCommit.files(self.directory, false);
								self.deleter.incRef(self.filesToCommit);
							});
							success = true;
						} finally {
							if (!success) {
								if (self.infoStream.isEnabled("IW")) {
									self.infoStream.message("IW", "hit exception during prepareCommit");
								}
							}
							// Done: finish the full flush!
							self.docWriter.finishFullFlush(flushSuccess);
							self.doAfterFlush();
						}
					});
				} catch ( /* OutOfMemoryError */ oom) {
					self.handleOOM(oom, "prepareCommit");
				}
				var success = false;
				try {
					if (anySegmentsFlushed) {
						self.maybeMerge(MergeTrigger.FULL_FLUSH, IndexWriter.UNBOUNDED_MAX_MERGE_SEGMENTS);
					}
					success = true;
				} finally {
					if (!success) {
						synchronized(this, function() {
							self.deleter.decRef(self.filesToCommit);
							self.filesToCommit = null;
						}); //sync
					}
				}
				self.startCommit(toCommit);
			}); //sync block
		},
		/** Walk through all files referenced by the current
		 *  segmentInfos and ask the Directory to sync each file,
		 *  if it wasn't already.  If that succeeds, then we
		 *  prepare a new segments_N file but do not fully commit
		 *  it. */
		startCommit: function( /* SegmentInfos */ toSync) {
			var self = this;
			assert(this.testPoint("startStartCommit"));
			assert(this.pendingCommit == null);
			if (this.hitOOM) {
				throw new IllegalStateException("this writer hit an OutOfMemoryError; cannot commit");
			}
			try {
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "startCommit(): start");
				}
				synchronized(this, function() {
					assert(self.lastCommitChangeCount <= self.changeCount, "lastCommitChangeCount=" + self.lastCommitChangeCount + " changeCount=" + self.changeCount);
					if (self.pendingCommitChangeCount == self.lastCommitChangeCount) {
						if (self.infoStream.isEnabled("IW")) {
							self.infoStream.message("IW", "  skip startCommit(): no changes pending");
						}
						self.deleter.decRef(self.filesToCommit);
						self.filesToCommit = null;
						return;
					}
					if (self.infoStream.isEnabled("IW")) {
						self.infoStream.message("IW", "startCommit index=" + self.segString(self.toLiveInfos(toSync)) + " changeCount=" + self.changeCount);
					}
					assert(self.filesExist(toSync));
				});
				assert(this.testPoint("midStartCommit"));
				var pendingCommitSet = false;
				try {
					assert(this.testPoint("midStartCommit2"));
					synchronized(this, function() {
						assert(self.pendingCommit == null);
						assert(self.segmentInfos.getGeneration() == toSync.getGeneration());
						// Exception here means nothing is prepared
						// (this method unwinds everything it did on
						// an exception)
						toSync.prepareCommit(self.directory);
						//System.out.println("DONE prepareCommit");
						self.pendingCommitSet = true;
						self.pendingCommit = toSync;
					});
					// This call can take a long time -- 10s of seconds
					// or more.  We do it without syncing on this:
					var success = false;
					var filesToSync; //final Collection<String>
					try {
						filesToSync = toSync.files(this.directory, false);
						this.directory.sync(filesToSync);
						success = true;
					} finally {
						if (!success) {
							this.pendingCommitSet = false;
							this.pendingCommit = null;
							toSync.rollbackCommit(this.directory);
						}
					}
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "done all syncs: " + filesToSync);
					}
					assert(testPoint("midStartCommitSuccess"));
				} finally {
					synchronized(this, function() {
						// Have our master segmentInfos record the
						// generations we just prepared.  We do this
						// on error or success so we don't
						// double-write a segments_N file.
						self.segmentInfos.updateGeneration(toSync);
						if (!self.pendingCommitSet) {
							if (self.infoStream.isEnabled("IW")) {
								self.infoStream.message("IW", "hit exception committing segments file");
							}
							// Hit exception
							self.deleter.decRef(self.filesToCommit);
							self.filesToCommit = null;
						}
					});
				}
			} catch ( /* OutOfMemoryError */ oom) {
				this.handleOOM(oom, "startCommit");
			}
			assert(testPoint("finishStartCommit"));
		},
		// called only from assert
		filesExist: function( /* SegmentInfos */ toSync) {
			var files = toSync.files(this.directory, false); //Collection<String>
			for (var fileName in files) {
				assert(this.directory.fileExists(fileName), "file " + fileName + " does not exist");
				// If this trips it means we are missing a call to
				// .checkpoint somewhere, because by the time we
				// are called, deleter should know about every
				// file referenced by the current head
				// segmentInfos:
				assert(this.deleter.exists(fileName), "IndexFileDeleter doesn't know about file " + fileName);
			}
			return true;
		},
		// For infoStream output
		toLiveInfos: function( /* SegmentInfos */ sis) {
			var newSIS = new SegmentInfos();
			var liveSIS = new HashMap(); //HashMap<SegmentInfoPerCommit,SegmentInfoPerCommit>();        
			for ( /* SegmentInfoPerCommit */
			var info in this.segmentInfos) {
				liveSIS.put(info, info);
			}
			for ( /* SegmentInfoPerCommit */
			var info in sis) { /* SegmentInfoPerCommit */
				var liveInfo = liveSIS.get(info);
				if (liveInfo != null) {
					info = liveInfo;
				}
				newSIS.add(info);
			}
			return newSIS;
		},
		maybeApplyDeletes: function(applyAllDeletes) {
			if (applyAllDeletes) {
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "apply all deletes during flush");
				}
				this.applyAllDeletes();
			} else if (this.infoStream.isEnabled("IW")) {
				this.infoStream.message("IW", "don't apply deletes now delTermCount=" + this.bufferedDeletesStream.numTerms() + " bytesUsed=" + this.bufferedDeletesStream.bytesUsed());
			}
		},
		applyAllDeletes: function() {
			this.flushDeletesCount.incrementAndGet();
			var result; //final BufferedDeletesStream.ApplyDeletesResult
			result = this.bufferedDeletesStream.applyDeletes(this.readerPool, this.segmentInfos.asList());
			if (result.anyDeletes) {
				this.checkpoint();
			}
			if (!this.keepFullyDeletedSegments && result.allDeleted != null) {
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "drop 100% deleted segments: " + this.segString(result.allDeleted));
				}
				for ( /* SegmentInfoPerCommit */
				var info in result.allDeleted) {
					// If a merge has already registered for this
					// segment, we leave it in the readerPool; the
					// merge will skip merging it and will then drop
					// it once it's done:
					if (!this.mergingSegments.contains(info)) {
						this.segmentInfos.remove(info);
						this.readerPool.drop(info);
					}
				}
				this.checkpoint();
			}
			this.bufferedDeletesStream.prune(this.segmentInfos);
		},
		/**
		 * Called whenever the SegmentInfos has been updated and
		 * the index files referenced exist (correctly) in the
		 * index directory.
		 */
		checkpoint: function() {
			this.changeCount++;
			this.segmentInfos.changed();
			this.deleter.checkpoint(this.segmentInfos, false);
		},
		/**
		 * A hook for extending classes to execute operations after pending added and
		 * deleted documents have been flushed to the Directory but before the change
		 * is committed (new segments_N file written).
		 */
		doAfterFlush: function() {},
		/**
		 * A hook for extending classes to execute operations before pending added and
		 * deleted documents are flushed to the Directory.
		 */
		doBeforeFlush: function() {},
		doFlush: function(applyAllDeletes) {
			var self = this;
			if (this.hitOOM) {
				throw new IllegalStateException("this writer hit an OutOfMemoryError; cannot flush");
			}
			this.doBeforeFlush();
			assert(this.testPoint("startDoFlush"));
			var success = false;
			try {
				if (this.infoStream.isEnabled("IW")) {
					this.infoStream.message("IW", "  start flush: applyAllDeletes=" + applyAllDeletes);
					this.infoStream.message("IW", "  index before flush " + this.segString());
				}
				var anySegmentFlushed;
				synchronized(this.fullFlushLock, function() {
					var flushSuccess = false;
					try {
						anySegmentFlushed = self.docWriter.flushAllThreads();
						flushSuccess = true;
					} finally {
						self.docWriter.finishFullFlush(flushSuccess);
					}
				});
				synchronized(this, function() {
					self.maybeApplyDeletes(applyAllDeletes);
					self.doAfterFlush();
					if (!anySegmentFlushed) {
						// flushCount is incremented in flushAllThreads
						self.flushCount.incrementAndGet();
					}
					success = true;
					return anySegmentFlushed;
				});
			} catch ( /* OutOfMemoryError */ oom) {
				this.handleOOM(oom, "doFlush");
				// never hit
				return false;
			} finally {
				if (!success) {
					if (this.infoStream.isEnabled("IW")) {
						this.infoStream.message("IW", "hit exception during flush");
					}
				}
			}
		},
	}
});
module.exports = exports = IndexWriter;