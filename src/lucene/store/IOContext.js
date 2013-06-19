var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var MergeInfo = require('library/lucene/store/MergeInfo.js');
var FlushInfo = require('library/lucene/store/FlushInfo.js');
/**
 * Context is a enumerator which specifies the context in which the Directory
 * is being used for.
 */
var Context = {
	MERGE: 1,
	READ: 2,
	FLUSH: 3,
	DEFAULT: 4
};
/**
 * IOContext holds additional details on the merge/search context. A IOContext
 * object can never be initialized as null as passed as a parameter to either
 * {@link org.apache.lucene.store.Directory#openInput(String, IOContext)} or
 * {@link org.apache.lucene.store.Directory#createOutput(String, IOContext)}
 */
var IOContext = defineClass({
	name: "IOContext",
/**
	  options can contain any of the following
	  
	  flushInfo : FlushInfo
	  context :  Context
	  readOnce :  true/false
	  mergeInfo : MergeInfo
	  iocontext : IOContext
	  
	**/
	construct: function(opts) {
		this.context = null;
		this.mergeInfo = null;
		this.flushInfo = null;
		this.readOnce = false;
		if (opts.flushInfo) {
			assert(Class.isInstanceOfClass(opts.flushInfo, "FlushInfo"), "flushInfo obj invalid");
			this.context = Context.FLUSH;
			this.mergeInfo = null;
			this.readOnce = false;
			this.flushInfo = opts.flushInfo;
		} else if (opts.context) {
			assert(opts.context != Context.MERGE || opts.mergeInfo != null, "MergeInfo must not be null if context is MERGE");
			assert(opts.context != Context.FLUSH, "Use IOContext(FlushInfo) to create a FLUSH IOContext");
			this.context = opts.context;
			this.readOnce = false;
			this.mergeInfo = opts.mergeInfo;
			this.flushInfo = null;
		} else if (opts.readOnce != null) {
			this.context = Context.READ;
			this.mergeInfo = null;
			this.readOnce = opts.readOnce;
			this.flushInfo = null;
		} else if (opts.mergeInfo) {
			this.context = Context.MERGE;
			this.readOnce = false;
			this.mergeInfo = opts.mergeInfo;
			this.flushInfo = null;
		}
		/**
		 * This constructor is used to initialize a {@link IOContext} instance with a new value for the readOnce variable.
		 * @param ctxt {@link IOContext} object whose information is used to create the new instance except the readOnce variable.
		 * @param readOnce The new {@link IOContext} object will use this value for readOnce.
		 */
		else if (opts.iocontext && opts.readOnce != null) {
			assert(Class.isInstanceOfClass(opts.iocontext, "IOContext"), "invalid IOContext obj");
			this.context = opts.iocontext.context;
			this.mergeInfo = opts.iocontext.mergeInfo;
			this.flushInfo = opts.iocontext.flushInfo;
			this.readOnce = opts.readOnce;
		}
		else{
			//default to false and null
		}
	},
	methods: {
		hashCode: function() {
			var prime = 31;
			var result = 1;
			result = prime * result + ((this.context == null) ? 0 : this.context);
			result = prime * result + ((this.flushInfo == null) ? 0 : this.flushInfo.hashCode());
			result = prime * result + ((this.mergeInfo == null) ? 0 : this.mergeInfo.hashCode());
			result = prime * result + (this.readOnce ? 1231 : 1237);
			return result;
		},
		equals : function(obj) {
			if (this === obj) return true;
			if (obj === null || obj === undefined || isNaN(obj)) return false;
			if (obj.classname != this.classname) return false;
			if (this.context != obj.context) return false;
			if (this.flushInfo == null) {
				if (obj.flushInfo != null) return false;
			} else if (!this.flushInfo.equals(obj.flushInfo)) return false;
			if (this.mergeInfo == null) {
				if (obj.mergeInfo != null) return false;
			} else if (!this.mergeInfo.equals(obj.mergeInfo)) return false;
			if (this.readOnce != obj.readOnce) return false;
			return true;
		},

		toString : function() {
			return "IOContext [context=" + this.context + ", mergeInfo=" + this.mergeInfo
			    + ", flushInfo=" + this.flushInfo + ", readOnce=" + this.readOnce + "]";
        }
  
		
	}
});


IOContext.DEFAULT = new IOContext({
	'context': Context.DEFAULT
});
IOContext.READONCE = new IOContext({
	'readOnce': true
});
IOContext.READ = new IOContext({
	'readOnce': false
});

IOContext.Context = Context;
module.exports = exports = IOContext;