var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var Closeable = require('library/lucene/util/Closeable.js');
var LockFactory = require('library/lucene/store/LockFactory.js');

var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var EOFException = require('library/lucene/util/EOFException.js');
var AlreadyClosedException = require('library/lucene/store/AlreadyClosedException.js');

var IOUtils = require('library/lucene/util/IOUtils.js');

var BufferedIndexInput = require('library/lucene/store/BufferedIndexInput.js');
var IndexInput = require('library/lucene/store/IndexInput.js');


/** A Directory is a flat list of files.  Files may be written once, when they
 * are created.  Once a file is created it may only be opened for read, or
 * deleted.  Random access is permitted both when reading and writing.
 *
 * <p> Java's i/o APIs not used directly, but rather all i/o is
 * through this API.  This permits things such as: <ul>
 * <li> implementation of RAM-based indices;
 * <li> implementation indices stored in a database, via JDBC;
 * <li> implementation of an index as a single file;
 * </ul>
 *
 * Directory locking is implemented by an instance of {@link
 * LockFactory}, and can be changed for each Directory
 * instance using {@link #setLockFactory}.
 *
 */
var Directory = defineClass({
	name : "Directory",
	implement : Closeable,
	construct : function(){
		console.log("Directory::construct");
		
		this.isOpen = true;
		
		/** Holds the LockFactory instance (implements locking for
		* this Directory instance). */
		this.lockFactory = null;

		console.log("Directory::construct done");
	},
	
	statics : {
		
	},
	
	methods : {
		
		/**
		* Returns an array of strings, one for each file in the directory.
		* 
		* @throws NoSuchDirectoryException if the directory is not prepared for any
		*         write operations (such as {@link #createOutput(String, IOContext)}).
		* @throws IOException in case of other IO errors
		*/
		listAll : function(){throw new ImplNotSupportedException();},
		
		/** Returns true iff a file with the given name exists. */
		fileExists : function(name){throw new ImplNotSupportedException();},
		
		/** Removes an existing file in the directory. */
		deleteFile : function(name){throw new ImplNotSupportedException();},
		
		/**
		* Returns the length of a file in the directory. This method follows the
		* following contract:
		* <ul>
		* <li>Throws {@link FileNotFoundException} if the file does not exist
		* <li>Returns a value &ge;0 if the file exists, which specifies its length.
		* </ul>
		* 
		* @param name the name of the file for which to return the length.
		* @throws FileNotFoundException if the file does not exist.
		* @throws IOException if there was an IO error while retrieving the file's
		*         length.
		*/
		fileLength : function(name){throw new ImplNotSupportedException();},
		
		/** Creates a new, empty file in the directory with the given name.
		  Returns a stream writing this file. 
		  @return IndexOutput
		*/		
		createOutput : function(name, context){throw new ImplNotSupportedException();},


		/**
		* Ensure that any writes to these files are moved to
		* stable storage.  Lucene uses this to properly commit
		* changes to the index, to prevent a machine/OS crash
		* from corrupting the index.<br/>
		* <br/>
		* NOTE: Clients may call this method for same files over
		* and over again, so some impls might optimize for that.
		* For other impls the operation can be a noop, for various
		* reasons.
		*/
		sync : function(names){throw new ImplNotSupportedException();},
		
		
		/** Returns a stream reading an existing file, with the
		* specified read buffer size.  The particular Directory
		* implementation may ignore the buffer size.  Currently
		* the only Directory implementations that respect this
		* parameter are {@link FSDirectory} and {@link
		* CompoundFileDirectory}.
		* @return IndexInput
		*/
		openInput : function(name, context){throw new ImplNotSupportedException();},
  
   		
		/** Construct a {@link Lock}.
		* @param name the name of the lock file
		*/
   		makeLock : function(name) {
	   		return this.lockFactory.makeLock(name);
	   	},
	   	
		/**
		* Attempt to clear (forcefully unlock and remove) the
		* specified lock.  Only call this at a time when you are
		* certain this lock is no longer in use.
		* @param name name of the lock to be cleared.
		*/
		clearLock : function(name){
			if (this.lockFactory != null) {
			  this.lockFactory.clearLock(name);
			}
    	},
    	
  
	   
		/**
		* Set the LockFactory that this Directory instance should
		* use for its locking implementation.  Each * instance of
		* LockFactory should only be used for one directory (ie,
		* do not share a single instance across multiple
		* Directories).
		*
		* @param lockFactory instance of {@link LockFactory}.
		*/
		setLockFactory : function(lockFactory){
			assert(lockFactory != null);
			this.lockFactory = lockFactory;
			this.lockFactory.setLockPrefix(this.getLockID());
    	},
    	
		/**
		* Get the LockFactory that this Directory instance is
		* using for its locking implementation.  Note that this
		* may be null for Directory implementations that provide
		* their own locking implementation.
		*/
		getLockFactory : function() {
			return this.lockFactory;
		},
      	
		/**
		* Return a string identifier that uniquely differentiates
		* this Directory instance from other Directory instances.
		* This ID should be the same if two Directory instances
		* (even in different JVMs and/or on different machines)
		* are considered "the same index".  This is how locking
		* "scopes" to the right index.
		*/      	
		getLockID : function() {
			return this.toString();
		},


		/**
		* Copies the file <i>src</i> to {@link Directory} <i>to</i> under the new
		* file name <i>dest</i>.
		* <p>
		* If you want to copy the entire source directory to the destination one, you
		* can do so like this:
		* 
		* <pre class="prettyprint">
		* Directory to; // the directory to copy to
		* for (String file : dir.listAll()) {
		*   dir.copy(to, file, newFile); // newFile can be either file, or a new name
		* }
		* </pre>
		* <p>
		* <b>NOTE:</b> this method does not check whether <i>dest</i> exist and will
		* overwrite it if it does.
		*
		* @param to - target directory
		* @param src - source file name
		* @param dest - destination file name
		* @param context - IOContext
		* 
		*/
		copy : function(to, src, dest, context){
		
			var os = null;//IndexOutput
			var is = null;//IndexInput
			var priorException = null;//IOException
			
			try {
			  os = to.createOutput(dest, context);
			  is = this.openInput(src, context);
			  os.copyBytes(is, is.length());
			} 
			catch (ioe) {
			  priorException = ioe;
			} 
			finally {
				var success = false;
				try {
					IOUtils.closeWhileHandlingException(priorException, [os, is]);
					success = true;
				} 
				finally {
					if (!success){
						try {
							to.deleteFile(dest);
						} 
						catch (t) {
						}
					}
				}
			}
		},

		/**
		* Creates an {@link IndexInputSlicer} for the given file name.
		* IndexInputSlicer allows other {@link Directory} implementations to
		* efficiently open one or more sliced {@link IndexInput} instances from a
		* single file handle. The underlying file handle is kept open until the
		* {@link IndexInputSlicer} is closed.
		*
		* @throws IOException
		*           if an {@link IOException} occurs
		* @lucene.internal
		* @lucene.experimental
		*/
		//public IndexInputSlicer createSlicer(final String name, final IOContext context) throws IOException {
		createSlicer : function(name, context){
			var self = this;
			this.ensureOpen();
			return Object.create(IndexInputSlicer, {
				
				//private final IndexInput base = Directory.this.openInput(name, context);
				base : self.openInput(name,context), 
				
				//Override
				openSlice : function(sliceDescription, offset, length){
					return new SlicedIndexInput("SlicedIndexInput(" + sliceDescription + " in " + this.base + ")", this.base, offset, length);
				},
				
				//Override
				close : function(){
					this.base.close();
				},
				
				//Override
				openFullSlice : function(){
					return this.base.clone();
				}
				
			});	
		},
		

		/**
		* @throws AlreadyClosedException if this Directory is closed
		*/
		ensureOpen : function(){
			if (!this.isOpen) throw new AlreadyClosedException("Directory: this Directory is closed");
      	},		
  

  		//@Overrides
  		close : function(){throw new ImplNotSupportedException();},  
  		
		//@Override
		toString : function() {
			return  Object.prototype.toString.call(this) + " lockFactory=" + this.getLockFactory();
		}
	}
});


