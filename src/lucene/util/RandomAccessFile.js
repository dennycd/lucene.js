var util = require('util');
var assert = require('assert');
var fs = require('fs');
var logger = require('winston');
var clc = require('cli-color');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IOException = require('library/lucene/util/IOException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var FileNotFoundException = require('library/lucene/util/FileNotFoundException.js');

var File = require('library/lucene/util/File.js');
var FileDescriptor = require('library/lucene/util/FileDescriptor.js');

var FileChannel = require('library/lucene/util/FileChannel.js');
var Lockable = require('library/thread').Lockable;

var OpenMode = {
	READ : "r",
	READWRITE : "w+",
	READWRITESYNC : "rs+"
};

/**
  Implementation of Random Access File 
  JAVA REFERENCE http://docs.oracle.com/javase/7/docs/api/java/io/RandomAccessFile.html
**/
var RandomAccessFile = defineClass({
	name : "RandomAccessFile",
	extend : Lockable,
	variables : {
			//file open mode
			mode : null, 
			//file descriptor obj]
			fd  : null, 
			//internal file pointer position
			position : 0, 
			//file canonical path
			filepath : null, 
			//unique file channle associated 
			channel :  null	
	},
	/**	
	Creates a random access file stream to read from, and optionally to write to, the file specified by the File argument. 
	A new FileDescriptor object is created to represent this file connection.
	The mode argument specifies the access mode in which the file is to be opened. 

		"r"	 	Open for reading only. Invoking any of the write methods of the resulting object will cause an IOException to be thrown.
		"rw"	Open for reading and writing. If the file does not already exist then an attempt will be made to create it.
		"rws"	Open for reading and writing, as with "rw", and also require that every update to the file's content or 
					metadata be written synchronously to the underlying storage device.
		"rwd" 	Open for reading and writing, as with "rw", and also require that every update to the file's content be written synchronously to the underlying storage device.

	@param file - the file object
	@param mode - the access mode, as described above
	
	@throws 
		IllegalArgumentException - if the mode argument is not equal to one of "r", "rw", "rws", or "rwd"
		FileNotFoundException - if the mode is "r" but the given file object does not denote an existing regular file, 
							or if the mode begins with "rw" but the given file object does not denote an existing, 
							writable regular file and a new regular file of that name cannot be created, or if some other error occurs while opening or creating the file
	**/
	construct : function(file, mode){
		console.log("RandomAccessFile::construct");
		
		
		if(!Class.isInstanceOfClass(file, "File")) throw new IllegalArgumentException("file not a File object");
		var translator = {
			"r" : OpenMode.READ,
			"rw" : OpenMode.READWRITE,
			"rws" : OpenMode.READWRITESYNC,
			"rwd" : OpenMode.READWRITESYNC
		};
		
		if(!translator[mode]) throw new IllegalArgumentException("mode invalid");		
		if(translator[mode] == OpenMode.READ && !file.exists()) throw new FileNotFoundException(file.getCanonicalPath() + " does not exists");
				
		try{
			//file open mode
			this.mode = translator[mode]; 
			//file descriptor obj]
			var fd = fs.openSync(file.getPath(), this.mode);
			this.fd = new FileDescriptor(fd);
			//internal file pointer position
			this.position = 0;//this.length();
			//file canonical path
			this.filepath = file.getCanonicalPath(); 
			
			//unique file channle associated 
			this.channel = new FileChannel(this.filepath);
		}
		catch(e)
		{
			logger.error("file open failed: " + util.inspect(e));
			throw e;
		}

		//console.log("file " + this.filepath + " opened for mode " + mode);
		console.log("RandomAccessFile::construct done");
	},
	
	methods : {
	
		//Returns the unique FileChannel object associated with this file.
		getChannel : function(){ return this.channel; },
	
		/**
			Sets the file-pointer offset, measured from the beginning of this file, at which the next read or write occurs. 
			The offset may be set beyond the end of the file. Setting the offset beyond the end of the file does not change the file length. 
			The file length will change only by writing after the offset has been set beyond the end of the file.
		
			@param pos - the offset position, measured in bytes from the beginning of the file, at which to set the file pointer.
			@throw IOException - if pos is less than 0 or if an I/O error occurs.
		**/
		seek : function(pos){
			//console.log("RandomAccessFile seek pos="+pos);
			this.position = pos;
		},
	
	
		/**
			REFERENCE http://docs.oracle.com/javase/7/docs/api/java/io/RandomAccessFile.html#read(byte[], int, int)
			Reads up to len bytes of data from this file into an array of bytes.

			@b - the buffer into which the data is read.
			@off - the start offset in array b at which the data is written.
			@len - the maximum number of bytes read.

			@return the total number of bytes read into the buffer, or -1 if there is no more data because the end of the file has been reached.
		**/
		read : function(b, off, len){
			//console.log("RandomAccessFile read off="+off +", len="+len);
			if(!(b instanceof Buffer)) throw new IllegalArgumentException("b must be a buffer object");

			var bytesRead = 0;
			try{
				bytesRead = fs.readSync(this.fd.fd, b, off, len, this.position);
			}catch(e){
				logger.error("file read error: " + e.toString());
				throw new IOException("file read error: " + e.toString()); 
			}
			
			if(bytesRead!=len){
				logger.error("file read size not match: readsize="+len + ", actual="+bytesRead);
				throw new IOException("file read size not match: readsize="+len + ", actual="+bytesRead);				
			}
			
			this.position = this.position + len;
			//console.log("FILE POS => " + this.position);
			
			return bytesRead;
		},
	
		/**
			Writes len bytes from the specified Buffer starting at offset off to this file.
			@param b - the data.
			@param off - the start offset in the data.
			@param len - the number of bytes to write.
			@throw IOException - if an I/O error occurs.
		**/
		write : function(b, off, len){
			if(!(b instanceof Buffer)) throw new IllegalArgumentException("b must be a buffer object");
			
			var oldLength = this.length();
			if(this.position > oldLength) this.position = oldLength;

			var bytes = 0;
			try{
				bytes = fs.writeSync(this.fd.fd, b, off, len, this.position);
			}
			catch(e){
				logger.error("file write error: " + util.inspect(e));
				throw new IOException("file write error: " + util.inspect(e));
			}
			

			if(bytes != len){
				logger.error("file writtern size not match: writesize="+len + ", actual="+bytes);
				throw new IOException("file writtern size not match: writesize="+len + ", actual="+bytes);
			}
																									
			this.position = this.position + len;
		},
	
		/**
			Closes this random access file stream and releases any system resources associated with the stream. 
			A closed random access file cannot perform input or output operations and cannot be reopened.
			If this file has an associated channel then the channel is closed as well.
			
			@throw IOException - if an I/O error occurs.
		**/
		//@Override
		close : function(){
			console.log("RandomAccessFile::close");
			try{
				fs.closeSync(this.fd.fd);
			}catch(e){
				logger.error("file closing error for " + this.filepath);
				throw new IOException("file closing error for " + this.filepath);
			}
			
			//clean up some local vars
			this.filepath = null;
			this.fd = null;
		},
		
		/**
		Returns the opaque file descriptor object associated with this stream.
		
		@return the file descriptor object associated with this stream.
		@throw IOException - if an I/O error occurs.
		**/
		getFD : function(){
			return this.fd;
		},
		
		/**
		 @return the length of this file, measured in bytes.
		 @throw IOException - if an I/O error occurs.
		**/
		length : function(){
			var stat = fs.fstatSync(this.fd.fd);
			return stat.size;
		},
		
		/**
		
			Sets the length of this file.
			If the present length of the file as returned by the length method is greater than the newLength argument then the file will be truncated. 
			In this case, if the file offset as returned by the getFilePointer method is greater than newLength then after this method returns the offset will be equal to newLength.
			
			If the present length of the file as returned by the length method is smaller than the newLength argument then the file will be extended. 
			In this case, the contents of the extended portion of the file are not defined.

			@param newLength - The desired length of the file
			@throw IOException - If an I/O error occurs
		**/
		setLength : function(newLength){
			
			var oldLength = this.length();
			if(oldLength > newLength){   //truncation
				try{
					fs.ftruncateSync(this.fd.fd, newLength);
				}catch(e){
					logger.error("error truncating file " + this.filepath);
					throw new IOException("error truncating file " + this.filepath);
				}
				
				if(this.position > newLength)
					this.position = newLength;
					
				assert(this.length() == newLength);
			}
			else if(oldLength < newLength) //extend by filling extra with 0
			{	
				var extraSize = newLength - oldLength;			
				var buf = new Buffer(extraSize);
				buf.fill(0);
				
				var bytes = 0;
				try{
					bytes = fs.writeSync(this.fd.fd, buf, 0, extraSize, oldLength);
				}
				catch(e){
					logger.error("file write error: " + util.inspect(e));
					throw new IOException("file write error: " + util.inspect(e));
				}
				
				if(bytes != extraSize){
					logger.error("file writtern size not match: writesize="+extraSize + ", actual="+bytes);
					throw new IOException("file writtern size not match: writesize="+extraSize + ", actual="+bytes);
				}
				
				assert(newLength = this.length());
				
			}//
			
		}//setLength
		
	}
});


module.exports = exports = RandomAccessFile;