var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');


var OneMerge = defineClass({
	name : "OneMerge"
});

var MergeTrigger = defineClass({
	name : "MergeTrigger"
});


var MergePolicy = defineClass({
	name : "MergePolicy"
});


MergePolicy.OneMerge = OneMerge;
MergePolicy.MergeTrigger = MergeTrigger;
module.exports = exports = MergePolicy;