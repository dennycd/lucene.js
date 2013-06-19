var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Directory = require('library/lucene/store/Directory.js');
var File = require('library/lucene/util/File.js');
var RandomAccessFile = require('library/lucene/util/RandomAccessFile.js');
var FileNotFoundException = require('library/lucene/util/FileNotFoundException.js');
var IOException = require('library/lucene/util/IOException.js');
var ThreadInterruptedException = require('library/lucene/util/ThreadInterruptedException.js');
var NoSuchDirectoryException = require('library/lucene/util/NoSuchDirectoryException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var HashSet = require('library/lucene/util/HashSet.js');
var NativeFSLockFactory = require('library/lucene/store/NativeFSLockFactory.js');
var Constants = require('library/lucene/util/Constants.js');
var BufferedIndexInput = require('library/lucene/store/BufferedIndexInput.js');
var BufferedIndexOutput = require('library/lucene/store/BufferedIndexOutput.js');
/**
 * Base class for Directory implementations that store index
 * files in the file system.
 */
var FSDirectory = defineClass({
	name: "FSDirectory",
	extend: Directory,
	statics: {
		/**
		 * Default read chunk size.  This is a conditional default: on 32bit JVMs, it defaults to 100 MB.  On 64bit JVMs, it's
		 * <code>Integer.MAX_VALUE</code>.
		 *
		 * @see #setReadChunkSize
		 */
		DEFAULT_READ_CHUNK_SIZE: 100 * 1024 * 1024,
		// returns the canonical version of the directory, creating it if it doesn't exist.
		//private static File getCanonicalPath(File file) throws IOException {
		getCanonicalPath: function(file) {
			return new File(file.getCanonicalPath());
		},
		
		open : function(){
			if(arguments.length==1) return FSDirectory.openWithPath(arguments[0]);
			else return FSDirectory.openWithPathLockFactory.apply(this,arguments);
		}, 
		
		/** Creates an FSDirectory instance, trying to pick the
		 *  best implementation given the current environment.
		 *  The directory returned uses the {@link NativeFSLockFactory}.
		 *
		 *  <p>Currently this returns {@link MMapDirectory} for most Solaris
		 *  and Windows 64-bit JREs, {@link NIOFSDirectory} for other
		 *  non-Windows JREs, and {@link SimpleFSDirectory} for other
		 *  JREs on Windows. It is highly recommended that you consult the
		 *  implementation's documentation for your platform before
		 *  using this method.
		 *
		 * <p><b>NOTE</b>: this method may suddenly change which
		 * implementation is returned from release to release, in
		 * the event that higher performance defaults become
		 * possible; if the precise implementation is important to
		 * your application, please instantiate it directly,
		 * instead. For optimal performance you should consider using
		 * {@link MMapDirectory} on 64 bit JVMs.
		 *
		 * <p>See <a href="#subclasses">above</a> */
		openWithPath: function(path) {
			console.log("FSDirectory::openWithPath");
			return FSDirectory.openWithPathLockFactory(path, null);
		},
		/** Just like {@link #open(File)}, but allows you to
		 *  also specify a custom {@link LockFactory}. */
		openWithPathLockFactory: function(path, lockFactory) {
			console.log("FSDirectory::openWithPathLockFactory");
			var SimpleFSDirectory = require('library/lucene/store/SimpleFSDirectory.js');
			return new SimpleFSDirectory(path, lockFactory);
/*
			if ((Constants.WINDOWS || Constants.SUN_OS || Constants.LINUX)
			      && Constants.JRE_IS_64BIT && MMapDirectory.UNMAP_SUPPORTED) {
			  return new MMapDirectory(path, lockFactory);
			} else if (Constants.WINDOWS) {
			  return new SimpleFSDirectory(path, lockFactory);
			} else {
			  return new NIOFSDirectory(path, lockFactory);
			}
			*/
		}
	},
	/** Create a new FSDirectory for the named location (ctor for subclasses).
	 * @param path the path of the directory
	 * @param lockFactory the lock factory to use, or null for the default
	 * ({@link NativeFSLockFactory});
	 * @throws IOException if there is a low-level I/O error
	 */
	//FSDirectory(File path, LockFactory lockFactory)
	construct: function() {
		console.log("FSDirectory::construct");
		Directory.call(this);
		if (arguments.length >= 1) {
			var path = arguments[0];
			if (!Class.isInstanceOfClass(path, "File")) throw new IllegalArgumentException("FSDirectory path arguments invalid");
			var lockFactory = null;
			if (arguments.length >= 2 && arguments[1] != null) {
				lockFactory = arguments[1];
				if (!Class.isInstanceOfClass(lockFactory, "LockFactory")) throw new IllegalArgumentException("FSDirectory lockFactory invalid");
			} else lockFactory = new NativeFSLockFactory();
			this.directory = FSDirectory.getCanonicalPath(path);
			if (this.directory.exists() && !this.directory.isDirectory()) throw new NoSuchDirectoryException("file '" + this.directory + "' exists but is not a directory");
			this.setLockFactory(lockFactory);
			//// Files written, but not yet sync'ed
			this.staleFiles = new HashSet();
			// LUCENE-1566
			this.chunkSize = FSDirectory.DEFAULT_READ_CHUNK_SIZE;
		}
		console.log("FSDirectory::construct done");
	},
	methods: {
		//@Override
		setLockFactory: function(lockFactory) {
			Directory.prototype.setLockFactory.call(this, lockFactory);
			// for filesystem based LockFactory, delete the lockPrefix, if the locks are placed
			// in index dir. If no index dir is given, set ourselves
			if (Class.isInstanceOfClass(lockFactory, "FSLockFactory")) {
				var dir = lockFactory.getLockDir();
				// if the lock factory has no lockDir set, use the this directory as lockDir
				if (dir == null) {
					lockFactory.setLockDir(this.directory);
					lockFactory.setLockPrefix(null);
				} else if (dir.getCanonicalPath() == this.directory.getCanonicalPath()) {
					lockFactory.setLockPrefix(null);
				}
			}
		},
		/** Lists all files (not subdirectories) in the
		 *  directory.  This method never returns null (throws
		 *  {@link IOException} instead).
		 *
		 *  @throws NoSuchDirectoryException if the directory
		 *   does not exist, or does exist but is not a
		 *   directory.
		 *  @throws IOException if list() returns null
		 *
		 * @param dir - File
		 */
		listAllWithDirectory: function(dir) {
			console.log("FSDirectory::listAllWithDirectory");
			if (!dir.exists()) throw new NoSuchDirectoryException("directory '" + dir + "' does not exist");
			else if (!dir.isDirectory()) throw new NoSuchDirectoryException("file '" + dir + "' exists but is not a directory");
			// Exclude subdirs
			var result = dir.list(function(file) {
				return !file.isDirectory();
			});
			if (result == null) throw new IOException("directory '" + dir + "' exists and is a directory, but cannot be listed: list() returned null");
			return result;
		},
		/** Lists all files (not subdirectories) in the
		 * directory.
		 * @see #listAll(File)
		 */
		//@Override
		listAll: function() {
			console.log("FSDirectory::listAll");
			this.ensureOpen();
			return this.listAllWithDirectory(this.directory);
		},
		/** Returns true iff a file with the given name exists. */
		//@Override
		fileExists: function(name) {
			this.ensureOpen();
			var file = new File(this.directory, name);
			return file.exists();
		},
		/** Returns the time the named file was last modified. */
		fileModified: function(directory, name) {
			var file = new File(directory, name);
			return file.lastModified();
		},
		/** Returns the length in bytes of a file in the directory. */
		//@Override
		fileLength: function(name) {
			this.ensureOpen();
			var file = new File(this.directory, name);
			var len = file.length();
			if (len == 0 && !file.exists()) {
				throw new FileNotFoundException(name);
			} else {
				return len;
			}
		},
		/** Removes an existing file in the directory. */
		//@Override
		deleteFile: function(name) {
			this.ensureOpen();
			var file = new File(this.directory, name);
			if (!file.delete()) throw new IOException("Cannot delete " + file);
			this.staleFiles.remove(name);
		},
/** Creates an IndexOutput for the file with the given name. 
			@name - String
			@context - IOContext
		*/
		//@Override
		createOutput: function(name, context) {
			this.ensureOpen();
			this.ensureCanWrite(name);
			return new FSIndexOutput(this, name);
		},
/**
		 @param name - a file name under the current dir
		**/
		ensureCanWrite: function(name) {
			if (!this.directory.exists()) if (!this.directory.mkdirs()) throw new IOException("Cannot create directory: " + this.directory);
			var file = new File(this.directory, name);
			if (file.exists() && !file.delete()) // delete existing, if any
			throw new IOException("Cannot overwrite: " + file);
		},
/**
		 @param io - FSIndexOutput
		**/
		onIndexOutputClosed: function(io) {
			this.staleFiles.add(io.name);
		},
		//@Override
		//@param names - Collection<String>
		sync: function(toSync) {
			var self = this;
			this.ensureOpen();
			//Set<String> toSync = new HashSet<String>(names);
			toSync.retainAll(this.staleFiles); //filter out staled files
			toSync.forEach(function(name) {
				self.fsync(name);
			});
			this.staleFiles.removeAll(toSync);
		},
		//@Override
		getLockID: function() {
			this.ensureOpen();
			var dirName; // name to be hashed
			try {
				dirName = this.directory.getCanonicalPath();
			} catch (e) {
				throw new RuntimeException(e.toString(), e);
			}
			var digest = Number(0);
			for (var charIDX = 0; charIDX < dirName.length; charIDX++) {
				var ch = dirName.charAt(charIDX);
				digest = 31 * digest + Number(ch);
			}
			return "lucene-" + digest.toString(16); //Integer.toHexString(digest);
		},
		//TODO : synchronized function
		close: function() {
			this.isOpen = false;
		},
		/** @return the underlying filesystem directory */
		getDirectory: function() {
			this.ensureOpen();
			return this.directory;
		},
		//for debugging output
		toString: function() {
			return this.classname + "@" + this.directory + " lockFactory=" + this.getLockFactory();
		},
		/**
		 * Sets the maximum number of bytes read at once from the
		 * underlying file during {@link IndexInput#readBytes}.
		 * The default value is {@link #DEFAULT_READ_CHUNK_SIZE};
		 *
		 * <p> This was introduced due to <a
		 * href="http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=6478546">Sun
		 * JVM Bug 6478546</a>, which throws an incorrect
		 * OutOfMemoryError when attempting to read too many bytes
		 * at once.  It only happens on 32bit JVMs with a large
		 * maximum heap size.</p>
		 *
		 * <p>Changes to this value will not impact any
		 * already-opened {@link IndexInput}s.  You should call
		 * this before attempting to open an index on the
		 * directory.</p>
		 *
		 * <p> <b>NOTE</b>: This value should be as large as
		 * possible to reduce any possible performance impact.  If
		 * you still encounter an incorrect OutOfMemoryError,
		 * trying lowering the chunk size.</p>
		 */
		setReadChunkSize: function(chunkSize) {
			// LUCENE-1566
			if (chunkSize <= 0) {
				throw new IllegalArgumentException("chunkSize must be positive");
			}
			//if (!Constants.OS_IS_64BIT) {
			this.chunkSize = chunkSize;
			//}
		},
		/**
		 * The maximum number of bytes to read at once from the
		 * underlying file during {@link IndexInput#readBytes}.
		 * @see #setReadChunkSize
		 */
		getReadChunkSize: function() {
			// LUCENE-1566
			console.log("read chunk size = " + this.chunkSize);
			return this.chunkSize;
		},
		fsync: function(name) {
			var fullFile = new File(this.directory, name);
			var success = false;
			var retryCount = 0;
			var exc = null; //IOException
			while (!success && retryCount < 5) {
				retryCount++;
				var file = null; //RandomAccessFile
				try {
					try {
						file = new RandomAccessFile(fullFile, "rw");
						file.getFD().sync();
						success = true;
					} finally {
						if (file != null) file.close();
					}
				} catch (ioe) {
					if (exc == null) exc = ioe;
/*
			    try {
			      // Pause 5 msec
			      Thread.sleep(5);
			    } catch (InterruptedException ie) {
			      throw new ThreadInterruptedException(ie);
			    }
			    */
				}
			} //while
			if (!success)
			// Throw original exception
			throw exc;
		}
	} //methods
}); /** Base class for reading input from a RandomAccessFile */
var FSIndexInput = defineClass({
	name: "FSIndexInput",
	extend: BufferedIndexInput,
	variables: { /** the underlying RandomAccessFile */
		file: null,
		//RandomAccessFile
		isClone: false,
		/** maximum read length on a 32bit JVM to prevent incorrect OOM, see LUCENE-1566 */
		chunkSize: null,
		//int
		/** start offset: non-zero in the slice case */
		off: null,
		//int
		/** end offset (start+length) */
		end: null,
		//long
	},
	//protected FSIndexInput(String resourceDesc, File path, IOContext context, int chunkSize) throws IOException
	//protected FSIndexInput(String resourceDesc, RandomAccessFile file, long off, long length, int bufferSize, int chunkSize)
	construct: function() { /** Create a new FSIndexInput, reading the entire file from <code>path</code> */
		////protected FSIndexInput(String resourceDesc, File path, IOContext context, int chunkSize) throws IOException
		console.log("FSIndexInput::construct " + arguments.length);
		if (arguments.length == 4) {
			var resourceDesc = arguments[0];
			var path = arguments[1];
			var context = arguments[2];
			var chunkSize = arguments[3];
			BufferedIndexInput.call(this, resourceDesc, context);
			if (!Class.isInstanceOfClass(path, "File")) throw new IllegalArgumentException("path not a file class");
			if (typeof(chunkSize) != "number" || isNaN(chunkSize)) throw new IllegalArgumentException("chunkSize invalid, got " + chunkSize);
			this.file = new RandomAccessFile(path, "r"); /** the underlying RandomAccessFile */
			this.chunkSize = chunkSize; /** maximum read length on a 32bit JVM to prevent incorrect OOM, see LUCENE-1566 */
			this.off = 0; /** start offset: non-zero in the slice case */
			this.end = this.file.length(); /** end offset (start+length) */
			this.isClone = false;
		} /** Create a new FSIndexInput, representing a slice of an existing open <code>file</code> */
		////protected FSIndexInput(String resourceDesc, RandomAccessFile file, long off, long length, int bufferSize, int chunkSize) 
		else if (arguments.length == 6) {
			BufferedIndexInput.call(this, arguments[0], arguments[4]);
			this.file = arguments[1];
			if (!Class.isInstanceOfClass(this.file, "RandomAccessFile")) throw new IllegalArgumentException();
			this.chunkSize = arguments[5];
			if (typeof(arguments[5]) != "numer" || isNaN(arguments[5])) throw new IllegalArgumentException();
			this.off = arguments[2];
			if (typeof(arguments[2]) != "numer" || isNaN(arguments[2])) throw new IllegalArgumentException();
			this.end = this.off + arguments[3];
			if (typeof(arguments[3]) != "numer" || isNaN(arguments[3])) throw new IllegalArgumentException();
			this.isClone = true; // well, we are sorta?
		} else if (arguments.length != 0) throw new IllegalArgumentException("FSIndexInput");
		console.log("FSIndexInput::construct done");
	},
	methods: {
		//@Override
		close: function() {
			console.log("FSIndexInput::close");

			// only close the file if this is not a clone
			if (!this.isClone) {
				this.file.close();
			}
		},
		//@Override
		clone: function() {
			var clone = BufferedIndexInput.prototype.clone.call(this);
			clone.isClone = true;
			return clone;
		},
		//@Override
		length: function() {
			return this.end - this.off;
		},
		/** Method used for testing. Returns true if the underlying
		 *  file descriptor is valid.
		 */
		isFDValid: function() {
			return this.file.getFD().valid();
		}
	}
});
/**
 * Writes output with {@link RandomAccessFile#write(byte[], int, int)}
 */
var FSIndexOutput = defineClass({
	name: "FSIndexOutput",
	extend: BufferedIndexOutput,
/**	 
	 @param parent : FSDirectory
	 @param name : String
	**/
	//public FSIndexOutput(FSDirectory parent, String name)
	//
	construct: function(parent, name) {
		console.log("FSIndexOutput::construct");
		BufferedIndexOutput.call(this);
		if (arguments.length != 2) throw new IllegalArgumentException();
		if (!Class.isInstanceOfClass(arguments[0], "FSDirectory")) throw new IllegalArgumentException();
		if (typeof(arguments[1]) != "string") throw new IllegalArgumentException();
		this.parent = parent;
		this.name = name;
		this.file = new RandomAccessFile(new File(parent.directory, name), "rw");
		this.isOpen = true; // remember if the file is open, so that we don't try to close it more than once
	},
	methods: { /** output methods: */
		//@Override
		flushBuffer: function(b, offset, size) {
			assert(this.isOpen);
			this.file.write(b, offset, size);
		},
		//@Override
		close: function() {
			console.log("FSIndexOutput::close");
			this.parent.onIndexOutputClosed(this);
			// only close the file if it has not been closed yet
			if (this.isOpen) {
				var success = false;
				try {
					BufferedIndexOutput.prototype.close.call(this);
					success = true;
				} finally {
					this.isOpen = false;
					if (!success) {
						try {
							this.file.close();
						} catch (t) {
							// Suppress so we don't mask original exception
							logger.error(t.toString());
						}
					} else {
						this.file.close();
					}
				}
			}
		},
		/** Random-access methods */
		//@Override
		seek: function(pos) {
			BufferedIndexOutput.prototype.seek.call(this, pos);
			this.file.seek(pos);
		},
		//@Override
		length: function() {
			return this.file.length();
		},
		//@Override
		setLength: function(length) {
			this.file.setLength(length);
		}
	}
});
FSDirectory.FSIndexOutput = FSIndexOutput;
FSDirectory.FSIndexInput = FSIndexInput;
module.exports = exports = FSDirectory;