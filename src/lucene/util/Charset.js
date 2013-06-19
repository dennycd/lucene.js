var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
/**
 A Javascript Implementation of Charset in Java 
 REFERENCE http://docs.oracle.com/javase/7/docs/api/java/nio/charset/Charset.html
**/
var Charset = defineClass({
	name : "Charset",
	
	statics : {
		
		/**
		 Returns a charset object for the named charset.
		 @param charsetName - The name of the requested charset; may be either a canonical name or an alias
		 @return A charset object for the named charset
		 
		 Throws:
		 	IllegalCharsetNameException - If the given charset name is illegal
		 	IllegalArgumentException - If the given charsetName is null
		 	UnsupportedCharsetException - If no support for the named charset is available in this instance of the Java virtual machine

		**/
		forName : function(charsetName){

		}
		
		
	}
	
	/**
		Initializes a new charset with the given canonical name and alias set.
	**/
	construct : function(canonicalName, aliases){
		
		
	},
	
	methods : {
		
	}
	
});

module.exports = exports = Charset;