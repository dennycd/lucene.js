var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var FileLock = require('library/lucene/util/FileLock.js');
var LockFileUtil = require('lockfile');

/**
 	REFERENCE http://docs.oracle.com/javase/7/docs/api/java/nio/channels/FileChannel.html
**/
var FileChannel = defineClass({
	name : "FileChannel",
	construct : function(pathname){
		this.pathname = pathname;
	},
	
	methods : {
		
		/*
		Attempts to acquire an exclusive lock on this channel's file.
		@return A lock object representing the newly-acquired lock, or null if the lock could not be acquired because another program holds an overlapping lock
		*/
		tryLock : function(){
			
			var fd = null;
			try{
				fd = LockFileUtil.lockSync(this.pathname);
				if(!fd) return null;
			}catch(e){
				logger.warn("failed to acquire lock");
			}
			
			assert(LockFileUtil.checkSync(this.pathname)==true);
			return new FileLock(this.pathname, fd);
		},
		
		
		close : function(){
			
		}
	}
});

module.exports = exports = FileChannel;

