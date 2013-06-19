var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var EOFException = require('library/lucene/util/EOFException.js');

var FSIndexInput = require('library/lucene/store/FSDirectory.js').FSIndexInput;
var IndexInputSlicer = require('library/lucene/store/Directory.js').IndexInputSlicer;
var FSDirectory = require('library/lucene/store/FSDirectory.js');
var synchronized = require('library/thread').Synchronized;

var IOException = require('library/lucene/util/IOException.js');

var OutOfMemoryError = require('library/lucene/util/OutOfMemoryError.js');

var logger = require('winston');

var File = require('library/lucene/util/File.js');


/** A straightforward implementation of {@link FSDirectory}
 *  using java.io.RandomAccessFile.  However, this class has
 *  poor concurrent performance (multiple threads will
 *  bottleneck) as it synchronizes when multiple threads
 *  read from the same file.  It's usually better to use
 *  {@link NIOFSDirectory} or {@link MMapDirectory} instead.
 */
var SimpleFSDirectory = defineClass({
	name: "SimpleFSDirectory",
	extend: FSDirectory,
	/** Create a new SimpleFSDirectory for the named location.
	 *
	 * @param path the path of the directory
	 * @param lockFactory the lock factory to use, or null for the default
	 * ({@link NativeFSLockFactory});
	 * @throws IOException if there is a low-level I/O error
	 */
	construct: function() {
		console.log("SimpleFSDirectory::construct");
		FSDirectory.apply(this,arguments);
		console.log("SimpleFSDirectory::construct done");
	},
	methods: { /** Creates an IndexInput for the file with the given name. */
		//@Override
		openInput: function(name, context) {
			console.log("SimpleFSDirectory::openInput");
			this.ensureOpen();
			var path = new File(this.directory, name);
			return new SimpleFSIndexInput("SimpleFSIndexInput(path=\"" + path.getPath() + "\")", path, context, this.getReadChunkSize());
		},
		//@Override
		//  public IndexInputSlicer createSlicer(final String name, final IOContext context) throws IOException
		createSlicer: function(name, context) {
			var self = this;
			this.ensureOpen();
			var file = new File(this.getDirectory(), name);
			var descriptor = new RandomAccessFile(file, "r");
			return Object.create(IndexInputSlicer, {
				//@Override
				close: function() {
					descriptor.close();
				}, 
				//@Override
				openSlice: function(sliceDescription, offset, length) {
					var desc = "SimpleFSIndexInput(" + sliceDescription + " in path=\"" + file.getPath() + "\" slice=" + offset + ":" + (offset + length) + ")";
					return new SimpleFSIndexInput(desc, descriptor, offset, length, BufferedIndexInput.bufferSize(context), self.getReadChunkSize());
				}, 
				//@Override
				openFullSlice: function() {
					try {
						return this.openSlice("full-slice", 0, descriptor.length());
					} catch (ex) {
						throw new RuntimeException(ex);
					}
				}
			});
		}
	}
});


var SimpleFSIndexInput = defineClass({
	name: "SimpleFSIndexInput",
	extend: FSIndexInput,
	construct: function() {
		//console.log("SimpleFSIndexInput::construct");
		FSIndexInput.apply(this, arguments);
		//console.log("SimpleFSIndexInput::construct done");
	},
	methods: { /** IndexInput methods */
		//@Override
		//    protected void readInternal(byte[] b, int offset, int len)
		readInternal : function(b, offset, len) {
			//console.log("SimpleFSIndexInput::readInternal offset="+offset + ", len="+len);
			var self = this;
			
			synchronized(this.file, function() {
			
			
				var position = self.off + self.getFilePointer();
				self.file.seek(position);
				var total = 0;
				if (position + len > self.end) {
					throw new EOFException("read past EOF: " + self);
				}
				try {
					do {
						var readLength;
						if (total + self.chunkSize > len) {
							readLength = len - total;
						} else {
							// LUCENE-1566 - work around JVM Bug by breaking very large reads into chunks
							readLength = self.chunkSize;
						}
						var i = self.file.read(b, offset + total, readLength);
						total += i;
					} while (total < len);
				} catch (e) {
/*
					// propagate OOM up and add a hint for 32bit VM Users hitting the bug
					// with a large chunk size in the fast path.
					var outOfMemoryError = new OutOfMemoryError("OutOfMemoryError likely caused by the Sun VM Bug described in " + "https://issues.apache.org/jira/browse/LUCENE-1566; try calling FSDirectory.setReadChunkSize " + "with a value smaller than the current chunk size (" + this.chunkSize + ")");
					outOfMemoryError.initCause(e);
					throw outOfMemoryError;
*/
/*
					
				} catch (ioe) {
					throw new IOException(ioe.getMessage() + ": " + this, ioe);
				}
*/
					throw new IOException(e.toString(), e);
				}
				
			}); //sync
		},
		//@Override
		seekInternal : function(position) {
			console.log("SimpleFSIndexInput::seekInternal");
			assert.ok(false,"not implemented here!!");
		}
	}
});
module.exports = exports = SimpleFSDirectory;