var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var Map = require('./Map.js');


/**
 Hash Table based implementation of the Map Interface 
 Java Reference  http://docs.oracle.com/javase/7/docs/api/java/util/HashMap.html
**/
var HashMap = defineClass({
	name : "HashMap",
	implement : Map,
	variables : {
		_base : new Object()  //hash map data
	}, 
	construct : function(){
		
	},
	
	methods : {

		//Removes all of the mappings from this map (optional operation).
		clear : function(){
			for(var p in this._base) 
				delete this._base[p];
		}, 

		//Returns true if this map contains a mapping for the specified key.
		//@return bool
		containsKey : function(/* Object */ key){
			return (this._base[key]!=undefined); // same as null
		}, 
		
		//Returns true if this map maps one or more keys to the specified value.
		containsValue : function(/* Object */ value){
			if(typeof(value)===undefined || typeof(value)===null) return false;
			var isPrimitiveType = typeof(value)=="string" || typeof(value)=="boolean" || typeof(value)=="number";
			for(var k in this._base){
				if(isPrimitiveType && this._base[k]==value) return true;
				if(!isPrimitiveType && value === this._base[k]) return true; 
			}
			return false;
		}, 
		
		//Returns a Set view of the mappings contained in this map.
		//return Set<Map.Entry<K,V>>	
		entrySet : function(){
			var arr = [];
			for(var k in this._base)
				arr.push([k, this._base[k]]);
			return arr;
		}, 
		
		//Compares the specified object with this map for equality.
		//return boolean
		equals : function(/* Object */ o){
			assert.ok(Class.isInstanceOfClass(o, "Map"));
			for(var k in this._base[k])
				if(!o.containsKey(k) || !o.containsValue(this._base[k])) return false;
			return true;
		}, 
		
		//Returns the value to which the specified key is mapped, or null if this map contains no mapping for the key.
		get : function(/* Object */ key){
			return this._base[key];
		}, 
		
		
/*
		//Returns the hash code value for this map.
		hashCode : function(){
			
		}, 
		
*/

		//Returns true if this map contains no key-value mappings.
		//Return boolean
		isEmpty : function(){
			return Object.keys(this._base).length==0;
		},
		
		//Returns a Set view of the keys contained in this map.
		//return Set<K>	
		keySet : function(){
			return Object.keys(this._base);
		}, 
		
		//Associates the specified value with the specified key in this map (optional operation).
		put : function(/* K */ key, /* V */ value){
			this._base[key] = value;
		}, 
		
		//Copies all of the mappings from the specified map to this map (optional operation).
		putAll : function(/* Map<? extends K,? extends V> */ m){
			this.clear();
			var keys = m.keySet();
			for(var k in keys)
				this.put(k, m.get(k));
		}, 
		
		//Removes the mapping for a key from this map if it is present (optional operation).
		remove : function(/* Object */ key){
			delete this._base[key];
		}, 
		
		//Returns the number of key-value mappings in this map.
		size : function(){
			return Object.keys(this._base);		
		}, 
		
		//Returns a Collection view of the values contained in this map.				
		//return Collection<V>	
		values : function(){
			var vals = [];
			for(var k in this._base) vals.push(this._base[k]);
			return vals;
		}
		
		
	}
});
module.exports = exports = HashMap;