/**
* Allows to create one or more sliced {@link IndexInput} instances from a single 
* file handle. Some {@link Directory} implementations may be able to efficiently map slices of a file
* into memory when only certain parts of a file are required.   
* @lucene.internal
* @lucene.experimental
*/
var IndexInputSlicer = defineClass({
	name : "IndexInputSlicer",
	implement : Closeable, 
	construct : function(){},
	methods :{
		/**
		 * Returns an {@link IndexInput} slice starting at the given offset with the given length.
		 */
		//public abstract IndexInput openSlice(String sliceDescription, long offset, long length) throws IOException;
		openSlice : function(sliceDescription, offset, length){throw new ImplNotSupportedException();},
		/**
		 * Returns an {@link IndexInput} slice starting at offset <i>0</i> with a
		 * length equal to the length of the underlying file
		 * @deprecated Only for reading CFS files from 3.x indexes.
		 */		
		 //@Deprecated
		 // can we remove this somehow?
    	//public abstract IndexInput openFullSlice() throws IOException;		
    	openFullSlice : function(){throw new ImplNotSupportedException();},
    	
    	close : function(){throw new ImplNotSupportedException();}
	}
});



  
/** Implementation of an IndexInput that reads from a portion of
*  a file.
*/
var SlicedIndexInput = defineClass({
	name : "SlicedIndexInput",
	extend : BufferedIndexInput,
	
	//SlicedIndexInput(final String sliceDescription, final IndexInput base, final long fileOffset, final long length, int readBufferSize)
	construct : function(sliceDescription, base, fileOffset, length, readBufferSize){
		
		readBufferSize = readBufferSize || BufferedIndexInput.BUFFER_SIZE;
		BufferedIndexInput.call(this, "SlicedIndexInput(" + sliceDescription + " in " + base + " slice=" + fileOffset + ":" + (fileOffset+length) + ")", readBufferSize);
		
		
		this.base = base.clone();
		this.fileOffset = fileOffset;
		this.length = length;
	},
	
	methods : {
		
		//@Override
		clone : function(){
			var clone = BufferedIndexInput.prototype.clone.call(this);
			clone.base = this.base.clone();
			clone.fileOffset = this.fileOffset;
			clone.length = this.length;
			return clone;
		},
		
		/** Expert: implements buffer refill.  Reads bytes from the current
		 *  position in the input.
		 * @param b the array to read bytes into
		 * @param offset the offset in the array to start storing bytes
		 * @param len the number of bytes to read
		 */
		 readInternal : function(b, offset, len){
			var start = this.getFilePointer();
			if(start + len > length)
				throw new EOFException("read past EOF: " + this);
			this.base.seek(this.fileOffset + start);
			this.base.readBytes(b, offset, len, false);
		 },
		 
		/** Expert: implements seek.  Sets current position in this file, where
		 *  the next {@link #readInternal(byte[],int,int)} will occur.
		 * @see #readInternal(byte[],int,int)
		 */		 
		 //Override
		 seekInternal : function(pos){ throw new ImplNotSupportedException("seekInternal not implemented in SlicedIndexInput");},
		 
		 
		 /** Closes the stream to further operations. */
		 //Override
		 close : function(){
		 	this.base.close();
		 },
		 
		 //Override
		 length : function(){
		 	this.length;
		 }

	}
});


Directory.IndexInputSlicer = IndexInputSlicer;
Directory.SlicedIndexInput = SlicedIndexInput;

module.exports = exports = Directory;