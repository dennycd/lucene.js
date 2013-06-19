var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Closeable = require('library/lucene/util/Closeable.js');
/**
	REREFENECE http://lucene.apache.org/core/4_2_0/core/org/apache/lucene/util/CloseableThreadLocal.html
	
	thread local implmenetation  http://en.wikipedia.org/wiki/Thread-local_storage#cite_note-1
	
**/
var CloseableThreadLocal = defineClass({
	name: "CloseableThreadLocal",
	implement: [Closeable],
	statics: {
		// Increase this to decrease frequency of purging in get:
		PURGE_MULTIPLIER: 20,
	},
	variables: {
		t: null,
		//private ThreadLocal<WeakReference<T>> t = new ThreadLocal<WeakReference<T>>();
		// Use a WeakHashMap so that if a Thread exits and is
		// GC'able, its entry may be removed:
		//private Map<Thread,T> hardRefs = new WeakHashMap<Thread,T>();
		// On each get or set we decrement this; when it hits 0 we
		// purge.  After purge, we set this to
		// PURGE_MULTIPLIER * stillAliveCount.  This keeps
		// amortized cost of purging linear.
		countUntilPurge: 20,
		//new AtomicInteger(PURGE_MULTIPLIER); //AtomicInteger
	},
	construct: function() {
		this.t = null; //a thread local object
		/* 		this.hardRefs = {}; //hard reference to all thread-local objects */
	},
	methods: {
		initialValue: function() {
			return null;
		},
		get: function() {
/*
		    WeakReference<T> weakRef = t.get();
		    if (weakRef == null) {
		      T iv = initialValue();
		      if (iv != null) {
		        set(iv);
		        return iv;
		      } else {
		        return null;
		      }
		    } else {
		      maybePurge();
		      return weakRef.get();
		    }
		    */
			return this.t;
		},
		set: function(object) {
/*
		    t.set(new WeakReference<T>(object));
		
		    synchronized(hardRefs) {
		      hardRefs.put(Thread.currentThread(), object);
		      maybePurge();
		    }
*/
			this.t = object;
		},
		maybePurge: function() {
/*
		    if (countUntilPurge.getAndDecrement() == 0) {
		      purge();
		    }
*/
		},
		// Purge dead threads
		purge: function() {
/*
		    synchronized(hardRefs) {
		      int stillAliveCount = 0;
		      for (Iterator<Thread> it = hardRefs.keySet().iterator(); it.hasNext();) {
		        final Thread t = it.next();
		        if (!t.isAlive()) {
		          it.remove();
		        } else {
		          stillAliveCount++;
		        }
		      }
		      int nextCount = (1+stillAliveCount) * PURGE_MULTIPLIER;
		      if (nextCount <= 0) {
		        // defensive: int overflow!
		        nextCount = 1000000;
		      }
		      
		      countUntilPurge.set(nextCount);
		    }
		    
*/
		},
		//@Override
		close: function() {
/*
		    // Clear the hard refs; then, the only remaining refs to
		    // all values we were storing are weak (unless somewhere
		    // else is still using them) and so GC may reclaim them:
		    hardRefs = null;
		    // Take care of the current thread right now; others will be
		    // taken care of via the WeakReferences.
		    if (t != null) {
		      t.remove();
		    }
*/
			this.t = null;
		}
	}
});
module.exports = exports = CloseableThreadLocal;