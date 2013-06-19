var util = require('util');
var assert = require('assert');
var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');


/**
 REFERENCE http://docs.oracle.com/javase/7/docs/api/java/util/Map.html
**/
var Map = defineInterface({
	name : "Map",
	methods : {
		
		size : function(){}
	}
});

module.exports = exports = Map;