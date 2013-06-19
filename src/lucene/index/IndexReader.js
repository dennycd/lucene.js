var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');

var Closeable = require('library/lucene/util/Closeable.js');

var AtomicInteger = require('library/java/util/concurrent/atomic/AtomicInteger.js');

var LinkedHashSet = require('library/java/util/LinkedHashSet.js');
var WeakHashMap = require('library/java/util/WeakHashMap.js');
var Collections = require('library/java/util/Collections.js');

var synchronized = require('library/thread').Synchronized;

var DocumentStoredFieldVisitor = require('library/lucene/document/DocumentStoredFieldVisitor.js');

var AlreadyClosedException = require('library/lucene/store/AlreadyClosedException.js');
var IllegalStateException = require('library/lucene/util/IllegalStateException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');

/**
 IndexReader is an abstract class, providing an interface for accessing an index. Search of an index is done entirely through this abstract interface, so that any subclass which implements it is searchable.
**/
var IndexReader = defineClass({
	name: "IndexReader",
	implement: Closeable,
	variables: {
		closed: false,
		closedByChild: false,
		refCount: new AtomicInteger(1),
		//private final Set<ReaderClosedListener> readerClosedListeners = Collections.synchronizedSet(new LinkedHashSet<ReaderClosedListener>());
		readerClosedListeners: Collections.synchronizedSet(new LinkedHashSet()),
		//private final Set<IndexReader> parentReaders = Collections.synchronizedSet(Collections.newSetFromMap(new WeakHashMap<IndexReader,Boolean>()));
		parentReaders: Collections.synchronizedSet(Collections.newSetFromMap(new WeakHashMap())),
	},
	construct: function() {
/*
		if (!Class.isInstanceOfClass(this, "CompositeReader") && !Class.isInstanceOfClass("AtomicReader")) 
			throw new Error("IndexReader should never be directly extended, subclass AtomicReader or CompositeReader instead.");
*/
	},
	statics: {
	},
	 methods: {
	/** Expert: adds a {@link ReaderClosedListener}.  The
	 * provided listener will be invoked when this reader is closed.
	 *
	 * @lucene.experimental */
	addReaderClosedListener: function( /* ReaderClosedListener */ listener) {
		this.ensureOpen();
		this.readerClosedListeners.add(listener);
	},
	/** Expert: remove a previously added {@link ReaderClosedListener}.
	 *
	 * @lucene.experimental */
	removeReaderClosedListener: function( /* ReaderClosedListener */ listener) {
		this.ensureOpen();
		this.readerClosedListeners.remove(listener);
	},
	/** Expert: This method is called by {@code IndexReader}s which wrap other readers
	 * (e.g. {@link CompositeReader} or {@link FilterAtomicReader}) to register the parent
	 * at the child (this reader) on construction of the parent. When this reader is closed,
	 * it will mark all registered parents as closed, too. The references to parent readers
	 * are weak only, so they can be GCed once they are no longer in use.
	 * @lucene.experimental */
	registerParentReader: function( /* IndexReader */ reader) {
		this.ensureOpen();
		this.parentReaders.add(reader);
	},
	notifyReaderClosedListeners: function() {
		var self = this;
		synchronized(this.readerClosedListeners, function() {
			for ( /* ReaderClosedListener */
			var listener in self.readerClosedListeners) {
				listener.onClose(self);
			}
		});
	},
	reportCloseToParentReaders: function() {
		var self = this;
		synchronized(this.parentReaders, function() {
			for ( /* IndexReader */
			var parent in self.parentReaders) {
				parent.closedByChild = true;
				// cross memory barrier by a fake write:
				parent.refCount.addAndGet(0);
				// recurse:
				parent.reportCloseToParentReaders();
			}
		});
	},
	/** Expert: returns the current refCount for this reader */
	getRefCount: function() {
		// NOTE: don't ensureOpen, so that callers can see
		// refCount is 0 (reader is closed)
		return this.refCount.get();
	},
	/**
	 * Expert: increments the refCount of this IndexReader
	 * instance.  RefCounts are used to determine when a
	 * reader can be closed safely, i.e. as soon as there are
	 * no more references.  Be sure to always call a
	 * corresponding {@link #decRef}, in a finally clause;
	 * otherwise the reader may never be closed.  Note that
	 * {@link #close} simply calls decRef(), which means that
	 * the IndexReader will not really be closed until {@link
	 * #decRef} has been called for all outstanding
	 * references.
	 *
	 * @see #decRef
	 * @see #tryIncRef
	 */
	incRef: function() {
		this.ensureOpen();
		this.refCount.incrementAndGet();
	},
	/**
	 * Expert: increments the refCount of this IndexReader
	 * instance only if the IndexReader has not been closed yet
	 * and returns <code>true</code> iff the refCount was
	 * successfully incremented, otherwise <code>false</code>.
	 * If this method returns <code>false</code> the reader is either
	 * already closed or is currently been closed. Either way this
	 * reader instance shouldn't be used by an application unless
	 * <code>true</code> is returned.
	 * <p>
	 * RefCounts are used to determine when a
	 * reader can be closed safely, i.e. as soon as there are
	 * no more references.  Be sure to always call a
	 * corresponding {@link #decRef}, in a finally clause;
	 * otherwise the reader may never be closed.  Note that
	 * {@link #close} simply calls decRef(), which means that
	 * the IndexReader will not really be closed until {@link
	 * #decRef} has been called for all outstanding
	 * references.
	 *
	 * @see #decRef
	 * @see #incRef
	 */
	/* public final boolean */
	tryIncRef: function() {
		var count;
		while ((count = this.refCount.get()) > 0) {
			if (this.refCount.compareAndSet(count, count + 1)) {
				return true;
			}
		}
		return false;
	},
	/**
	 * Expert: decreases the refCount of this IndexReader
	 * instance.  If the refCount drops to 0, then this
	 * reader is closed.  If an exception is hit, the refCount
	 * is unchanged.
	 *
	 * @throws IOException in case an IOException occurs in  doClose()
	 *
	 * @see #incRef
	 */
	decRef: function() {
		// only check refcount here (don't call ensureOpen()), so we can
		// still close the reader if it was made invalid by a child:
		if (this.refCount.get() <= 0) {
			throw new AlreadyClosedException("this IndexReader is closed");
		}
		var rc = this.refCount.decrementAndGet();
		if (rc == 0) {
			var success = false;
			try {
				this.doClose();
				success = true;
			} finally {
				if (!success) {
					// Put reference back on failure
					this.refCount.incrementAndGet();
				}
			}
			this.reportCloseToParentReaders();
			this.notifyReaderClosedListeners();
		} else if (rc < 0) {
			throw new IllegalStateException("too many decRef calls: refCount is " + rc + " after decrement");
		}
	},
	/**
	 * Throws AlreadyClosedException if this IndexReader or any
	 * of its child readers is closed, otherwise returns.
	 */
	ensureOpen: function() {
		if (this.refCount.get() <= 0) {
			throw new AlreadyClosedException("this IndexReader is closed");
		}
		// the happens before rule on reading the refCount, which must be after the fake write,
		// ensures that we see the value:
		if (this.closedByChild) {
			throw new AlreadyClosedException("this IndexReader cannot be used anymore as one of its child readers was closed");
		}
	},
	/** {@inheritDoc}
	 * <p>For caching purposes, {@code IndexReader} subclasses are not allowed
	 * to implement equals/hashCode, so methods are declared final.
	 * To lookup instances from caches use {@link #getCoreCacheKey} and
	 * {@link #getCombinedCoreAndDeletesKey}.
	 */
	//@Override
	equals: function(obj) {
		return (this === obj);
	},
	/** {@inheritDoc}
	 * <p>For caching purposes, {@code IndexReader} subclasses are not allowed
	 * to implement equals/hashCode, so methods are declared final.
	 * To lookup instances from caches use {@link #getCoreCacheKey} and
	 * {@link #getCombinedCoreAndDeletesKey}.
	 */
	//@Override
	hashCode: function() {
		assert(null, "hashCode not yet implemented");
		return null; //System.identityHashCode(this);
	},
	/** Retrieve term vectors for this document, or null if
	 *  term vectors were not indexed.  The returned Fields
	 *  instance acts like a single-document inverted index
	 *  (the docID will be 0). */
	//public abstract Fields getTermVectors(int docID) throws IOException;
	getTermVectors$abstract: function(docID) {},
	/** Retrieve term vector for this document and field, or
	 *  null if term vectors were not indexed.  The returned
	 *  Fields instance acts like a single-document inverted
	 *  index (the docID will be 0). */
	//public final Terms getTermVector(int docID, String field) throws IOException {
	getTermVector: function(docID, field) {
		var vectors = this.getTermVectors(docID);
		if (vectors == null) {
			return null;
		}
		return vectors.terms(field);
	},
	/** Returns the number of documents in this index. */
	numDocs$abstract: function() {},
	/** Returns one greater than the largest possible document number.
	 * This may be used to, e.g., determine how big to allocate an array which
	 * will have an element for every document number in an index.
	 */
	maxDoc$abstract: function() {},
	/** Returns the number of deleted documents. */
	numDeletedDocs: function() {
		return this.maxDoc() - this.numDocs();
	},
/**
   Merged 
  **/
	document: function() {
		if (arguments.length == 1) {
			if (typeof(arguments[0]) != "number") throw new IllegalArgumentException("args invalid");
			var visitor = new DocumentStoredFieldVisitor();
			this.document(docID, visitor);
			return visitor.getDocument();
		} else if (arguments.length == 2) {
			if (typeof(arguments[0]) != "number") throw new IllegalArgumentException("args invalid");
			if (!Class.isInstanceOfClass("Set")) throw new IllegalArgumentException("args invalid");
			var visitor = new DocumentStoredFieldVisitor(arguments[1]);
			this.document(arguments[0], visitor);
			return visitor.getDocument();
		} else throw new IllegalArgumentException("args invalid");
	},
	/** Returns true if any documents have been deleted */
	hasDeletions$abstract: function() {},
	/**
	 * Closes files associated with this index.
	 * Also saves any new deletions to disk.
	 * No other methods should be called after this has been called.
	 * @throws IOException if there is a low-level IO error
	 */
	//@Override
	close: function() {
		if (!this.closed) {
			this.decRef();
			this.closed = true;
		}
	},
	/** Implements close. */
	doClose$abstract: function() {},
	/**
	 * Expert: Returns the root {@link IndexReaderContext} for this
	 * {@link IndexReader}'s sub-reader tree.
	 * <p>
	 * Iff this reader is composed of sub
	 * readers, i.e. this reader being a composite reader, this method returns a
	 * {@link CompositeReaderContext} holding the reader's direct children as well as a
	 * view of the reader tree's atomic leaf contexts. All sub-
	 * {@link IndexReaderContext} instances referenced from this readers top-level
	 * context are private to this reader and are not shared with another context
	 * tree. For example, IndexSearcher uses this API to drive searching by one
	 * atomic leaf reader at a time. If this reader is not composed of child
	 * readers, this method returns an {@link AtomicReaderContext}.
	 * <p>
	 * Note: Any of the sub-{@link CompositeReaderContext} instances referenced
	 * from this top-level context do not support {@link CompositeReaderContext#leaves()}.
	 * Only the top-level context maintains the convenience leaf-view
	 * for performance reasons.
	 */
	getContext$abstract: function() {},
	/**
	 * Returns the reader's leaves, or itself if this reader is atomic.
	 * This is a convenience method calling {@code this.getContext().leaves()}.
	 * @see IndexReaderContext#leaves()
	 */
	leaves: function() {
		return this.getContext().leaves();
	},
	/** Expert: Returns a key for this IndexReader, so FieldCache/CachingWrapperFilter can find
	 * it again.
	 * This key must not have equals()/hashCode() methods, so &quot;equals&quot; means &quot;identical&quot;. */
	getCoreCacheKey: function() {
		// Don't can ensureOpen since FC calls this (to evict)
		// on close
		return this;
	},
	/** Expert: Returns a key for this IndexReader that also includes deletions,
	 * so FieldCache/CachingWrapperFilter can find it again.
	 * This key must not have equals()/hashCode() methods, so &quot;equals&quot; means &quot;identical&quot;. */
	getCombinedCoreAndDeletesKey: function() {
		// Don't can ensureOpen since FC calls this (to evict)
		// on close
		return this;
	},
	/** Returns the number of documents containing the 
	 * <code>term</code>.  This method returns 0 if the term or
	 * field does not exists.  This method does not take into
	 * account deleted documents that have not yet been merged
	 * away.
	 * @see TermsEnum#docFreq()
	 */
	docFreq$abstract: function( /* Term */ term) {},
	/** Returns the number of documents containing the term
	 * <code>term</code>.  This method returns 0 if the term or
	 * field does not exists, or -1 if the Codec does not support
	 * the measure.  This method does not take into account deleted
	 * documents that have not yet been merged away.
	 * @see TermsEnum#totalTermFreq()
	 */
	totalTermFreq: function( /* Term */ term) {}
}
});
/**
 * A custom listener that's invoked when the IndexReader
 * is closed.
 *
 * @lucene.experimental
 */
var ReaderClosedListener = defineInterface({
	name: "ReaderClosedListener",
	methods: { /** Invoked when the {@link IndexReader} is closed. */
		onClose: function( /* IndexReader */ reader) {}
	}
});
module.exports = exports = IndexReader;