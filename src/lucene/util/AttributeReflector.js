var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/**
 * This interface is used to reflect contents of {@link AttributeSource} or {@link AttributeImpl}.
 */
var AttributeReflector = defineClass({
	name : "AttributeReflector",
	construct : function(){},
	methods : {
		/**
		* This method gets called for every property in an {@link AttributeImpl}/{@link AttributeSource}
		* passing the class name of the {@link Attribute}, a key and the actual value.
		* E.g., an invocation of {@link org.apache.lucene.analysis.tokenattributes.CharTermAttributeImpl#reflectWith}
		* would call this method once using {@code org.apache.lucene.analysis.tokenattributes.CharTermAttribute.class}
		* as attribute class, {@code "term"} as key and the actual value as a String.
		*/
		reflect : function(attClass, key, value){throw new ImplNotSupportedException("reflect not implemented in AttributeReflector");}
	}
});

module.exports = exports = AttributeReflector;