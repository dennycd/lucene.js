var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Lock = require('library/lucene/store/Lock.js');
var FSLockFactory = require('library/lucene/store/FSLockFactory.js');
var File = require('library/lucene/util/File.js');
var RandomAccessFile = require('library/lucene/util/RandomAccessFile.js');
var HashSet = require('library/lucene/util/HashSet.js');
var synchronized = require('library/thread').Synchronized;
var IOException = require('library/lucene/util/IOException.js');
var LockReleaseFailedException = require('library/lucene/store/LockReleaseFailedException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var FileChannel = require('library/lucene/util/FileChannel.js');
var FileLock = require('library/lucene/util/FileLock.js');

/**
	Implements LockFactory using native OS file locks.
**/
var NativeFSLockFactory = defineClass({
	name: "NativeFSLockFactory",
	extend: FSLockFactory,
/**
	 
	 @param opts.lockDirName -  where lock files are created. (String)
	 @param opts.lockDir -  where lock files are created. (File)
	**/
	construct: function() {
		FSLockFactory.call(this);
		
		if(arguments.length==1){
			if(typeof(arguments[0])=="string")
				this.setLockDir(new File(arguments[0]));
			else if(Class.isInstanceOfClass(arguments[0], "File"))
				this.setLockDir(arguments[0]);
			else
				throw new IllegalArgumentException();
		}
		else if(arguments.length==0)
			this.setLockDir(null);
		else 
			throw new IllegalArgumentException();
	},
	methods: {
		//@Override
		//public synchronized Lock makeLock(String lockName) {
		// lockName :  write.lock
		// directory is usually the index folder 
		makeLock: function(lockName) {
			if (this.lockPrefix != null) lockName = this.lockPrefix + "-" + lockName;
			return new NativeFSLock(this.lockDir, lockName);
		},
		//@Override
		//not neccesarily getting called 
		//public void clearLock(String lockName) throws IOException {
		clearLock: function(lockName) {
			// Note that this isn't strictly required anymore
			// because the existence of these files does not mean
			// they are locked, but, still do this in case people
			// really want to see the files go away:
			if (this.lockDir.exists()) {
				// Try to release the lock first - if it's held by another process, this
				// method should not silently fail.
				// NOTE: makeLock fixes the lock name by prefixing it w/ lockPrefix.
				// Therefore it should be called before the code block next which prefixes
				// the given name.
				this.makeLock(lockName).release();
				if (this.lockPrefix != null) {
					lockName = this.lockPrefix + "-" + lockName;
				}
				// As mentioned above, we don't care if the deletion of the file failed.
				(new File(this.lockDir, lockName)).delete();
			}
		}
	}
});


var NativeFSLock = defineClass({
	name: "NativeFSLock",
	extend: Lock,
	statics: {
		LOCK_HELD: new HashSet()
	},
/**
	 @param lockDir - File 
	 @param lockFileName - String
	**/
	construct: function(lockDir, lockFileName) {
		Lock.call(this);
		//the lock directory 
		this.lockdir = lockDir;
		//the full path to the lock file 
		this.path = new File(lockDir, lockFileName);
		//RandomAccessFile
		this.f = null;
		//FileChannel
		this.channel = null;
		//FileLock
		this.lock = null;
	},
	methods: {
/**
		 @return true if lock exists 
		**/
		lockExists: function() {
			return this.lock != null;
		},
		//@Override
		obtain: function() {
			if (this.lockExists()) {
				// Our instance is already locked:
				return false;
			}
			// Ensure that lockDir exists and is a directory.
			if (!this.lockDir.exists()) {
				if (!this.lockDir.mkdirs()) throw new IOException("Cannot create directory: " + this.lockDir.getAbsolutePath());
			} else if (!this.lockDir.isDirectory()) {
				// TODO: NoSuchDirectoryException instead?
				throw new IOException("Found regular file where directory expected: " + this.lockDir.getAbsolutePath());
			}
			var canonicalPath = this.path.getCanonicalPath();
			var markedHeld = false;
			try {
				// Make sure nobody else in-process has this lock held
				// already, and, mark it held if not:
				synchronized(NativeFSLock.LOCK_HELD, function() {
					if (NativeFSLock.LOCK_HELD.contains(canonicalPath)) {
						// Someone else in this JVM already has the lock:
						return false;
					} else {
						// This "reserves" the fact that we are the one
						// thread trying to obtain this lock, so we own
						// the only instance of a channel against this
						// file:
						NativeFSLock.LOCK_HELD.add(canonicalPath);
						markedHeld = true;
					}
				});
				//actually creating the lock file 
				try {
					this.f = new RandomAccessFile(this.path, "rw");
				} catch (e) {
					// On Windows, we can get intermittent "Access
					// Denied" here.  So, we treat this as failure to
					// acquire the lock, but, store the reason in case
					// there is in fact a real error case.
					this.failureReason = e;
					this.f = null;
				}
				//lock the file access on OS level
				if (this.f != null) {
					try {
						//channel is on the lock file, not the directory
						this.channel = f.getChannel();
						try {
							//Attempts to acquire an exclusive lock on this channel's file.
							this.lock = channel.tryLock();
						} catch (e) {
							// At least on OS X, we will sometimes get an
							// intermittent "Permission Denied" IOException,
							// which seems to simply mean "you failed to get
							// the lock".  But other IOExceptions could be
							// "permanent" (eg, locking is not supported via
							// the filesystem).  So, we record the failure
							// reason here; the timeout obtain (usually the
							// one calling us) will use this as "root cause"
							// if it fails to get the lock.
							this.failureReason = e;
						} finally {
							if (this.lock == null) {
								try {
									this.channel.close();
								} finally {
									this.channel = null;
								}
							}
						}
					} finally {
						if (this.channel == null) {
							try {
								this.f.close();
							} finally {
								this.f = null;
							}
						}
					}
				} //if(f!=null)
			} finally {
				if (markedHeld && !this.lockExists()) {
					synchronized(NativeFSLock.LOCK_HELD, function() {
						if (NativeFSLock.LOCK_HELD.contains(canonicalPath)) {
							NativeFSLock.LOCK_HELD.remove(canonicalPath);
						}
					});
				}
			}
			return this.lockExists();
		},
		//@Override
		release: function() {
			if (this.lockExists()) {
				try {
					this.lock.release();
				} finally {
					this.lock = null;
					try {
						this.channel.close();
					} finally {
						this.channel = null;
						try {
							this.f.close();
						} finally {
							this.f = null;
							synchronized(NativeFSLock.LOCK_HELD, function() {
								NativeFSLock.LOCK_HELD.remove(this.path.getCanonicalPath());
							});
						}
					}
				}
				// LUCENE-2421: we don't care anymore if the file cannot be deleted
				// because it's held up by another process (e.g. AntiVirus). NativeFSLock
				// does not depend on the existence/absence of the lock file
				this.path.delete();
				
			} else {
				// if we don't hold the lock, and somebody still called release(), for
				// example as a result of calling IndexWriter.unlock(), we should attempt
				// to obtain the lock and release it. If the obtain fails, it means the
				// lock cannot be released, and we should throw a proper exception rather
				// than silently failing/not doing anything.
				var obtained = false;
				try {
					if (!(obtained = this.obtain())) {
						throw new LockReleaseFailedException("Cannot forcefully unlock a NativeFSLock which is held by another indexer component: " + this.path);
					}
				} finally {
					if (obtained) {
						this.release();
					}
				}
			}
		},
		//@Override
		isLocked: function() {
			// The test for is isLocked is not directly possible with native file locks:
			// First a shortcut, if a lock reference in this instance is available
			if (this.lockExists()) return true;
			// Look if lock file is present; if not, there can definitely be no lock!
			if (!this.path.exists()) return false;
			// Try to obtain and release (if was locked) the lock
			try {
				var obtained = this.obtain();
				if (obtained) this.release();
				return !obtained;
			} catch (ioe) {
				return false;
			}
		},
		//@Override
		toString: function() {
			return "NativeFSLock@" + this.path;
		}
	}
});
module.exports = exports = NativeFSLockFactory;