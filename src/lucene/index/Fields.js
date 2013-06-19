var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');


/** Flex API for access to fields and terms
 *  @lucene.experimental */
var Fields = defineClass({
	name : "Fields",
	statics : {
		/** Zero-length {@code Fields} array. */
		EMPTY_ARRAY :  new Array(0) // new Fields[0];
	},
	methods : {
			
			//op - function(elem)
			forEach : function(op){throw new ImplNotSupportedException("Fields::forEach");},
		
		  /** Get the {@link Terms} for this field.  This will return
		   *  null if the field does not exist. */
		   //@return Terms
		   terms : function(/* String */ field){throw new ImplNotSupportedException("Fields::terms");},
		
		  /** Returns the number of fields or -1 if the number of
		   * distinct field names is unknown. If &gt;= 0,
		   * {@link #iterator} will return as many field names. */
		   size : function(){throw new ImplNotSupportedException("Fields::size");}, 
		  
		  /** Returns the number of terms for all fields, or -1 if this 
		   *  measure isn't stored by the codec. Note that, just like 
		   *  other term measures, this measure does not take deleted 
		   *  documents into account. 
		   *  @deprecated iterate fields and add their size() instead. 
		   *   this method is only provided as a transition mechanism
		   *   to access this statistic for 3.x indexes, which do not
		   *   have this statistic per-field.
		   *  @see Terms#size() */
		  //@Deprecated
		   getUniqueTermCount : function()  {
		    var numTerms = 0;
		    var self = this;
		    this.forEach(function(field){
			      var terms = self.terms(field); //Terms
			      if (terms != null) {
			        var termCount = terms.size();
			        if (termCount == -1) {
			          return -1;
			        }
			          
			        numTerms += termCount;
			      }
		      			    
		    });
		    return numTerms;
		  }
	}
});
module.exports = exports = Fields;