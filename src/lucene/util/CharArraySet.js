var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var AbstractSet = require('library/lucene/util/AbstractSet.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var NullPointerException = require('library/lucene/util/NullPointerException.js');

var CharArrayMap = require('library/lucene/util/CharArrayMap.js');

/**
 * A simple class that stores Strings as char[]'s in a
 * hash table.  Note that this is not a general purpose
 * class.  For example, it cannot remove items from the
 * set, nor does it resize its hash table to be smaller,
 * etc.  It is designed to be quick to test if a char[]
 * is in the set without the necessity of converting it
 * to a String first.
 *
 * <a name="version"></a>
 * <p>You must specify the required {@link Version}
 * compatibility when creating {@link CharArraySet}:
 * <ul>
 *   <li> As of 3.1, supplementary characters are
 *       properly lowercased.</li>
 * </ul>
 * Before 3.1 supplementary characters could not be
 * lowercased correctly due to the lack of Unicode 4
 * support in JDK 1.4. To use instances of
 * {@link CharArraySet} with the behavior before Lucene
 * 3.1 pass a {@link Version} < 3.1 to the constructors.
 * <P>
 * <em>Please note:</em> This class implements {@link java.util.Set Set} but
 * does not behave like it should in all cases. The generic type is
 * {@code Set<Object>}, because you can add any object to it,
 * that has a string representation. The add methods will use
 * {@link Object#toString} and store the result using a {@code char[]}
 * buffer. The same behavior have the {@code contains()} methods.
 * The {@link #iterator()} returns an {@code Iterator<char[]>}.
 */
var CharArraySet = defineClass({
	name : "CharArraySet",
	extend : AbstractSet,
	statics : {


		/**
		* Returns a copy of the given set as a {@link CharArraySet}. If the given set
		* is a {@link CharArraySet} the ignoreCase property will be preserved.
		* <p>
		* <b>Note:</b> If you intend to create a copy of another {@link CharArraySet} where
		* the {@link Version} of the source set differs from its copy
		* {@link #CharArraySet(Version, Collection, boolean)} should be used instead.
		* The {@link #copy(Version, Set)} will preserve the {@link Version} of the
		* source set it is an instance of {@link CharArraySet}.
		* </p>
		* 
		* @param matchVersion
		*          compatibility match version see <a href="#version">Version
		*          note</a> above for details. This argument will be ignored if the
		*          given set is a {@link CharArraySet}.
		* @param set
		*          a set to copy
		* @return a copy of the given set as a {@link CharArraySet}. If the given set
		*         is a {@link CharArraySet} the ignoreCase property as well as the
		*         matchVersion will be of the given set will be preserved.
		*/
		copy : function(matchVersion, set) {		
			if(set == CharArraySet.EMPTY_SET)
			  return CharArraySet.EMPTY_SET;
		
			
			if(Class.isInstanceOfClass(set, "CharArraySet")){
			 	var source = set;
			 	return new CharArraySet(CharArrayMap.copy(source.map.matchVersion, source.map));
			}
			return new CharArraySet(matchVersion, set, false);
		},


		/**
		* Returns an unmodifiable {@link CharArraySet}. This allows to provide
		* unmodifiable views of internal sets for "read-only" use.
		* 
		* @param set
		*          a set for which the unmodifiable set is returned.
		* @return an new unmodifiable {@link CharArraySet}.
		* @throws NullPointerException
		*           if the given set is <code>null</code>.
		*/
		unmodifiableSet : function(set) {
/*
			if (set == null)
			  throw new NullPointerException("Given set is null");
			if (set == CharArraySet.EMPTY_SET)
			  return CharArraySet.EMPTY_SET;
			if (set.map instanceof CharArrayMap.UnmodifiableCharArrayMap)
			  return set;
			return new CharArraySet(CharArrayMap.unmodifiableMap(set.map));
*/
			return this;
		},
				
		EMPTY_SET : null,
		PLACEHOLDER : null
  
	},
	variables : {
		map : null 	
	},
	
	construct : function(){
	
	
		if(arguments.length==0){}
		else if(arguments.length==1){ /** Create set from the specified map (internal only), used also by {@link CharArrayMap#keySet()} */
		
			if(!Class.isInstanceOfClass(arguments[0],"CharArrayMap")) throw new IllegalArgumentException("args illegal");
			this.map = arguments[0];
		}
		else if(arguments.length==3){
				
			if(!Class.isInstanceOfClass(arguments[0],"Version")) throw new IllegalArgumentException("args illegal");			
			if(typeof(arguments[2])!="boolean") throw new IllegalArgumentException("args illegal");

			if(typeof(arguments[1])=="number"){
				this.map = new CharArrayMap(arguments[0], arguments[1], arguments[2]);
			}
			else if(Class.isInstanceOfClass(arguments[1],"Collection")){
				this.map = new CharArrayMap(arguments[0], arguments[1].size(), arguments[2]);
				this.addAll(arguments[1]);
			}
			else{
				var ex = new IllegalArgumentException("args invalid");
				console.log(ex.toString()); 
				throw ex;
			}
		}
		else throw new IllegalArgumentException("args illegal");
		
	},
	methods : {
		
	}
});


//CharArraySet.EMPTY_SET = new CharArraySet(CharArrayMap.emptyMap());

module.exports = exports = CharArraySet;