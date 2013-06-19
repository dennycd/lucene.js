var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');

var Attribute = require('library/lucene/util/Attribute.js');
var Cloneable = require('library/lucene/util/Cloneable.js');

var AttributeReflector = require('library/lucene/util/AttributeReflector.js');

/**
 * Base class for Attributes that can be added to a 
 * {@link org.apache.lucene.util.AttributeSource}.
 * <p>
 * Attributes are used to add data in a dynamic, yet type-safe way to a source
 * of usually streamed objects, e. g. a {@link org.apache.lucene.analysis.TokenStream}.
 */
var AttributeImpl = defineClass({
	name : "AttributeImpl",
	implement : [Cloneable, Attribute],
	construct : function(){},
	methods : {
		
		/**
		* Clears the values in this AttributeImpl and resets it to its 
		* default value. If this implementation implements more than one Attribute interface
		* it clears all.
		*/
		clear : function(){throw new ImplNotSupportedException("clear not implemented in AttributeImpl");},
  
		
		/**
		* This method returns the current attribute values as a string in the following format
		* by calling the {@link #reflectWith(AttributeReflector)} method:
		* 
		* <ul>
		* <li><em>iff {@code prependAttClass=true}:</em> {@code "AttributeClass#key=value,AttributeClass#key=value"}
		* <li><em>iff {@code prependAttClass=false}:</em> {@code "key=value,key=value"}
		* </ul>
		*
		* @see #reflectWith(AttributeReflector)
		*/
		reflectAsString : function(prependAttClass) {
			final StringBuilder buffer = new StringBuilder();
			reflectWith(new AttributeReflector() {
			  @Override
			  public void reflect(Class<? extends Attribute> attClass, String key, Object value) {
			    if (buffer.length() > 0) {
			      buffer.append(',');
			    }
			    if (prependAttClass) {
			      buffer.append(attClass.getName()).append('#');
			    }
			    buffer.append(key).append('=').append((value == null) ? "null" : value);
			  }
			});
			return buffer.toString();
    	},

		/**
		* This method is for introspection of attributes, it should simply
		* add the key/values this attribute holds to the given {@link AttributeReflector}.
		*
		* <p>The default implementation calls {@link AttributeReflector#reflect} for all
		* non-static fields from the implementing class, using the field name as key
		* and the field value as value. The Attribute class is also determined by reflection.
		* Please note that the default implementation can only handle single-Attribute
		* implementations.
		*
		* <p>Custom implementations look like this (e.g. for a combined attribute implementation):
		* <pre class="prettyprint">
		*   public void reflectWith(AttributeReflector reflector) {
		*     reflector.reflect(CharTermAttribute.class, "term", term());
		*     reflector.reflect(PositionIncrementAttribute.class, "positionIncrement", getPositionIncrement());
		*   }
		* </pre>
		*
		* <p>If you implement this method, make sure that for each invocation, the same set of {@link Attribute}
		* interfaces and keys are passed to {@link AttributeReflector#reflect} in the same order, but possibly
		* different values. So don't automatically exclude e.g. {@code null} properties!
		*
		* @see #reflectAsString(boolean)
		*/
		reflectWith : function(reflector) {
			var clazz = this.getClass();  
			
			
			//final Class<? extends AttributeImpl> clazz = this.getClass();
			final LinkedList<WeakReference<Class<? extends Attribute>>> interfaces = AttributeSource.getAttributeInterfaces(clazz);
			
			if (interfaces.size() != 1) {
			  throw new UnsupportedOperationException(clazz.getName() +
			    " implements more than one Attribute interface, the default reflectWith() implementation cannot handle this.");
			}
			
			final Class<? extends Attribute> interf = interfaces.getFirst().get();
			final Field[] fields = clazz.getDeclaredFields();
			
			try {
				for (int i = 0; i < fields.length; i++) {
					final Field f = fields[i];
					if (Modifier.isStatic(f.getModifiers())) continue;
					f.setAccessible(true);
					reflector.reflect(interf, f.getName(), f.get(this));
				}
			} 
			catch (IllegalAccessException e) {
			  // this should never happen, because we're just accessing fields from 'this'
			  throw new RuntimeException(e);
			}
		},
		
		
  	
    		

		
	}
});