var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Lockable = require('library/thread').Lockable;
/**
 A Wrapper Class implementing HashSet 
 REFERENCE http://docs.oracle.com/javase/7/docs/api/java/util/HashSet.html
 
 Set Definition  REFERENCE http://docs.oracle.com/javase/7/docs/api/java/util/Set.html
 A collection that contains no duplicate elements. More formally, sets contain no pair of elements e1 and e2 such that e1.equals(e2), and at most one null element.
 
**/
var HashSet = defineClass({
	name : "HashSet",
	extend : Lockable,
	construct : function(){
		this.base = {};
	},
	
	methods : {
	
		forEach : function(op){
			for(var elem in this.base) op(elem);
		},
		
		//check if the set contains the specified element
		contains : function(elem){
			return (this.base[elem]!=null);
		},
		
		//add a new element 
		add : function(elem){
			this.base[elem] = true;
		},
		
		remove : function(elem){
			delete this.base[elem];
		},
		
		//REFERENCE http://docs.oracle.com/javase/7/docs/api/java/util/AbstractSet.html#removeAll(java.util.Collection)
		//Removes from this set all of its elements that are contained in the specified collection
		removeAll : function(set){
			assert(Class.isInstanceOfClass(set, "HashSet"));
			var self = this;
			set.forEach(function(elem){
				if(self.contains(elem)) 
					self.remove(elem);
			});
		},
		
		//REFERENCE http://docs.oracle.com/javase/7/docs/api/java/util/AbstractCollection.html#retainAll(java.util.Collection)
		//removes from this collection all of its elements that are not contained in the specified collection.
		retainAll : function(set){
			assert(Class.isInstanceOfClass(set,"HashSet"));
			var removes = [];
			for(var elem in this.base){
				if(!set.contains(elem)) removes.push(elem);
			}
			for(var i=0;i<removes.length;i++)
				set.remove(removes[i]);
		}
	}
});

module.exports = exports = HashSet;