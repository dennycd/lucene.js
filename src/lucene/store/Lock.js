var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var IOException = require('library/lucene/util/IOException.js');
var LockObtainFailedException = require('library/lucene/store/LockObtainFailedException.js'); /** Utility class for executing code with exclusive access. */
var Thread = require('library/thread');

var With = defineClass({
	name: "With",
	/** Constructs an executor that will grab the named lock. */
	construct: function(lock, lockWaitTimeout) {
		this.lock = lock;
		this.lockWaitTimeout = lockWaitTimeout;
	},
	methods: { /** Code to execute with exclusive access. */
		doBody: function() {
			throw new ImplNotSupportedException();
		},
		//TODO - update this logic to confrom to the async nature 
		/** Calls {@link #doBody} while <i>lock</i> is obtained.  Blocks if lock
		 * cannot be obtained immediately.  Retries to obtain lock once per second
		 * until it is obtained, or until it has tried ten times. Lock is released when
		 * {@link #doBody} exits.
		 * @throws LockObtainFailedException if lock could not
		 * be obtained
		 * @throws IOException if {@link Lock#obtain} throws IOException
		 */
		run: function() {
			var self = this;
			try {
				this.lock.obtain(this.lockWaitTimeout, function(locked, err) {
					if (locked) self.doBody();
				});
			} finally {
				if (locked) this.lock.release();
			}
		}
	}
});
/** An interprocess mutex lock.
 * <p>Typical use might look like:<pre class="prettyprint">
 * new Lock.With(directory.makeLock("my.lock")) {
 *     public Object doBody() {
 *       <i>... code to execute while locked ...</i>
 *     }
 *   }.run();
 * </pre>
 *
 * @see Directory#makeLock(String)
 */
