var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var NullPointerException = require('library/lucene/util/NullPointerException.js');
var StringBuilder = require('library/lucene/util/StringBuilder.js');


/**
 * Holds all the configuration used by {@link IndexWriter} with few setters for
 * settings that can be changed on an {@link IndexWriter} instance "live".
 *
 * @since 4.0
 */
var LiveIndexWriterConfig = defineClass({
	name: "LiveIndexWriterConfig",
	statics: {},
	variables: {
		analyzer: null,
		//Analyzer
		maxBufferedDocs: 0,
		ramBufferSizeMB: 0,
		maxBufferedDeleteTerms: 0,
		readerTermsIndexDivisor: 0,
		mergedSegmentWarmer: null,
		termIndexInterval: 0,
		// TODO: this should be private to the codec, not settable here
		// modified by IndexWriterConfig
		/** {@link IndexDeletionPolicy} controlling when commit
		 *  points are deleted. */
		delPolicy: null,
		/** {@link IndexCommit} that {@link IndexWriter} is
		 *  opened on. */
		commit: null,
		/** {@link OpenMode} that {@link IndexWriter} is opened
		 *  with. */
		openMode: null,
		/** {@link Similarity} to use when encoding norms. */
		similarity: null,
		/** {@link MergeScheduler} to use for running merges. */
		mergeScheduler: null,
		/** Timeout when trying to obtain the write lock on init. */
		writeLockTimeout: 0,
		/** {@link IndexingChain} that determines how documents are
		 *  indexed. */
		indexingChain: null,
		/** {@link Codec} used to write new segments. */
		codec: null,
		/** {@link InfoStream} for debugging messages. */
		infoStream: null,
		/** {@link MergePolicy} for selecting merges. */
		mergePolicy: null,
		/** {@code DocumentsWriterPerThreadPool} to control how
		 *  threads are allocated to {@code DocumentsWriterPerThread}. */
		indexerThreadPool: null,
		/** True if readers should be pooled. */
		readerPooling: false,
		/** {@link FlushPolicy} to control when segments are
		 *  flushed. */
		flushPolicy: null,
		/** Sets the hard upper bound on RAM usage for a single
		 *  segment, after which the segment is forced to flush. */
		perThreadHardLimitMB: 0,
		/** {@link Version} that {@link IndexWriter} should emulate. */
		matchVersion: null
	},
	//LiveIndexWriterConfig(Analyzer analyzer, Version matchVersion) {
	//LiveIndexWriterConfig(IndexWriterConfig config) {
	construct: function() {
		console.log("LiveIndexWriterConfig::construct");
		if (arguments.length == 1) {			
			if(!Class.isInstanceOfClass(arguments[0], "IndexWriterConfig")) throw new IllegalArgumentException("indexwriterconfig invalid");
			var config = arguments[0];
			this.maxBufferedDeleteTerms = config.getMaxBufferedDeleteTerms();
			this.maxBufferedDocs = config.getMaxBufferedDocs();
			this.mergedSegmentWarmer = config.getMergedSegmentWarmer();
			this.ramBufferSizeMB = config.getRAMBufferSizeMB();
			this.readerTermsIndexDivisor = config.getReaderTermsIndexDivisor();
			this.termIndexInterval = config.getTermIndexInterval();
			this.matchVersion = config.matchVersion;
			this.analyzer = config.getAnalyzer();
			this.delPolicy = config.getIndexDeletionPolicy();
			this.commit = config.getIndexCommit();
			this.openMode = config.getOpenMode();
			this.similarity = config.getSimilarity();
			this.mergeScheduler = config.getMergeScheduler();
			this.writeLockTimeout = config.getWriteLockTimeout();
			this.indexingChain = config.getIndexingChain();
			this.codec = config.getCodec();
			this.infoStream = config.getInfoStream();
			this.mergePolicy = config.getMergePolicy();
			this.indexerThreadPool = config.getIndexerThreadPool();
			this.readerPooling = config.getReaderPooling();
			this.flushPolicy = config.getFlushPolicy();
			this.perThreadHardLimitMB = config.getRAMPerThreadHardLimitMB();
		} else if (arguments.length == 2) {

			//on-demand lazy loading of class definition files 			
			var KeepOnlyLastCommitDeletionPolicy = require('library/lucene/index/KeepOnlyLastCommitDeletionPolicy.js');
			var ConcurrentMergeScheduler = require('library/lucene/index/ConcurrentMergeScheduler.js');
			var IndexWriterConfig = require('library/lucene/index/IndexWriterConfig.js');
			var OpenMode = IndexWriterConfig.OpenMode;
			var IndexSearcher = require('library/lucene/search/IndexSearcher.js');
			var DocumentsWriterPerThread = require('library/lucene/index/DocumentsWriterPerThread.js');
			var Codec = require('library/lucene/codecs/Codec.js');
			var InfoStream = require('library/lucene/util/InfoStream.js');
			var TieredMergePolicy = require('library/lucene/index/TieredMergePolicy.js');
			var FlushByRamOrCountsPolicy = require('library/lucene/index/FlushByRamOrCountsPolicy.js');
			var ThreadAffinityDocumentsWriterThreadPool= require('library/lucene/index/ThreadAffinityDocumentsWriterThreadPool.js');
		
			if(!Class.isInstanceOfClass(arguments[0], "Analyzer"))  throw new IllegalArgumentException("analyzer invalid");
			if(!Class.isInstanceOfClass(arguments[1], "Version")) throw new IllegalArgumentException("version invalid");
			

			this.analyzer = arguments[0];
			this.matchVersion = arguments[1];
			this.ramBufferSizeMB = IndexWriterConfig.DEFAULT_RAM_BUFFER_SIZE_MB;
			this.maxBufferedDocs = IndexWriterConfig.DEFAULT_MAX_BUFFERED_DOCS;
			this.maxBufferedDeleteTerms = IndexWriterConfig.DEFAULT_MAX_BUFFERED_DELETE_TERMS;
			this.readerTermsIndexDivisor = IndexWriterConfig.DEFAULT_READER_TERMS_INDEX_DIVISOR;
			this.mergedSegmentWarmer = null;
			this.termIndexInterval = IndexWriterConfig.DEFAULT_TERM_INDEX_INTERVAL; // TODO: this should be private to the codec, not settable here
			this.delPolicy = new KeepOnlyLastCommitDeletionPolicy();
			
			this.commit = null;
			this.openMode = OpenMode.CREATE_OR_APPEND;
			this.similarity = IndexSearcher.getDefaultSimilarity();
			this.mergeScheduler = new ConcurrentMergeScheduler();
			this.writeLockTimeout = IndexWriterConfig.WRITE_LOCK_TIMEOUT;
			this.indexingChain = DocumentsWriterPerThread.defaultIndexingChain;
			this.codec = Codec.getDefault();
						 
			 
			if (this.codec == null) {
				throw new NullPointerException("codecs is null!!");
			}
			
										



			this.infoStream = InfoStream.getDefault();
			this.mergePolicy = new TieredMergePolicy();
			this.flushPolicy = new FlushByRamOrCountsPolicy();
			this.readerPooling = IndexWriterConfig.DEFAULT_READER_POOLING;
			this.indexerThreadPool = new ThreadAffinityDocumentsWriterThreadPool(IndexWriterConfig.DEFAULT_MAX_THREAD_STATES);
			this.perThreadHardLimitMB = IndexWriterConfig.DEFAULT_RAM_PER_THREAD_HARD_LIMIT_MB;
		}
		
		console.log("LiveIndexWriterConfig::construct DONE");
	},
	methods: { /** Returns the default analyzer to use for indexing documents. */
		getAnalyzer: function() {
			return analyzer;
		},
		/**
		 * Expert: set the interval between indexed terms. Large values cause less
		 * memory to be used by IndexReader, but slow random-access to terms. Small
		 * values cause more memory to be used by an IndexReader, and speed
		 * random-access to terms.
		 * <p>
		 * This parameter determines the amount of computation required per query
		 * term, regardless of the number of documents that contain that term. In
		 * particular, it is the maximum number of other terms that must be scanned
		 * before a term is located and its frequency and position information may be
		 * processed. In a large index with user-entered query terms, query processing
		 * time is likely to be dominated not by term lookup but rather by the
		 * processing of frequency and positional data. In a small index or when many
		 * uncommon query terms are generated (e.g., by wildcard queries) term lookup
		 * may become a dominant cost.
		 * <p>
		 * In particular, <code>numUniqueTerms/interval</code> terms are read into
		 * memory by an IndexReader, and, on average, <code>interval/2</code> terms
		 * must be scanned for each random term access.
		 *
		 * <p>
		 * Takes effect immediately, but only applies to newly flushed/merged
		 * segments.
		 *
		 * <p>
		 * <b>NOTE:</b> This parameter does not apply to all PostingsFormat implementations,
		 * including the default one in this release. It only makes sense for term indexes
		 * that are implemented as a fixed gap between terms. For example,
		 * {@link Lucene41PostingsFormat} implements the term index instead based upon how
		 * terms share prefixes. To configure its parameters (the minimum and maximum size
		 * for a block), you would instead use  {@link Lucene41PostingsFormat#Lucene41PostingsFormat(int, int)}.
		 * which can also be configured on a per-field basis:
		 * <pre class="prettyprint">
		 * //customize Lucene41PostingsFormat, passing minBlockSize=50, maxBlockSize=100
		 * final PostingsFormat tweakedPostings = new Lucene41PostingsFormat(50, 100);
		 * iwc.setCodec(new Lucene42Codec() {
		 *   &#64;Override
		 *   public PostingsFormat getPostingsFormatForField(String field) {
		 *     if (field.equals("fieldWithTonsOfTerms"))
		 *       return tweakedPostings;
		 *     else
		 *       return super.getPostingsFormatForField(field);
		 *   }
		 * });
		 * </pre>
		 * Note that other implementations may have their own parameters, or no parameters at all.
		 *
		 * @see IndexWriterConfig#DEFAULT_TERM_INDEX_INTERVAL
		 */
		setTermIndexInterval: function(interval) { // TODO: this should be private to the codec, not settable here
			this.termIndexInterval = interval;
			return this;
		},
		/**
		 * Returns the interval between indexed terms.
		 *
		 * @see #setTermIndexInterval(int)
		 */
		getTermIndexInterval: function() { // TODO: this should be private to the codec, not settable here
			return this.termIndexInterval;
		},
		/**
		 * Determines the minimal number of delete terms required before the buffered
		 * in-memory delete terms and queries are applied and flushed.
		 * <p>
		 * Disabled by default (writer flushes by RAM usage).
		 * <p>
		 * NOTE: This setting won't trigger a segment flush.
		 *
		 * <p>
		 * Takes effect immediately, but only the next time a document is added,
		 * updated or deleted.
		 *
		 * @throws IllegalArgumentException
		 *           if maxBufferedDeleteTerms is enabled but smaller than 1
		 *
		 * @see #setRAMBufferSizeMB
		 */
		setMaxBufferedDeleteTerms: function(maxBufferedDeleteTerms) {
			if (maxBufferedDeleteTerms != IndexWriterConfig.DISABLE_AUTO_FLUSH && maxBufferedDeleteTerms < 1) {
				throw new IllegalArgumentException("maxBufferedDeleteTerms must at least be 1 when enabled");
			}
			this.maxBufferedDeleteTerms = maxBufferedDeleteTerms;
			return this;
		},
		/**
		 * Returns the number of buffered deleted terms that will trigger a flush of all
		 * buffered deletes if enabled.
		 *
		 * @see #setMaxBufferedDeleteTerms(int)
		 */
		getMaxBufferedDeleteTerms: function() {
			return this.maxBufferedDeleteTerms;
		},
		/**
		 * Determines the amount of RAM that may be used for buffering added documents
		 * and deletions before they are flushed to the Directory. Generally for
		 * faster indexing performance it's best to flush by RAM usage instead of
		 * document count and use as large a RAM buffer as you can.
		 * <p>
		 * When this is set, the writer will flush whenever buffered documents and
		 * deletions use this much RAM. Pass in
		 * {@link IndexWriterConfig#DISABLE_AUTO_FLUSH} to prevent triggering a flush
		 * due to RAM usage. Note that if flushing by document count is also enabled,
		 * then the flush will be triggered by whichever comes first.
		 * <p>
		 * The maximum RAM limit is inherently determined by the JVMs available
		 * memory. Yet, an {@link IndexWriter} session can consume a significantly
		 * larger amount of memory than the given RAM limit since this limit is just
		 * an indicator when to flush memory resident documents to the Directory.
		 * Flushes are likely happen concurrently while other threads adding documents
		 * to the writer. For application stability the available memory in the JVM
		 * should be significantly larger than the RAM buffer used for indexing.
		 * <p>
		 * <b>NOTE</b>: the account of RAM usage for pending deletions is only
		 * approximate. Specifically, if you delete by Query, Lucene currently has no
		 * way to measure the RAM usage of individual Queries so the accounting will
		 * under-estimate and you should compensate by either calling commit()
		 * periodically yourself, or by using {@link #setMaxBufferedDeleteTerms(int)}
		 * to flush and apply buffered deletes by count instead of RAM usage (for each
		 * buffered delete Query a constant number of bytes is used to estimate RAM
		 * usage). Note that enabling {@link #setMaxBufferedDeleteTerms(int)} will not
		 * trigger any segment flushes.
		 * <p>
		 * <b>NOTE</b>: It's not guaranteed that all memory resident documents are
		 * flushed once this limit is exceeded. Depending on the configured
		 * {@link FlushPolicy} only a subset of the buffered documents are flushed and
		 * therefore only parts of the RAM buffer is released.
		 * <p>
		 *
		 * The default value is {@link IndexWriterConfig#DEFAULT_RAM_BUFFER_SIZE_MB}.
		 *
		 * <p>
		 * Takes effect immediately, but only the next time a document is added,
		 * updated or deleted.
		 *
		 * @see IndexWriterConfig#setRAMPerThreadHardLimitMB(int)
		 *
		 * @throws IllegalArgumentException
		 *           if ramBufferSize is enabled but non-positive, or it disables
		 *           ramBufferSize when maxBufferedDocs is already disabled
		 */
		setRAMBufferSizeMB: function(ramBufferSizeMB) {
			if (ramBufferSizeMB != IndexWriterConfig.DISABLE_AUTO_FLUSH && ramBufferSizeMB <= 0.0) {
				throw new IllegalArgumentException("ramBufferSize should be > 0.0 MB when enabled");
			}
			if (ramBufferSizeMB == IndexWriterConfig.DISABLE_AUTO_FLUSH && this.maxBufferedDocs == IndexWriterConfig.DISABLE_AUTO_FLUSH) {
				throw new IllegalArgumentException("at least one of ramBufferSize and maxBufferedDocs must be enabled");
			}
			this.ramBufferSizeMB = ramBufferSizeMB;
			return this;
		},
		/** Returns the value set by {@link #setRAMBufferSizeMB(double)} if enabled. */
		getRAMBufferSizeMB: function() {
			return this.ramBufferSizeMB;
		},
		/**
		 * Determines the minimal number of documents required before the buffered
		 * in-memory documents are flushed as a new Segment. Large values generally
		 * give faster indexing.
		 *
		 * <p>
		 * When this is set, the writer will flush every maxBufferedDocs added
		 * documents. Pass in {@link IndexWriterConfig#DISABLE_AUTO_FLUSH} to prevent
		 * triggering a flush due to number of buffered documents. Note that if
		 * flushing by RAM usage is also enabled, then the flush will be triggered by
		 * whichever comes first.
		 *
		 * <p>
		 * Disabled by default (writer flushes by RAM usage).
		 *
		 * <p>
		 * Takes effect immediately, but only the next time a document is added,
		 * updated or deleted.
		 *
		 * @see #setRAMBufferSizeMB(double)
		 * @throws IllegalArgumentException
		 *           if maxBufferedDocs is enabled but smaller than 2, or it disables
		 *           maxBufferedDocs when ramBufferSize is already disabled
		 */
		setMaxBufferedDocs: function(maxBufferedDocs) {
			if (maxBufferedDocs != IndexWriterConfig.DISABLE_AUTO_FLUSH && maxBufferedDocs < 2) {
				throw new IllegalArgumentException("maxBufferedDocs must at least be 2 when enabled");
			}
			if (maxBufferedDocs == IndexWriterConfig.DISABLE_AUTO_FLUSH && this.ramBufferSizeMB == IndexWriterConfig.DISABLE_AUTO_FLUSH) {
				throw new IllegalArgumentException("at least one of ramBufferSize and maxBufferedDocs must be enabled");
			}
			this.maxBufferedDocs = maxBufferedDocs;
			return this;
		},
		/**
		 * Returns the number of buffered added documents that will trigger a flush if
		 * enabled.
		 *
		 * @see #setMaxBufferedDocs(int)
		 */
		getMaxBufferedDocs: function() {
			return this.maxBufferedDocs;
		},
		/**
		 * Set the merged segment warmer. See {@link IndexReaderWarmer}.
		 *
		 * <p>
		 * Takes effect on the next merge.
		 */
		setMergedSegmentWarmer: function(mergeSegmentWarmer) {
			this.mergedSegmentWarmer = mergeSegmentWarmer;
			return this;
		},
		/** Returns the current merged segment warmer. See {@link IndexReaderWarmer}. */
		getMergedSegmentWarmer: function() {
			return this.mergedSegmentWarmer;
		},
		/**
		 * Sets the termsIndexDivisor passed to any readers that IndexWriter opens,
		 * for example when applying deletes or creating a near-real-time reader in
		 * {@link DirectoryReader#open(IndexWriter, boolean)}. If you pass -1, the
		 * terms index won't be loaded by the readers. This is only useful in advanced
		 * situations when you will only .next() through all terms; attempts to seek
		 * will hit an exception.
		 *
		 * <p>
		 * Takes effect immediately, but only applies to readers opened after this
		 * call
		 * <p>
		 * <b>NOTE:</b> divisor settings &gt; 1 do not apply to all PostingsFormat
		 * implementations, including the default one in this release. It only makes
		 * sense for terms indexes that can efficiently re-sample terms at load time.
		 */
		setReaderTermsIndexDivisor: function(divisor) {
			if (divisor <= 0 && divisor != -1) {
				throw new IllegalArgumentException("divisor must be >= 1, or -1 (got " + divisor + ")");
			}
			this.readerTermsIndexDivisor = divisor;
			return this;
		},
		/** Returns the {@code termInfosIndexDivisor}.
		 *
		 * @see #setReaderTermsIndexDivisor(int) */
		getReaderTermsIndexDivisor: function() {
			return this.readerTermsIndexDivisor;
		},
		/** Returns the {@link OpenMode} set by {@link IndexWriterConfig#setOpenMode(OpenMode)}. */
		getOpenMode: function() {
			return this.openMode;
		},
		/**
		 * Returns the {@link IndexDeletionPolicy} specified in
		 * {@link IndexWriterConfig#setIndexDeletionPolicy(IndexDeletionPolicy)} or
		 * the default {@link KeepOnlyLastCommitDeletionPolicy}/
		 */
		getIndexDeletionPolicy: function() {
			return this.delPolicy;
		},
		/**
		 * Returns the {@link IndexCommit} as specified in
		 * {@link IndexWriterConfig#setIndexCommit(IndexCommit)} or the default,
		 * {@code null} which specifies to open the latest index commit point.
		 */
		getIndexCommit: function() {
			return this.commit;
		},
		/**
		 * Expert: returns the {@link Similarity} implementation used by this
		 * {@link IndexWriter}.
		 */
		getSimilarity: function() {
			return this.similarity;
		},
		/**
		 * Returns the {@link MergeScheduler} that was set by
		 * {@link IndexWriterConfig#setMergeScheduler(MergeScheduler)}.
		 */
		getMergeScheduler: function() {
			return this.mergeScheduler;
		},
		/**
		 * Returns allowed timeout when acquiring the write lock.
		 *
		 * @see IndexWriterConfig#setWriteLockTimeout(long)
		 */
		getWriteLockTimeout: function() {
			return this.writeLockTimeout;
		},
		/** Returns the current {@link Codec}. */
		getCodec: function() {
			return this.codec;
		},
		/**
		 * Returns the current MergePolicy in use by this writer.
		 *
		 * @see IndexWriterConfig#setMergePolicy(MergePolicy)
		 */
		getMergePolicy: function() {
			return this.mergePolicy;
		},
		/**
		 * Returns the configured {@link DocumentsWriterPerThreadPool} instance.
		 *
		 * @see IndexWriterConfig#setIndexerThreadPool(DocumentsWriterPerThreadPool)
		 * @return the configured {@link DocumentsWriterPerThreadPool} instance.
		 */
		getIndexerThreadPool: function() {
			return this.indexerThreadPool;
		},
		/**
		 * Returns the max number of simultaneous threads that may be indexing
		 * documents at once in IndexWriter.
		 */
		getMaxThreadStates: function() {
			try {
				return this.indexerThreadPool.getMaxThreadStates(); //return ((ThreadAffinityDocumentsWriterThreadPool) indexerThreadPool).getMaxThreadStates();
			} catch (cce) {
				throw new IllegalStateException(cce);
			}
		},
		/**
		 * Returns {@code true} if {@link IndexWriter} should pool readers even if
		 * {@link DirectoryReader#open(IndexWriter, boolean)} has not been called.
		 */
		getReaderPooling: function() {
			return this.readerPooling;
		},
		/**
		 * Returns the indexing chain set on
		 * {@link IndexWriterConfig#setIndexingChain(IndexingChain)}.
		 */
		getIndexingChain: function() {
			return this.indexingChain;
		},
		/**
		 * Returns the max amount of memory each {@link DocumentsWriterPerThread} can
		 * consume until forcefully flushed.
		 *
		 * @see IndexWriterConfig#setRAMPerThreadHardLimitMB(int)
		 */
		getRAMPerThreadHardLimitMB: function() {
			return this.perThreadHardLimitMB;
		},
		/**
		 * @see IndexWriterConfig#setFlushPolicy(FlushPolicy)
		 */
		getFlushPolicy: function() {
			return this.flushPolicy;
		},
		/** Returns {@link InfoStream} used for debugging.
		 *
		 * @see IndexWriterConfig#setInfoStream(InfoStream)
		 */
		getInfoStream: function() {
			return this.infoStream;
		},

		//@Override
		toString : function() {
			var sb = new StringBuilder();
			sb.append("matchVersion=").append(this.matchVersion).append("\n");
			sb.append("analyzer=").append(this.analyzer == null ? "null" : this.analyzer.getClass().getName()).append("\n");
			sb.append("ramBufferSizeMB=").append(this.getRAMBufferSizeMB()).append("\n");
			sb.append("maxBufferedDocs=").append(this.getMaxBufferedDocs()).append("\n");
			sb.append("maxBufferedDeleteTerms=").append(this.getMaxBufferedDeleteTerms()).append("\n");
			sb.append("mergedSegmentWarmer=").append(this.getMergedSegmentWarmer()).append("\n");
			sb.append("readerTermsIndexDivisor=").append(this.getReaderTermsIndexDivisor()).append("\n");
			sb.append("termIndexInterval=").append(this.getTermIndexInterval()).append("\n"); // TODO: this should be private to the codec, not settable here
			sb.append("delPolicy=").append(this.getIndexDeletionPolicy().getClass().getName()).append("\n");
			var commit = this.getIndexCommit();
			sb.append("commit=").append(commit == null ? "null" : commit).append("\n");
			sb.append("openMode=").append(this.getOpenMode()).append("\n");
			sb.append("similarity=").append(this.getSimilarity().getClass().getName()).append("\n");
			sb.append("mergeScheduler=").append(this.getMergeScheduler()).append("\n");
			sb.append("default WRITE_LOCK_TIMEOUT=").append(IndexWriterConfig.WRITE_LOCK_TIMEOUT).append("\n");
			sb.append("writeLockTimeout=").append(this.getWriteLockTimeout()).append("\n");
			sb.append("codec=").append(this.getCodec()).append("\n");
			sb.append("infoStream=").append(this.getInfoStream().getClass().getName()).append("\n");
			sb.append("mergePolicy=").append(this.getMergePolicy()).append("\n");
			sb.append("indexerThreadPool=").append(this.getIndexerThreadPool()).append("\n");
			sb.append("readerPooling=").append(this.getReaderPooling()).append("\n");
			sb.append("perThreadHardLimitMB=").append(this.getRAMPerThreadHardLimitMB()).append("\n");
			return sb.toString();
		}
  
	}
});
module.exports = exports = LiveIndexWriterConfig;