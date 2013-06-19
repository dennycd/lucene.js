var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

/**
 a mutex resource that allow one thread to access it at a time
**/
var Lockable = defineClass({
	name : "Lockable",
	construct : function(){
		
	},
	
	methods : {
		
		obtain : function(){
			
		},
		
		release : function(){
			
		}
	}
});


module.exports = exports = Lockable;