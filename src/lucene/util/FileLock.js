var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var logger = require('winston');
var LockFileUtil = require('lockfile');

/**
	REFERENCE http://docs.oracle.com/javase/7/docs/api/java/nio/channels/FileLock.html
**/
var FileLock = defineClass({
	name : "FileLock",
	construct : function(pathname, fd){
		this.pathname = pathname;
		this.fd = fd;
	},
	
	methods : {
		
		release : function(){
			if(LockFileUtil.checkSync(this.pathname)==true){
				LockFileUtil.unlockSync(this.pathname);
			}
		}
		
	}
});

module.exports = exports = FileLock;