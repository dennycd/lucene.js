var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');


// a simple mapping from a posting format name to that format's constructor in the system - that's it 
var NamedSPILoader = {};


/** 
 * Encodes/decodes terms, postings, and proximity data.
 * <p>
 * Note, when extending this class, the name ({@link #getName}) may
 * written into the index in certain configurations. In order for the segment 
 * to be read, the name must resolve to your implementation via {@link #forName(String)}.
 * This method uses Java's 
 * {@link ServiceLoader Service Provider Interface} (SPI) to resolve format names.
 * <p>
 * If you implement your own format, make sure that it has a no-arg constructor
 * so SPI can load it.
 * @see ServiceLoader
 * @lucene.experimental */
var PostingsFormat = defineClass({
	name : "PostingsFormat",
	statics : {

		  //private static final NamedSPILoader<PostingsFormat> loader = new NamedSPILoader<PostingsFormat>(PostingsFormat.class);
		
		  /** Zero-length {@code PostingsFormat} array. */
		  EMPTY : new Array(0), //public static final PostingsFormat[] EMPTY = new PostingsFormat[0];

		  /** looks up a format by name */
		  //@return PostingsFormat
		  forName : function(/* String */ name) {
			console.log("looking for Posting format name " + name);

/*
			var cst = NamedSPILoader[name];
			if(!cst) return null;
			
			return new cst();
*/

				//TEMPORARY SOLUTION
				if(name=="Lucene41")
				{
					var modulePath = "./lucene41/Lucene41PostingsFormat.js";
					var cls = require(modulePath);
					assert(cls && typeof(cls) == "function" && cls.__class, "failed loading " + modulePath);
					
					return new cls();					
				}

				return null;
		  },
		  
		  /** returns a list of all available format names */
		   //Set<String>
		   availablePostingsFormats : function() {
			   return Object.keys(NamedSPILoader);
		  }, 
		  
		  /** 
		   * Reloads the postings format list from the given {@link ClassLoader}.
		   * Changes to the postings formats are visible after the method ends, all
		   * iterators ({@link #availablePostingsFormats()},...) stay consistent. 
		   * 
		   * <p><b>NOTE:</b> Only new postings formats are added, existing ones are
		   * never removed or replaced.
		   * 
		   * <p><em>This method is expensive and should only be called for discovery
		   * of new postings formats on the given classpath/classloader!</em>
		   */
		   reloadPostingsFormats : function(/* ClassLoader */ classloader) {
		    //loader.reload(classloader);
		  }
   
 	},
 	
 	variables : {

		/** Unique name that's used to retrieve this format when
		*  reading the index.
		*/
		name : null //String
	
 	}, 

	/**
	* Creates a new postings format.
	* <p>
	* The provided name will be written into the index segment in some configurations
	* (such as when using {@link PerFieldPostingsFormat}): in such configurations,
	* for the segment to be read this class should be registered with Java's
	* SPI mechanism (registered in META-INF/ of your jar file, etc).
	* @param name must be all ascii alphanumeric, and less than 128 characters in length.
	*/
 	construct : function(/* String */ name){
	 	if(arguments.length==1){
			this.name = name;
			NamedSPILoader[name] = this.constructor;
			console.log("PostingsFormat register " + name);
			//assert(Class.isInstanceOfClass(NamedSPILoader[name], "Class"));
			assert(typeof(NamedSPILoader[name])=="function", name + " is not a constructor");
		}
 	}, 
 	
 	methods : {


		  /** Returns this posting format's name */
		  //@Override
		  getName : function() {
		    return this.name;
		  },
		  
		  /** Writes a new segment */
		  //@return FieldsConsumer
		  fieldsConsumer : function(/* SegmentWriteState */ state){throw new ImplNotSupportedException("PostingsFormat::fieldsConsumer");}, 
		
		  /** Reads a segment.  NOTE: by the time this call
		   *  returns, it must hold open any files it will need to
		   *  use; else, those files may be deleted. 
		   *  Additionally, required files may be deleted during the execution of 
		   *  this call before there is a chance to open them. Under these 
		   *  circumstances an IOException should be thrown by the implementation. 
		   *  IOExceptions are expected and will automatically cause a retry of the 
		   *  segment opening logic with the newly revised segments.
		   *  */
		  //@return FieldsProducer
		  fieldsProducer : function(/* SegmentReadState */ state){throw new ImplNotSupportedException("PostingsFormat::fieldsProducer");}, 
		
		  //@Override
		   toString : function() {
		    return "PostingsFormat(name=" + this.name + ")";
		  }
 	}
});
module.exports = exports = PostingsFormat;