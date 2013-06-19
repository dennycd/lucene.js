var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');


var IndexSearcher = require('library/lucene/search/IndexSearcher.js');


var InfoStream = require('library/lucene/util/InfoStream.js');
var PrintStreamInfoStream = require('library/lucene/util/PrintStreamInfoStream.js');
var Cloneable = require('library/lucene/util/Cloneable.js');


var RuntimeException = require('library/lucene/util/RuntimeException.js');
var NullPointerException = require('library/lucene/util/NullPointerException.js');
var IllegalStateException = require('library/lucene/util/IllegalStateException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');

var LiveIndexWriterConfig = require('library/lucene/index/LiveIndexWriterConfig.js');
var DirectoryReader = require('library/lucene/index/DirectoryReader.js');
var KeepOnlyLastCommitDeletionPolicy = require('library/lucene/index/KeepOnlyLastCommitDeletionPolicy.js');
var ThreadAffinityDocumentsWriterThreadPool = require('library/lucene/index/ThreadAffinityDocumentsWriterThreadPool.js');
var DocumentsWriterPerThread = require('library/lucene/index/DocumentsWriterPerThread.js');
var LogByteSizeMergePolicy = require('library/lucene/index/LogByteSizeMergePolicy.js');
var ConcurrentMergeScheduler = require('library/lucene/index/ConcurrentMergeScheduler.js');


/**
 * Specifies the open mode for {@link IndexWriter}.
 */
var OpenMode = {
	/** 
	 * Creates a new index or overwrites an existing one.
	 */
	CREATE: "CREATE",
	/** 
	 * Opens an existing index.
	 */
	APPEND: "APPEND",
	/** 
	 * Creates a new index if one does not exist,
	 * otherwise it opens the index and documents will be appended.
	 */
	CREATE_OR_APPEND: "CREATE_OR_APPEND"
};
/**
 * Holds all the configuration that is used to create an {@link IndexWriter}.
 * Once {@link IndexWriter} has been created with this object, changes to this
 * object will not affect the {@link IndexWriter} instance. For that, use
 * {@link LiveIndexWriterConfig} that is returned from {@link IndexWriter#getConfig()}.
 *
 * <p>
 * All setter methods return {@link IndexWriterConfig} to allow chaining
 * settings conveniently, for example:
 *
 * <pre class="prettyprint">
 * IndexWriterConfig conf = new IndexWriterConfig(analyzer);
 * conf.setter1().setter2();
 * </pre>
 *
 * @see IndexWriter#getConfig()
 *
 * @since 3.1
 */
