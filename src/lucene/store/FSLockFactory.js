var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IllegalStateException = require('library/lucene/util/IllegalStateException.js');

var LockFactory = require('library/lucene/store/LockFactory.js');
var File = require('library/lucene/util/File.js');


/**
	Base class for file system based locking implementation.
**/
var FSLockFactory = defineClass({
	name : "FSLockFactory",
	extend : LockFactory,
	construct : function(){
		LockFactory.call(this);
		
		/**
		* Directory for the lock files. (a File obj)
		*/
   		this.lockDir = null; 	
	},
	
	methods : {
		
		/**
		* Set the lock directory. This method can be only called
		* once to initialize the lock directory. It is used by {@link FSDirectory}
		* to set the lock directory to itself.
		* Subclasses can also use this method to set the directory
		* in the constructor.
		*/		
		setLockDir : function(lockDir){
			if(this.lockDir != null) throw new IllegalStateException("You can set the lock directory for this factory only once.");
			this.lockDir = lockDir;		
		},
		
		/**
		* Retrieve the lock directory.
		*/		
		getLockDir : function(){
			return this.lockDir;
		}
		
	}
	
});


module.exports = exports = FSLockFactory;