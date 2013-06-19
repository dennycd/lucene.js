var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var fs = require('fs');
var logger = require('winston');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
/**
 Node Wrapper for File / Directory 

 JAVA REFERENCE http://docs.oracle.com/javase/7/docs/api/java/io/File.html
 Node.js FileSystem REFERENCe http://nodejs.org/api/fs.html
**/
var File = defineClass({
	name: "File",
	variables : {
		pathname : null, 	
	},
	
	statics: {},
/**
	 Creates a new File instance by converting the given pathname string into an abstract pathname. 
	 If the given string is the empty string, then the result is the empty abstract pathname.
	
	 @ File(String pathname)   
	 @ File(File parent, String child)
	 @ File(String parent, String child)
	**/
	construct: function() {
		if (arguments.length == 1) {
			if (typeof(arguments[0]) != "string") throw new IllegalArgumentException();
			this.pathname = arguments[0];
		} else if (arguments.length == 2) {
			if (typeof(arguments[0]) == "string" && typeof(arguments[1]) == "string") this.pathname = this._concatpath(arguments[0], arguments[1]);
			else if (Class.isInstanceOfClass(arguments[0], "File") && typeof(arguments[1]) == "string") this.pathname = this._concatpath(arguments[0].getPath(), arguments[1]);
			else throw new IllegalArgumentException();
		} else new IllegalArgumentException();
	},
	methods: {
/**		
		 Tests whether the current process has permission to read the file denoted by this abstract pathname.
		 REFERENCE  http://pubs.opengroup.org/onlinepubs/009695399/functions/stat.html 
		 			http://docs.oracle.com/javase/7/docs/api/java/io/File.html#canRead()		 
		 interpretation of file mode http://stackoverflow.com/questions/9638714/xcode-c-missing-sperm
		 
		 @return true if and only if the file specified by this abstract pathname exists and can be read by the application; false otherwise
		**/
		canRead: function() {
			var S_IRUSR = 00400; //Read permission bit for the owner of the file.
			var S_IRGRP = 040; //Read permission bit for the group owner of the file. Usually 040. 
			var S_IROTH = 04; //Read permission bit for other users. 
			var stat = fs.statSync(this.pathname);
			var mode = Number(stat.mode);
			if (stat.uid == process.getuid()) { //owner of file
				return ((mode & S_IRUSR) == S_IRUSR); //if readable by owner
			} else if (process.getgroups().indexOf(stat.gid) != -1) { //an owner of the group
				console.log("readable by group");
				reurn((mode & S_IRGRP) == S_IRGRP); //if readable by group owner
			} else { //others
				console.log("readable by other");
				return ((mode & S_IROTH) == S_IROTH); //if readable by others
			}
		},
/**
		  list all files under this directory, excluding the filtered ones
		  @filter  - function(file)  where file is a file object for the file to be listed 
		  @return an array of files under this directory 
		**/
		list: function(filter) {
			var files = [];
			try {
				files = fs.readdirSync(this.pathname);
			} catch (e) {
				logger.error("list dir failed : " + util.inspect(e));
				return null;
			}
			if (filter && typeof(filter) == "function") {
				var finals = [];
				//filter step
				for (var idx in files) {
					var file = files[idx];
					var shouldEnlist = filter(new File(this._concatpath(this.pathname, file)));
					if (shouldEnlist) finals.push(file);
				}
				return finals;
			} else return files;
		},
		getPath: function() {
			return this.pathname;
		},
/**
		 Returns the canonical pathname string of this abstract pathname. A canonical pathname is both absolute and unique. 
		**/
		getCanonicalPath: function() {
			if (this.pathname.indexOf("/") == 0) return this.pathname;
			else {
				try {
					return fs.realpathSync(this.pathname);
				} catch (e) {
					logger.info("cannot obtain canonical path for " + this.pathname);
					return null;
				}
			}
		},
		exists: function() {
			return fs.existsSync(this.pathname);
		},
		isDirectory: function() {
			var stat = fs.statSync(this.pathname);
			return stat.isDirectory();
		},
/**
		  Creates the directory named by this abstract pathname, including any necessary but nonexistent parent directories. 
		  Note that if this operation fails it may have succeeded in creating some of the necessary parent directories.
		  
		  @param true if and only if the directory was created, along with all necessary parent directories; false otherwise
		**/
		mkdirs: function() {
			var dirs = this.pathname.split("/");
			var cur = null;
			for (var idx in dirs) {
				var dir = dirs[idx];
				//cur points to full path either absolute or relative up to dir
				if (cur == null) {
					if (dir.length == 0) cur = "/";
					else cur = dir;
				} else {
					if (dir.length == 0) break; //path has trailing "/" , simply stop
					else cur += "/" + dir;
				}
				if (fs.existsSync(cur)) {
					var stat = fs.statSync(cur);
					if (stat.isDirectory()) continue;
					else {
						console.log(cur + "exists and is not a directory");
						return false;
					}
				} else {
					try {
						fs.mkdirSync(cur);
					} catch (err) {
						console.log("mkdir error: " + util.inspect(err));
						return false;
					}
				}
			}
			return true;
		},
/**
		 Deletes the file or directory denoted by this abstract pathname. 
		 If this pathname denotes a directory, then the directory must be empty in order to be deleted.
		 
		 Note that the Files class defines the delete method to throw an IOException when a file cannot be deleted. 
		 This is useful for error reporting and to diagnose why a file cannot be deleted.
		
		@return true if and only if the file or directory is successfully deleted; false otherwise
		
		**/
		delete: function() {
			try {
				fs.rmdirSync(this.pathname);
			} catch (e) {
				console.log("ERROR: " + util.inspect(e));
				return false;
			}
			return true;
		},
/**
		 Returns the time that the file denoted by this abstract pathname was last modified.
		 @return A long value representing the time the file was last modified, 
		 	measured in milliseconds since the epoch (00:00:00 GMT, January 1, 1970), or 0L if the file does not exist or if an I/O error occurs
		**/
		lastModified: function() {
			var stat = fs.statSync(this.pathname);
			return stat.mtime.getTime();
		},
/**
		 Returns the length of the file denoted by this abstract pathname. The return value is unspecified if this pathname denotes a directory.
		 @return The length, in bytes, of the file denoted by this abstract pathname, 
		 	or 0L if the file does not exist. Some operating systems may return 0L for pathnames denoting system-dependent entities such as devices or pipes.
		**/
		length: function() {
			var stat = fs.statSync(this.pathname);
			return stat.size;
		},
		_concatpath: function(dirname, filename) {
			assert(filename.charAt(0) != "/");
			if (dirname.charAt(dirname.length - 1) == "/") return dirname + filename;
			else return dirname + "/" + filename;
		}
	}
});
module.exports = exports = File;