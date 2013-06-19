var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');

var HashMap = require('library/java/util/HashMap.js');
/**
 *  Access to the Field Info file that describes document fields and whether or
 *  not they are indexed. Each segment has a separate Field Info file. Objects
 *  of this class are thread-safe for multiple readers, but only one thread can
 *  be adding documents at a time, with no other reader or writer threads
 *  accessing this object.
 **/
var FieldInfo = defineClass({
	name : "FieldInfo",
	construct: function( /* String */ name, /* boolean */ indexed, /* int */ number, /* boolean */ storeTermVector, /* boolean */ omitNorms, /* boolean */ storePayloads, /* IndexOptions */ indexOptions, /* DocValuesType */ docValues, /* DocValuesType */ normsType, /* Map<String,String> */ attributes) {
		this.name = name;
		this.indexed = indexed;
		this.number = number;
		this.docValueType = docValues;
		if (indexed) {
			this.storeTermVector = storeTermVector;
			this.storePayloads = storePayloads;
			this.omitNorms = omitNorms;
			this.indexOptions = indexOptions;
			this.normType = !omitNorms ? normsType : null;
		} else { // for non-indexed fields, leave defaults
			this.storeTermVector = false;
			this.storePayloads = false;
			this.omitNorms = false;
			this.indexOptions = null;
			this.normType = null;
		}
		this.attributes = attributes;
		assert(this.checkConsistency());
	},
	
	variables : {

		/** Field's name */
		name: null,
		 //String
		 /** Internal field number */
		number: null,
		 //int 
		indexed: null,
		 //boolean
		docValueType: null,
		 //DocValuesType, 
		// True if any document indexed term vectors
		storeTermVector: null,
		 //boolean
		normType: null,
		 //DocValuesType
		omitNorms: null,
		 //boolean // omit norms associated with indexed fields  
		indexOptions: null,
		 //IndexOptions
		storePayloads: null,
		 //boolean  // whether this field stores payloads together with term positions
		attributes: null,
		 // Map<String,String>
		

	},
	
	methods : {


		   checkConsistency : function() {
		    if (!this.indexed) {
		      assert(!this.storeTermVector);
		      assert(!this.storePayloads);
		      assert(!this.omitNorms);
		      assert(this.normType == null);
		      assert(this.indexOptions == null);
		    } else {
		      assert(this.indexOptions != null);
		      if (this.omitNorms) {
		        assert(this.normType == null);
		      }
		      // Cannot store payloads unless positions are indexed:
		      assert( (this.indexOptions - IndexOptions.DOCS_AND_FREQS_AND_POSITIONS) >= 0 || !this.storePayloads);
		    }
		
		    return true;
		  },
		
		  update : function(){
			  if(arguments.length==1) return this.updateWithFieldType(arguments[0]);
			  else if(arguments.length==5) return this.updateWithOpts.apply(this, arguments);
		  },
		
		  updateWithFieldType : function(/* IndexableFieldType */ ft) {
		    this.update(ft.indexed(), false, ft.omitNorms(), false, ft.indexOptions());
		  }, 
		
		  // should only be called by FieldInfos#addOrUpdate
		  updateWithOpts : function(/* boolean */ indexed, /* boolean */ storeTermVector, /* boolean */ omitNorms, /* boolean */ storePayloads, /* IndexOptions */ indexOptions) {
		    //System.out.println("FI.update field=" + name + " indexed=" + indexed + " omitNorms=" + omitNorms + " this.omitNorms=" + this.omitNorms);
		    if (this.indexed != indexed) {
		      this.indexed = true;                      // once indexed, always index
		    }
		    if (indexed) { // if updated field data is not for indexing, leave the updates out
		      if (this.storeTermVector != storeTermVector) {
		        this.storeTermVector = true;                // once vector, always vector
		      }
		      if (this.storePayloads != storePayloads) {
		        this.storePayloads = true;
		      }
		      if (this.omitNorms != omitNorms) {
		        this.omitNorms = true;                // if one require omitNorms at least once, it remains off for life
		        this.normType = null;
		      }
		      if (this.indexOptions != indexOptions) {
		        if (this.indexOptions == null) {
		          this.indexOptions = indexOptions;
		        } else {
		          // downgrade
		          this.indexOptions = (this.indexOptions-indexOptions < 0) ? this.indexOptions : indexOptions;
		        }
		        if ((this.indexOptions-IndexOptions.DOCS_AND_FREQS_AND_POSITIONS) < 0) {
		          // cannot store payloads if we don't store positions:
		          this.storePayloads = false;
		        }
		      }
		    }
		    assert(this.checkConsistency());
		  }, 
		  
		  
		
		  setDocValuesType : function(/* DocValuesType */ type) {
		    if (this.docValueType != null && this.docValueType != type) {
		      throw new IllegalArgumentException("cannot change DocValues type from " + this.docValueType + " to " + type + " for field \"" + name + "\"");
		    }
		    this.docValueType = type;
		    assert(this.checkConsistency());
		  }, 
		  
		  /** Returns IndexOptions for the field, or null if the field is not indexed */
		   //return IndexOptions
		   getIndexOptions : function() {
		    return this.indexOptions;
		  }, 
		  
		  /**
		   * Returns true if this field has any docValues.
		   */
		   hasDocValues : function() {
		    return this.docValueType != null;
		  }, 
		
		  /**
		   * Returns {@link DocValuesType} of the docValues. this may be null if the field has no docvalues.
		   */
		   getDocValuesType : function() {
		    return this.docValueType;
		  },
		  
		  /**
		   * Returns {@link DocValuesType} of the norm. this may be null if the field has no norms.
		   */
		   //return DocValuesType
		   getNormType : function() {
		    return this.normType;
		  },
		
		   setStoreTermVectors : function(){
		    this.storeTermVector = true;
		    assert(this.checkConsistency());
		  }, 
		  
		   setStorePayloads : function() {
		    if (this.indexed && (this.indexOptions-IndexOptions.DOCS_AND_FREQS_AND_POSITIONS) >= 0) {
		      this.storePayloads = true;
		    }
		    assert(this.checkConsistency());
		  },
		
		  setNormValueType : function(/* DocValuesType */ type) {
		    if (this.normType != null && this.normType != type) {
		      throw new IllegalArgumentException("cannot change Norm type from " + this.normType + " to " + type + " for field \"" + this.name + "\"");
		    }
		    this.normType = type;
		    assert(this.checkConsistency());
		  },
		  
		  /**
		   * Returns true if norms are explicitly omitted for this field
		   */
		   omitsNorms : function() {
		    return this.omitNorms;
		  },
		  
		  /**
		   * Returns true if this field actually has any norms.
		   */
		  hasNorms : function() {
		    return this.normType != null;
		  }, 
		  
		  /**
		   * Returns true if this field is indexed.
		   */
		  isIndexed : function() {
		    return this.indexed;
		  }, 
		  
		  /**
		   * Returns true if any payloads exist for this field.
		   */
		   hasPayloads : function() {
		    return this.storePayloads;
		  }, 
		  
		  /**
		   * Returns true if any term vectors exist for this field.
		   */
		   hasVectors : function() {
		    return this.storeTermVector;
		  }, 
		  
		  /**
		   * Get a codec attribute value, or null if it does not exist
		   */
		   getAttribute : function(/* String */ key) {
		    if (this.attributes == null) {
		      return null;
		    } else {
		      return this.attributes.get(key);
		    }
		  }, 
		  
		  /**
		   * Puts a codec attribute value.
		   * <p>
		   * This is a key-value mapping for the field that the codec can use
		   * to store additional metadata, and will be available to the codec
		   * when reading the segment via {@link #getAttribute(String)}
		   * <p>
		   * If a value already exists for the field, it will be replaced with 
		   * the new value.
		   */
		   putAttribute : function(/* String */ key, /* String */ value) {
		    if (this.attributes == null) {
		      this.attributes = new HashMap(); //new HashMap<String,String>();
		    }
		    return attributes.put(key, value);
		  }
		    
	}
});




