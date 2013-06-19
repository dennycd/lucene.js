var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

/**
 http://docs.oracle.com/javase/7/docs/api/java/lang/Character.html#MAX_RADIX
 
 Character information is based on the Unicode Standard, version 6.0.0.
**/
var Character = defineClass({
	name : "Character",
	statics : {
		
		/**
			The maximum radix available for conversion to and from strings.
			Javascript 
		**/
		MAX_RADIX : 36,
		
		/**
		 The minimum radix available for conversion to and from strings.
		 
		**/
		MIN_RADIX : 2,
		
	}
});
module.exports = exports = Character;