var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var Map = require('./Map.js');
var HashMap = require('./HashMap.js');

/**
A Red-Black tree based NavigableMap implementation. The map is sorted according to the natural ordering of its keys, or by a Comparator provided at map creation time, depending on which constructor is used.
http://docs.oracle.com/javase/7/docs/api/java/util/TreeMap.html

**/
var TreeMap = defineClass({
	name : "TreeMap",
	extend : HashMap,
	variables : {
	}, 
	construct : function(){
		HashMap.call(this);
	},
	
	methods : {
	}
});
module.exports = exports = TreeMap;