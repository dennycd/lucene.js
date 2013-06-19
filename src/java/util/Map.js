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

		//Removes all of the mappings from this map (optional operation).
		clear : function(){}, 

		//Returns true if this map contains a mapping for the specified key.
		//@return bool
		containsKey : function(/* Object */ key){}, 
		
		//Returns true if this map maps one or more keys to the specified value.
		containsValue : function(/* Object */ value){}, 
		
		//Returns a Set view of the mappings contained in this map.
		//return Set<Map.Entry<K,V>>	
		entrySet : function(){}, 
		
		//Compares the specified object with this map for equality.
		//return boolean
		equals : function(/* Object */ o){}, 
		
		//Returns the value to which the specified key is mapped, or null if this map contains no mapping for the key.
		get : function(/* Object */ key){}, 
		
		
		//Returns the hash code value for this map.
		hashCode : function(){}, 
		
		//Returns true if this map contains no key-value mappings.
		//Return boolean
		isEmpty : function(){},
		
		//Returns a Set view of the keys contained in this map.
		//return Set<K>	
		keySet : function(){}, 
		
		//Associates the specified value with the specified key in this map (optional operation).
		put : function(/* K */ key, /* V */ value){}, 
		
		//Copies all of the mappings from the specified map to this map (optional operation).
		putAll : function(/* Map<? extends K,? extends V> */ m){}, 
		
		//Removes the mapping for a key from this map if it is present (optional operation).
		remove : function(/* Object */ key){}, 
		
		//Returns the number of key-value mappings in this map.
		size : function(){}, 
		
		//Returns a Collection view of the values contained in this map.				
		//return Collection<V>	
		values : function(){}
		
	}
});

module.exports = exports = Map;