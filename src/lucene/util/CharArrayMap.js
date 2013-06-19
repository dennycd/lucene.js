var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var Version = require('library/lucene/util/Version.js');
var CharacterUtils = require('library/lucene/util/CharacterUtils.js');

var AbstractMap = require('library/lucene/util/AbstractMap.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');


/**
 * A simple class that stores key Strings as char[]'s in a
 * hash table. Note that this is not a general purpose
 * class.  For example, it cannot remove items from the
 * map, nor does it resize its hash table to be smaller,
 * etc.  It is designed to be quick to retrieve items
 * by char[] keys without the necessity of converting
 * to a String first.
 *
 * <a name="version"></a>
 * <p>You must specify the required {@link Version}
 * compatibility when creating {@link CharArrayMap}:
 * <ul>
 *   <li> As of 3.1, supplementary characters are
 *       properly lowercased.</li>
 * </ul>
 * Before 3.1 supplementary characters could not be
 * lowercased correctly due to the lack of Unicode 4
 * support in JDK 1.4. To use instances of
 * {@link CharArrayMap} with the behavior before Lucene
 * 3.1 pass a {@link Version} &lt; 3.1 to the constructors.
 */
var CharArrayMap = defineClass({
	name : "CharArrayMap",
	extend : AbstractMap, 
	statics : {
		EMPTY_MAP : null, 
		INIT_SIZE : 8,		

	
		copy : function( matchVersion, map) {
			return map;
		}
  
	},
	variables : {
		charUtils : null, //new CharacterUtils(),
		ignoreCase : false, //true/false  
		count : 0, 
		matchVersion : null, 
		keys : null, // char[][] 
		values : new Array()
	},
	
	construct : function(){
		AbstractMap.call(this);
	
		if(arguments.length==0){}
		else if(arguments.length==1){   /** Create set from the supplied map (used internally for readonly maps...) */
			if(!Class.isInstanceOfClass(arguments[0],"CharArrayMap")) throw new IllegalArgumentException("args invalid");
			var toCopy = arguments[0];
		    this.keys = toCopy.keys;
		    this.values = toCopy.values;
		    this.ignoreCase = toCopy.ignoreCase;
		    this.count = toCopy.count;
		    this.charUtils = toCopy.charUtils;
		    this.matchVersion = toCopy.matchVersion;    			
		}
		else if(arguments.length==3){
			if(!Class.isInstanceOfClass(arguments[0],"Version")) throw new IllegalArgumentException("version invalid");
			this.matchVersion = arguments[0];
			
			if(typeof(arguments[1])=="number"){
				var startSize = arguments[1];
				var size = CharArrayMap.INIT_SIZE;
				while(startSize + (startSize>>2) > size) 
					size <<= 1;
				this.keys = new Array(size); 
				for(var i in keys) keys[i] = [];
				this.values = new Array(size); 
				this.charUtils = CharacterUtils.getInstance(matchVersion);
			}
			else if(Class.isInstanceOfClass(arguments[1], "Map")){
				var startSize = arguments[1].size();
				var size = CharArrayMap.INIT_SIZE;
				while(startSize + (startSize>>2) > size) 
					size <<= 1;
				this.keys = new Array(size); 
				for(var i in keys) keys[i] = [];
				this.values = new Array(size); 
				this.charUtils = CharacterUtils.getInstance(matchVersion);				
			
				this.putAll(arguments[1]);
			}
			
			if(typeof(arguments[2])!="boolean") throw new IllegalArgumentException("ignoreCase invalid");
			this.ignoreCase = arguments[2];
			
		}else throw new IllegalArgumentException("args invalid");
	}
	
});


///CharArrayMap.EMPTY_MAP = new EmptyCharArrayMap();



module.exports = exports = CharArrayMap;