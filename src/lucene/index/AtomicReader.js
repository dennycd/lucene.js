var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IndexReader = require('./IndexReader.js');

var AtomicReaderContext = require('library/lucene/index/AtomicReaderContext.js');

var AtomicReader = defineClass({
	name: "AtomicReader",
	extend: IndexReader,
	variables: {
		readerContext: null,
		//AtomicReaderContext 
	},
	/** Sole constructor. (For invocation by subclass 
	 *  constructors, typically implicit.)
	 */
	construct: function() {
		IndexReader.call(this);
		this.readerContext = new AtomicReaderContext(this);
	},
	//@Override
	getContext: function() {
		this.ensureOpen();
		return this.readerContext;
	},
	/**
	 * Returns {@link Fields} for this reader.
	 * This method may return null if the reader has no
	 * postings.
	 */
	fields$abstract: function() {},
	
	//@Override
	docFreq: function( /* Term */ term) {
		var fields = this.fields();
		if (fields == null) {
			return 0;
		}
		var terms = fields.terms(term.field());
		if (terms == null) {
			return 0;
		}
		var termsEnum = terms.iterator(null); //TermsEnum
		if (termsEnum.seekExact(term.bytes(), true)) {
			return termsEnum.docFreq();
		} else {
			return 0;
		}
	},
	
  /** Returns the number of documents containing the term
   * <code>t</code>.  This method returns 0 if the term or
   * field does not exists.  This method does not take into
   * account deleted documents that have not yet been merged
   * away. */
  //@Override
  totalTermFreq : function(/* Term */ term)  {
    var fields = fields();
    if (fields == null) {
      return 0;
    }
    var terms = fields.terms(term.field());
    if (terms == null) {
      return 0;
    }
    var termsEnum = terms.iterator(null);
    if (termsEnum.seekExact(term.bytes(), true)) {
      return termsEnum.totalTermFreq();
    } else {
      return 0;
    }
  },
  
    /** This may return null if the field does not exist.*/
    terms : function(/* String */ field)  {
    	var fields = this.fields();
    if (fields == null) {
      return null;
    }
    return fields.terms(field);
  },
  
    /** Returns {@link DocsEnum} for the specified term.
   *  This will return null if either the field or
   *  term does not exist. 
   *  @see TermsEnum#docs(Bits, DocsEnum) */
   /* DocsEnum */ 
   termDocsEnum : function(/* Term */ term) {
    assert(term.field() != null);
    assert(term.bytes() != null);
    var fields = this.fields();
    if (fields != null) {
      var terms = fields.terms(term.field());
      if (terms != null) {
        var termsEnum = terms.iterator(null);
        if (termsEnum.seekExact(term.bytes(), true)) {
          return termsEnum.docs(getLiveDocs(), null);
        }
      }
    }
    return null;
  },
  
  
    /** Returns {@link DocsAndPositionsEnum} for the specified
   *  term.  This will return null if the
   *  field or term does not exist or positions weren't indexed. 
   *  @see TermsEnum#docsAndPositions(Bits, DocsAndPositionsEnum) */
  /* public final DocsAndPositionsEnum */ termPositionsEnum : function(/* Term */ term)  {
    assert (term.field() != null);
    assert (term.bytes() != null);
    var fields = this.fields();
    if (fields != null) {
      var terms = fields.terms(term.field());
      if (terms != null) {
        var termsEnum = terms.iterator(null);
        if (termsEnum.seekExact(term.bytes(), true)) {
          return termsEnum.docsAndPositions(this.getLiveDocs(), null);
        }
      }
    }
    return null;
  },
  

  /** Returns {@link NumericDocValues} for this field, or
   *  null if no {@link NumericDocValues} were indexed for
   *  this field.  The returned instance should only be
   *  used by a single thread. */
  /* public abstract NumericDocValues */ 
  getNumericDocValues$abstract : function(/* String */ field){},

  /** Returns {@link BinaryDocValues} for this field, or
   *  null if no {@link BinaryDocValues} were indexed for
   *  this field.  The returned instance should only be
   *  used by a single thread. */
  //public abstract BinaryDocValues 
  getBinaryDocValues$abstract : function(/* String */ field){},

  /** Returns {@link SortedDocValues} for this field, or
   *  null if no {@link SortedDocValues} were indexed for
   *  this field.  The returned instance should only be
   *  used by a single thread. */
  //public abstract SortedDocValues 
  getSortedDocValues$abstract : function(/* String */ field) {},
  
  
  /** Returns {@link SortedSetDocValues} for this field, or
   *  null if no {@link SortedSetDocValues} were indexed for
   *  this field.  The returned instance should only be
   *  used by a single thread. */
  //public abstract SortedSetDocValues 
  getSortedSetDocValues$abstract : function(/* String */ field) {},

  /** Returns {@link NumericDocValues} representing norms
   *  for this field, or null if no {@link NumericDocValues}
   *  were indexed. The returned instance should only be
   *  used by a single thread. */
  //public abstract NumericDocValues 
  getNormValues$abstract : function(/* String */ field) {},

  /**
   * Get the {@link FieldInfos} describing all fields in
   * this reader.
   * @lucene.experimental
   */
  //public abstract FieldInfos
   getFieldInfos$abstract : function(){},
     
  /** Returns the {@link Bits} representing live (not
   *  deleted) docs.  A set bit indicates the doc ID has not
   *  been deleted.  If this method returns null it means
   *  there are no deleted documents (all documents are
   *  live).
   *
   *  The returned instance has been safely published for
   *  use by multiple threads without additional
   *  synchronization.
   */
  //public abstract Bits 
  getLiveDocs$abstract : function(){}


   
  	
	
});
module.exports = exports = AtomicReader;