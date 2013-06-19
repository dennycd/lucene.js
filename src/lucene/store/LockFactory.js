var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/**
 * <p>Base class for Locking implementation.  {@link Directory} uses
 * instances of this class to implement locking.</p>
 *
 * <p>Note that there are some useful tools to verify that
 * your LockFactory is working correctly: {@link
 * VerifyingLockFactory}, {@link LockStressTest}, {@link
 * LockVerifyServer}.</p>
 *
 * @see LockVerifyServer
 * @see LockStressTest
 * @see VerifyingLockFactory
 */
var LockFactory = defineClass({
	name : "LockFactory",
	construct : function(){
		this.lockPrefix = null;
	},
	
	statics : {
		
	},
	
	methods : {
		
		
		/**
		* Set the prefix in use for all locks created in this
		* LockFactory.  This is normally called once, when a
		* Directory gets this LockFactory instance.  However, you
		* can also call this (after this instance is assigned to
		* a Directory) to override the prefix in use.  This
		* is helpful if you're running Lucene on machines that
		* have different mount points for the same shared
		* directory.
		*/	
		setLockPrefix : function(lockPrefix){
			this.lockPrefix = lockPrefix;			
		},

		/**
		* Get the prefix in use for all locks created in this LockFactory.
		*/	
		getLockPrefix : function(){ return this.lockPrefix; },
		
		/**
		* Return a new Lock instance identified by lockName.
		* @param lockName name of the lock to be created.
		*/
		makeLock : function(lockName){ throw new ImplNotSupportedException("makeLock not implemented in LockFactory class"); },
		
		/**
		* Attempt to clear (forcefully unlock and remove) the
		* specified lock.  Only call this at a time when you are
		* certain this lock is no longer in use.
		* @param lockName name of the lock to be cleared.
		*/
		clearLock : function(lockName){  throw new ImplNotSupportedException("clearLock not implemented in LockFactory class"); }
	}
});

module.exports = exports = LockFactory;