var Lock = defineClass({
	name: "Lock",
	constructor: function() {
		/**
		 * If a lock obtain called, this failureReason may be set
		 * with the "root cause" Exception as to why the lock was
		 * not obtained.
		 */
		this.failureReason = null;
		//some local auxiliary vars
		this._timeoutId = null; //not-nul value indicates an obtain proces is still active
	},
	statics: {
		/** How long {@link #obtain(long)} waits, in milliseconds,
		 *  in between attempts to acquire the lock. */
		LOCK_POLL_INTERVAL: 1000,
		/** Pass this value to {@link #obtain(long)} to try
		 *  forever to obtain the lock. */
		LOCK_OBTAIN_WAIT_FOREVER: -1,
	},
	methods: {
		/** Attempts to obtain exclusive access and immediately return
		 *  upon success or failure.
		 * @return true iff exclusive access is obtained
		 */
		obtain: function() {
			throw new ImplNotSupportedException("obtain not implemented in Lock");
		},
		
		/** Attempts to obtain an exclusive lock within amount of
		*  time given. Polls once per {@link #LOCK_POLL_INTERVAL}
		*  (currently 1000) milliseconds until lockWaitTimeout is
		*  passed.
		* @param lockWaitTimeout length of time to wait in
		*        milliseconds or {@link
		*        #LOCK_OBTAIN_WAIT_FOREVER} to retry forever
		* @return true if lock was obtained
		* @throws LockObtainFailedException if lock wait times out
		* @throws IllegalArgumentException if lockWaitTimeout is
		*         out of bounds
		* @throws IOException if obtain() throws IOException
		*/
   		obtainWithWaitTimeout : function(lockWaitTimeout){
			this.failureReason = null;
			var locked = this.obtain();
			if (lockWaitTimeout < 0 && lockWaitTimeout != Lock.LOCK_OBTAIN_WAIT_FOREVER)
				throw new IllegalArgumentException("lockWaitTimeout should be LOCK_OBTAIN_WAIT_FOREVER or a non-negative number (got " + lockWaitTimeout + ")");
			
			var maxSleepCount = lockWaitTimeout / Lock.LOCK_POLL_INTERVAL;
			var sleepCount = 0;
			while (!locked) {
			  if (lockWaitTimeout != Lock.LOCK_OBTAIN_WAIT_FOREVER && sleepCount++ >= maxSleepCount) {
			    var reason = "Lock obtain timed out: " + this.toString();
			    if (this.failureReason != null) {
			      reason += ": " + this.failureReason;
			    }
			    var e = new LockObtainFailedException(reason);
			    if (this.failureReason != null) {
			      e.initCause(this.failureReason);
			    }
			    throw e;
			  }
			  try {
			  	Thread.sleep(Lock.LOCK_POLL_INTERVAL);			    
			  } catch (ie) {
			    throw new ThreadInterruptedException(ie);
			  }
			  locked = this.obtain();
			}
			return locked;			
		},
		//TODO - modify the function to suit node's async nature. Apache Lucene uses a thread pool to do the lock
		// here we shall do async
		/** Attempts to obtain an exclusive lock within amount of
		 *  time given. Polls once per {@link #LOCK_POLL_INTERVAL}
		 *  (currently 1000) milliseconds until lockWaitTimeout is
		 *  passed.
		 * @param lockWaitTimeout length of time to wait in
		 *        milliseconds or {@link
		 *        #LOCK_OBTAIN_WAIT_FOREVER} to retry forever
		 * @throws LockObtainFailedException if lock wait times out
		 * @throws IllegalArgumentException if lockWaitTimeout is
		 *         out of bounds
		 * @throws IOException if obtain() throws IOException
		 *
		 * @callback - function(result, error)
		 *				@param result - true if lock is obtained
		 *				@param error - the error obj if lock failed
		 */
		obtainWithWaitTimeoutAsync: function(lockWaitTimeout, callback) {
			if (this._timeoutId != null) return; //if an active obtain in process, ignore it 
			this.failureReason = null;
			var locked = this.obtain();
			if (lockWaitTimeout < 0 && lockWaitTimeout != Lock.LOCK_OBTAIN_WAIT_FOREVER) 
				throw new IllegalArgumentException("lockWaitTimeout should be LOCK_OBTAIN_WAIT_FOREVER or a non-negative number (got " + lockWaitTimeout + ")");
			//note if lockWaitTime is < lock_pool_interval, no further lock attempt happens
			var maxSleepCount = Math.floor(lockWaitTimeout / Lock.LOCK_POLL_INTERVAL);
			var sleepCount = 0;
			var self = this;
			var lockFunc = function() {
					//time out, throw exp
					if (lockWaitTimeout != Lock.LOCK_OBTAIN_WAIT_FOREVER && sleepCount++ >= maxSleepCount) {
						var reason = "Lock obtain timed out: " + self.toString();
						if (this.failureReason != null) {
							reason += ": " + this.failureReason;
						}
						var e = new LockObtainFailedException(reason);
						if (this.sfailureReason != null) {
							e.initCause(this.failureReason);
						}
						clearTimeout(self._timeoutId);
						self._timeoutId = null;
						return callback(false, e);
						//throw e;
					}
					//attempt to obtain lock
					locked = self.obtain();
					//if success, return
					if (locked) {
						clearTimeout(self._timeoutId);
						self._timeoutId = null;
						return callback(true, null);
					} else {
						self._timeoutId = setTimeout(lockFunc, Lock.LOCK_POLL_INTERVAL);
					}
				}; //lockFunc
			if (!locked) this._timeoutId = setTimeout(lockFunc, Lock.LOCK_POLL_INTERVAL);
			else callback(true, null);
		},
		/** Releases exclusive access. */
		release: function() {
			throw new ImplNotSupportedException("release not implemented in Lock class");
		},
		/** Returns true if the resource is currently locked.  Note that one must
		 * still call {@link #obtain()} before using the resource. */
		isLocked: function() {
			throw new ImplNotSupportedException("isLocked not implemented in Lock class");
		}
	}
});
Lock.With = With;
module.exports = exports = Lock;