/**
* Controls how much information is stored in the postings lists.
* @lucene.experimental
*/
var IndexOptions = { 
	// NOTE: order is important here; FieldInfo uses this
	// order to merge two conflicting IndexOptions (always
	// "downgrades" by picking the lowest).
	/** 
	 * Only documents are indexed: term frequencies and positions are omitted.
	 * Phrase and other positional queries on the field will throw an exception, and scoring
	 * will behave as if any term in the document appears only once.
	 */
	// TODO: maybe rename to just DOCS?
	DOCS_ONLY : 1, 
	/** 
	 * Only documents and term frequencies are indexed: positions are omitted. 
	 * This enables normal scoring, except Phrase and other positional queries
	 * will throw an exception.
	 */  
	DOCS_AND_FREQS : 2, 
	/** 
	 * Indexes documents, frequencies and positions.
	 * This is a typical default for full-text search: full scoring is enabled
	 * and positional queries are supported.
	 */
	DOCS_AND_FREQS_AND_POSITIONS : 3, 
	/** 
	 * Indexes documents, frequencies, positions and offsets.
	 * Character offsets are encoded alongside the positions. 
	 */
	DOCS_AND_FREQS_AND_POSITIONS_AND_OFFSETS : 4, 
};

	
/**
* DocValues types.
* Note that DocValues is strongly typed, so a field cannot have different types
* across different documents.
*/
var DocValuesType = {
	/** 
	* A per-document Number
	*/
	NUMERIC : "NUMERIC", 
	/**
	* A per-document byte[].
	*/
	BINARY : "BINARY", 
	/** 
	* A pre-sorted byte[]. Fields with this type only store distinct byte values 
	* and store an additional offset pointer per document to dereference the shared 
	* byte[]. The stored byte[] is presorted and allows access via document id, 
	* ordinal and by-value.
	*/
	SORTED : "SORTED", 
	/** 
	* A pre-sorted Set&lt;byte[]&gt;. Fields with this type only store distinct byte values 
	* and store additional offset pointers per document to dereference the shared 
	* byte[]s. The stored byte[] is presorted and allows access via document id, 
	* ordinal and by-value.
	*/
	SORTED_SET : "SORTED_SET"
};
FieldInfo.IndexOptions = IndexOptions;
FieldInfo.DocValuesType = DocValuesType;
module.exports = exports = FieldInfo;