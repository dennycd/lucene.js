var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');

/**
 REFERENCE http://docs.oracle.com/javase/7/docs/api/java/util/WeakHashMap.html
**/
var WeakHashMap = defineClass({
	name : "WeakHashMap"
});

module.exports = exports = WeakHashMap;