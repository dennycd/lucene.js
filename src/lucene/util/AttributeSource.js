var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var AttributeImpl = require('library/lucene/util/AttributeImpl.js');

/**
 RERFERENCE http://lucene.apache.org/core/4_2_0/core/org/apache/lucene/util/AttributeSource.html
 
 * An AttributeSource contains a list of different {@link AttributeImpl}s,
 * and methods to add and get them. There can only be a single instance
 * of an attribute in the same AttributeSource instance. This is ensured
 * by passing in the actual type of the Attribute (Class&lt;Attribute&gt;) to 
 * the {@link #addAttribute(Class)}, which then checks if an instance of
 * that type is already present. If yes, it returns the instance, otherwise
 * it creates a new instance and returns it.
**/
var AttributeSource = defineClass({
	name : "AttributeSource",
	construct : function(){
		
		
	},
	
	statics : {

		/** a cache that stores all interfaces for known implementation classes for performance (slow reflection) */
		//WeakIdentityMap<Class<? extends AttributeImpl>,LinkedList<WeakReference<Class<? extends Attribute>>>> 
		knownImplClasses : {}, //WeakIdentityMap.newConcurrentHashMap(), 
		
		//  static LinkedList<WeakReference<Class<? extends Attribute>>> getAttributeInterfaces(final Class<? extends AttributeImpl> clazz)
		getAttributeInterfaces : function(clazz){
		
			//LinkedList<WeakReference<Class<? extends Attribute>>> foundInterfaces = knownImplClasses.get(clazz);
			var foundInterfaces = this.knownImplClasses[clazz] //this.knownImplClasses.get(clazz);
			
			if (foundInterfaces == null) {
				// we have the slight chance that another thread may do the same, but who cares?
				foundInterfaces = new LinkedList<WeakReference<Class<? extends Attribute>>>();
				// find all interfaces that this attribute instance implements
				// and that extend the Attribute interface
				Class<?> actClazz = clazz;
				do {
					for (Class<?> curInterface : actClazz.getInterfaces()) {
						if (curInterface != Attribute.class && Attribute.class.isAssignableFrom(curInterface)) {
							foundInterfaces.add(new WeakReference<Class<? extends Attribute>>(curInterface.asSubclass(Attribute.class)));
						}
					}
					actClazz = actClazz.getSuperclass();
				} 
				while (actClazz != null);
				knownImplClasses.put(clazz, foundInterfaces);
			}
			return foundInterfaces;
    
		}, 
		
	}, 
	
	methods : {
		

		
	}
});


/**
	An AttributeFactory creates instances of {@link AttributeImpl}s.
**/
var AttributeFactory = defineClass({
	name : "AttributeFactory"
	construct : function(){
		
	}
});



module.exports = exports = AttributeSource;