
var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');

/**
 http://docs.oracle.com/javase/7/docs/api/java/util/Collections.html
**/
var Collections = defineClass({
	name : "Collections",
	statics : {
		
		emptyMap : function(){
			
		},
		
		synchronizedSet : function(){
			
		},
		
		
		newSetFromMap : function(){
			
		},
		
		unmodifiableList : function(){
			
		},
		
		unmodifiableMap : function(map){
			return map;
		},
		
		unmodifiableCollection : function(col){
			return col;
		}
		
	}
});

module.exports = exports = Collections;