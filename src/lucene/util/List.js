var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var Collection = require('library/lucene/util/Collection.js');

var List = defineClass({
	name : "List",
	implement : Collection,
	construct : function(){
		
	},
	methods : {
		size : function(){
			
		}
	}
});
module.exports = exports = List;