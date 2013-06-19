var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');

/**
http://docs.oracle.com/javase/7/docs/api/java/util/Arrays.html

**/
var Arrays = defineClass({
	name : "Arrays",
	statics : {
	
		asList : function(){
			assert(null, "Arrays::asList");
		},
		
		fill : function(){
			if(arguments.length==2) return Arrays.fillWithValue.apply(this,arguments);
			else if(arguments.length==4) return Arrays.fillWithRangeValue.apply(this,arguments);
			else assert(null, "Arrays::fill");
		},
		
		fillWithValue : function(a, val){
			for(var i=0;i<a.length;i++) 
				a[i] = val;				
		}, 

		//Assigns the specified  value to each element of the specified range of the specified array .
		fillWithRangeValue : function(/* int[] */ a, /* int */ fromIndex, /* int */ toIndex, /* int */ val){
			for(var i=fromIndex;i<=toIndex;i++) 
				a[i] = val;	
		},

		/**
		Searches the specified array of longs for the specified value using the binary search algorithm. The array must be sorted (as by the sort(long[]) method) prior to making this call. \
		If it is not sorted, the results are undefined. If the array contains multiple elements with the specified value, there is no guarantee which one will be found.
		Parameters:
		a - the array to be searched
		key - the value to be searched for
		Returns:
		index of the search key, if it is contained in the array; otherwise, (-(insertion point) - 1). 
		The insertion point is defined as the point at which the key would be inserted into the array: the index of the first element greater than the key, 
		or a.length if all elements in the array are less than the specified key. Note that this guarantees that the return value will be >= 0 if and only if the key is found.
		**/
		 binarySearch : function(/* long[] */ a, /* long */ key){
				assert(a instanceof Array);
				assert(key != null); 
				
				var key_equal = function(v1,v2){
					if(typeof(v1)==typeof(v2))
						if(typeof(v1)=="object") || typeof(v1)=="function") return (v1===v2);
						else return v1==v2;
					return false;
				}
				
				var recursive_search = function(start, end){
					if(start > end) return -1;
					var mid = Math.floor((start+end)/2);
					if(key_equal(a[mid],key)) 
						return mid;
					else{
						var L = recursive_search(start, mid);
						if(L!=-1) return L;
						var R = recursive_search(mid+1, end);
						return R;
					}
				};
				
				var hit = recursive_search(0, a.length-1);
				return hit;
		 }, 
 
 
});

module.exports = exports = Arrays;