var IndexWriterConfig = defineClass({
	name: "IndexWriterConfig",
	extend: LiveIndexWriterConfig,
	implement: Cloneable,
	statics: { /** Default value is 32. Change using {@link #setTermIndexInterval(int)}. */
		DEFAULT_TERM_INDEX_INTERVAL: 32,
		// TODO: this should be private to the codec, not settable here
		/** Denotes a flush trigger is disabled. */
		DISABLE_AUTO_FLUSH: -1,
		/** Disabled by default (because IndexWriter flushes by RAM usage by default). */
		DEFAULT_MAX_BUFFERED_DELETE_TERMS: -1, //DISABLE_AUTO_FLUSH,
		/** Disabled by default (because IndexWriter flushes by RAM usage by default). */
		DEFAULT_MAX_BUFFERED_DOCS: -1, //DISABLE_AUTO_FLUSH,
		/**
		 * Default value is 16 MB (which means flush when buffered docs consume
		 * approximately 16 MB RAM).
		 */
		DEFAULT_RAM_BUFFER_SIZE_MB: 16.0,
		/**
		 * Default value for the write lock timeout (1,000 ms).
		 *
		 * @see #setDefaultWriteLockTimeout(long)
		 */
		WRITE_LOCK_TIMEOUT: 1000,
		/** Default setting for {@link #setReaderPooling}. */
		DEFAULT_READER_POOLING: false,
		/** Default value is 1. Change using {@link #setReaderTermsIndexDivisor(int)}. */
		DEFAULT_READER_TERMS_INDEX_DIVISOR: DirectoryReader.DEFAULT_TERMS_INDEX_DIVISOR,
		/** Default value is 1945. Change using {@link #setRAMPerThreadHardLimitMB(int)} */
		DEFAULT_RAM_PER_THREAD_HARD_LIMIT_MB: 1945,
		/** The maximum number of simultaneous threads that may be
		 *  indexing documents at once in IndexWriter; if more
		 *  than this many threads arrive they will wait for
		 *  others to finish. Default value is 8. */
		DEFAULT_MAX_THREAD_STATES: 8,
		/**
		 * Sets the default (for any instance) maximum time to wait for a write lock
		 * (in milliseconds).
		 */
		setDefaultWriteLockTimeout: function(writeLockTimeout) {
			IndexWriterConfig.WRITE_LOCK_TIMEOUT = writeLockTimeout;
		},
		/**
		 * Returns the default write lock timeout for newly instantiated
		 * IndexWriterConfigs.
		 *
		 * @see #setDefaultWriteLockTimeout(long)
		 */
		getDefaultWriteLockTimeout: function() {
			return IndexWriterConfig.WRITE_LOCK_TIMEOUT;
		},
	},
	variables: {},
	/**
	 * Creates a new config that with defaults that match the specified
	 * {@link Version} as well as the default {@link
	 * Analyzer}. If matchVersion is >= {@link
	 * Version#LUCENE_32}, {@link TieredMergePolicy} is used
	 * for merging; else {@link LogByteSizeMergePolicy}.
	 * Note that {@link TieredMergePolicy} is free to select
	 * non-contiguous merges, which means docIDs may not
	 * remain monotonic over time.  If this is a problem you
	 * should switch to {@link LogByteSizeMergePolicy} or
	 * {@link LogDocMergePolicy}.
	 */
	construct: function(matchVersion, analyzer) {
		console.log("IndexWriterConfig::construct");
		LiveIndexWriterConfig.call(this, analyzer, matchVersion);
	},
	methods: {
		//@Override
		clone: function() {
			try {
				var clone = new IndexWriterConfig();
				 //var clone = LiveIndexWriterConfig.prototype.clone.call(this); //(IndexWriterConfig) super.clone();
				// Mostly shallow clone, but do a deepish clone of
				// certain objects that have state that cannot be shared
				// across IW instances:
				clone.flushPolicy = this.flushPolicy.clone();
				clone.indexerThreadPool = this.indexerThreadPool.clone();
				clone.mergePolicy = this.mergePolicy.clone();
				return clone;
			} catch (e) {
				throw new RuntimeException(e);
			}
		},
		/** Specifies {@link OpenMode} of the index.
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setOpenMode: function(openMode) {
			this.openMode = openMode;
			return this;
		},
		//@Override
		getOpenMode: function() {
			return this.openMode;
		},
		/**
		 * Expert: allows an optional {@link IndexDeletionPolicy} implementation to be
		 * specified. You can use this to control when prior commits are deleted from
		 * the index. The default policy is {@link KeepOnlyLastCommitDeletionPolicy}
		 * which removes all prior commits as soon as a new commit is done (this
		 * matches behavior before 2.2). Creating your own policy can allow you to
		 * explicitly keep previous "point in time" commits alive in the index for
		 * some time, to allow readers to refresh to the new commit without having the
		 * old commit deleted out from under them. This is necessary on filesystems
		 * like NFS that do not support "delete on last close" semantics, which
		 * Lucene's "point in time" search normally relies on.
		 * <p>
		 * <b>NOTE:</b> the deletion policy cannot be null. If <code>null</code> is
		 * passed, the deletion policy will be set to the default.
		 *
		 * <p>Only takes effect when IndexWriter is first created.
		 */
		setIndexDeletionPolicy: function(delPolicy) {
			this.delPolicy = delPolicy == null ? new KeepOnlyLastCommitDeletionPolicy() : delPolicy;
			return this;
		},
		//@Override
		getIndexDeletionPolicy: function() {
			return this.delPolicy;
		},
		/**
		 * Expert: allows to open a certain commit point. The default is null which
		 * opens the latest commit point.
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setIndexCommit: function(commit) {
			this.commit = commit;
			return this;
		},
		//@Override
		getIndexCommit: function() {
			return commit;
		},
		/**
		 * Expert: set the {@link Similarity} implementation used by this IndexWriter.
		 * <p>
		 * <b>NOTE:</b> the similarity cannot be null. If <code>null</code> is passed,
		 * the similarity will be set to the default implementation (unspecified).
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setSimilarity: function(similarity) {
			this.similarity = similarity == null ? IndexSearcher.getDefaultSimilarity() : similarity;
			return this;
		},
		//@Override
		getSimilarity: function() {
			return this.similarity;
		},
		/**
		 * Expert: sets the merge scheduler used by this writer. The default is
		 * {@link ConcurrentMergeScheduler}.
		 * <p>
		 * <b>NOTE:</b> the merge scheduler cannot be null. If <code>null</code> is
		 * passed, the merge scheduler will be set to the default.
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setMergeScheduler: function(mergeScheduler) {
			this.mergeScheduler = mergeScheduler == null ? new ConcurrentMergeScheduler() : mergeScheduler;
			return this;
		},
		//@Override
		getMergeScheduler: function() {
			return this.mergeScheduler;
		},
		/**
		 * Sets the maximum time to wait for a write lock (in milliseconds) for this
		 * instance. You can change the default value for all instances by calling
		 * {@link #setDefaultWriteLockTimeout(long)}.
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setWriteLockTimeout: function(writeLockTimeout) {
			this.writeLockTimeout = writeLockTimeout;
			return this;
		},
		//@Override
		getWriteLockTimeout: function() {
			return this.writeLockTimeout;
		},
		/**
		 * Expert: {@link MergePolicy} is invoked whenever there are changes to the
		 * segments in the index. Its role is to select which merges to do, if any,
		 * and return a {@link MergePolicy.MergeSpecification} describing the merges.
		 * It also selects merges to do for forceMerge. (The default is
		 * {@link LogByteSizeMergePolicy}.
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setMergePolicy: function(mergePolicy) {
			this.mergePolicy = mergePolicy == null ? new LogByteSizeMergePolicy() : mergePolicy;
			return this;
		},
		/**
		 * Set the {@link Codec}.
		 *
		 * <p>
		 * Only takes effect when IndexWriter is first created.
		 */
		setCodec: function(codec) {
			if (codec == null) {
				throw new NullPointerException();
			}
			this.codec = codec;
			return this;
		},
		//@Override
		getCodec: function() {
			return this.codec;
		},
		// @Override
		getMergePolicy: function() {
			return this.mergePolicy;
		},
		/** Expert: Sets the {@link DocumentsWriterPerThreadPool} instance used by the
		 * IndexWriter to assign thread-states to incoming indexing threads. If no
		 * {@link DocumentsWriterPerThreadPool} is set {@link IndexWriter} will use
		 * {@link ThreadAffinityDocumentsWriterThreadPool} with max number of
		 * thread-states set to {@link #DEFAULT_MAX_THREAD_STATES} (see
		 * {@link #DEFAULT_MAX_THREAD_STATES}).
		 * </p>
		 * <p>
		 * NOTE: The given {@link DocumentsWriterPerThreadPool} instance must not be used with
		 * other {@link IndexWriter} instances once it has been initialized / associated with an
		 * {@link IndexWriter}.
		 * </p>
		 * <p>
		 * NOTE: This only takes effect when IndexWriter is first created.</p>*/
		setIndexerThreadPool: function(threadPool) {
			if (threadPool == null) {
				throw new IllegalArgumentException("threadPool must not be null");
			}
			this.indexerThreadPool = threadPool;
			return this;
		},
		//@Override
		getIndexerThreadPool: function() {
			return this.indexerThreadPool;
		},
		/**
		 * Sets the max number of simultaneous threads that may be indexing documents
		 * at once in IndexWriter. Values &lt; 1 are invalid and if passed
		 * <code>maxThreadStates</code> will be set to
		 * {@link #DEFAULT_MAX_THREAD_STATES}.
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setMaxThreadStates: function(maxThreadStates) {
			this.indexerThreadPool = new ThreadAffinityDocumentsWriterThreadPool(maxThreadStates);
			return this;
		},
		//@Override
		getMaxThreadStates: function() {
			try {
				////return ((ThreadAffinityDocumentsWriterThreadPool) indexerThreadPool).getMaxThreadStates();
				return ThreadAffinityDocumentsWriterThreadPool.prototype.getMaxThreadStates.call(this.indexerThreadPool);
			} catch (cce) {
				throw new IllegalStateException(cce);
			}
		},
		/** By default, IndexWriter does not pool the
		 *  SegmentReaders it must open for deletions and
		 *  merging, unless a near-real-time reader has been
		 *  obtained by calling {@link DirectoryReader#open(IndexWriter, boolean)}.
		 *  This method lets you enable pooling without getting a
		 *  near-real-time reader.  NOTE: if you set this to
		 *  false, IndexWriter will still pool readers once
		 *  {@link DirectoryReader#open(IndexWriter, boolean)} is called.
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setReaderPooling: function(readerPooling) {
			this.readerPooling = readerPooling;
			return this;
		},
		//@Override
		getReaderPooling: function() {
			return this.readerPooling;
		},
		/** Expert: sets the {@link DocConsumer} chain to be used to process documents.
		 *
		 * <p>Only takes effect when IndexWriter is first created. */
		setIndexingChain: function(indexingChain) {
			this.indexingChain = indexingChain == null ? DocumentsWriterPerThread.defaultIndexingChain : indexingChain;
			return this;
		},
		//@Override
		getIndexingChain: function() {
			return this.indexingChain;
		},
		/**
		 * Expert: Controls when segments are flushed to disk during indexing.
		 * The {@link FlushPolicy} initialized during {@link IndexWriter} instantiation and once initialized
		 * the given instance is bound to this {@link IndexWriter} and should not be used with another writer.
		 * @see #setMaxBufferedDeleteTerms(int)
		 * @see #setMaxBufferedDocs(int)
		 * @see #setRAMBufferSizeMB(double)
		 */
		setFlushPolicy: function(flushPolicy) {
			this.flushPolicy = flushPolicy;
			return this;
		},
		/**
		 * Expert: Sets the maximum memory consumption per thread triggering a forced
		 * flush if exceeded. A {@link DocumentsWriterPerThread} is forcefully flushed
		 * once it exceeds this limit even if the {@link #getRAMBufferSizeMB()} has
		 * not been exceeded. This is a safety limit to prevent a
		 * {@link DocumentsWriterPerThread} from address space exhaustion due to its
		 * internal 32 bit signed integer based memory addressing.
		 * The given value must be less that 2GB (2048MB)
		 *
		 * @see #DEFAULT_RAM_PER_THREAD_HARD_LIMIT_MB
		 */
		setRAMPerThreadHardLimitMB: function(perThreadHardLimitMB) {
			if (perThreadHardLimitMB <= 0 || perThreadHardLimitMB >= 2048) {
				throw new IllegalArgumentException("PerThreadHardLimit must be greater than 0 and less than 2048MB");
			}
			this.perThreadHardLimitMB = perThreadHardLimitMB;
			return this;
		},
		//@Override
		getRAMPerThreadHardLimitMB: function() {
			return this.perThreadHardLimitMB;
		},
		//@Override
		getFlushPolicy: function() {
			return this.flushPolicy;
		},
		//@Override
		getInfoStream: function() {
			return this.infoStream;
		},
		//@Override
		getAnalyzer: function() {
			return LiveIndexWriterConfig.prototype.getAnalyzer.call(this); //super.getAnalyzer();
		},
		//@Override
		getMaxBufferedDeleteTerms: function() {
			return LiveIndexWriterConfig.prototype.getMaxBufferedDeleteTerms.call(this); //super.getMaxBufferedDeleteTerms();
		},
		//@Override
		getMaxBufferedDocs: function() {
			return LiveIndexWriterConfig.prototype.getMaxBufferedDocs.call(this);
		},
		//@Override
		getMergedSegmentWarmer: function() {
			return LiveIndexWriterConfig.prototype.getMergedSegmentWarmer.call(this);
		},
		// @Override
		getRAMBufferSizeMB: function() {
			return LiveIndexWriterConfig.prototype.getRAMBufferSizeMB.call(this);
		},
		//@Override
		getReaderTermsIndexDivisor: function() {
			return LiveIndexWriterConfig.prototype.getReaderTermsIndexDivisor.call(this);
		},
		// @Override
		getTermIndexInterval: function() {
			return LiveIndexWriterConfig.prototype.getTermIndexInterval.call(this);
		},
		/** If non-null, information about merges, deletes and a
		 * message when maxFieldLength is reached will be printed
		 * to this.
		 */
		setInfoStream: function(infoStream) {
			if (infoStream == null) {
				throw new IllegalArgumentException("Cannot set InfoStream implementation to null. " + "To disable logging use InfoStream.NO_OUTPUT");
			}
			this.infoStream = infoStream;
			return this;
		},
		/** Convenience method that uses {@link PrintStreamInfoStream} */
		setInfoStream: function(printStream) {
			return this.setInfoStream(printStream == null ? InfoStream.NO_OUTPUT : new PrintStreamInfoStream(printStream));
		},
		//Override
		setMaxBufferedDeleteTerms: function(maxBufferedDeleteTerms) {
			return LiveIndexWriterConfig.prototype.setMaxBufferedDeleteTerms(maxBufferedDeleteTerms); //(IndexWriterConfig) super.setMaxBufferedDeleteTerms(maxBufferedDeleteTerms);
		},
		//@Override
		setMaxBufferedDocs: function(maxBufferedDocs) {
			return LiveIndexWriterConfig.prototype.setMaxBufferedDocs(maxBufferedDocs); //(IndexWriterConfig) super.setMaxBufferedDocs(maxBufferedDocs);
		},
		//@Override
		setMergedSegmentWarmer: function(mergeSegmentWarmer) {
			return LiveIndexWriterConfig.prototype.setMergedSegmentWarmer(mergeSegmentWarmer); //(IndexWriterConfig) super.setMergedSegmentWarmer(mergeSegmentWarmer);
		},
		//@Override
		setRAMBufferSizeMB: function(ramBufferSizeMB) {
			return LiveIndexWriterConfig.prototype.setRAMBufferSizeMB(ramBufferSizeMB); //(IndexWriterConfig) super.setRAMBufferSizeMB(ramBufferSizeMB);
		},
		//@Override
		setReaderTermsIndexDivisor: function(divisor) {
			return LiveIndexWriterConfig.prototype.setReaderTermsIndexDivisor(divisor); //(IndexWriterConfig) super.setReaderTermsIndexDivisor(divisor);
		},
		//@Override
		setTermIndexInterval: function(interval) {
			return LiveIndexWriterConfig.prototype.setTermIndexInterval(interval); //(IndexWriterConfig) super.setTermIndexInterval(interval);
		},
	}
});

IndexWriterConfig.OpenMode = OpenMode;
module.exports = exports = IndexWriterConfig;