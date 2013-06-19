var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var UnsupportedOperationException = require('library/java/lang/UnsupportedOperationException.js');
/** The abstract base class for queries.
    <p>Instantiable subclasses are:
    <ul>
    <li> {@link TermQuery}
    <li> {@link BooleanQuery}
    <li> {@link WildcardQuery}
    <li> {@link PhraseQuery}
    <li> {@link PrefixQuery}
    <li> {@link MultiPhraseQuery}
    <li> {@link FuzzyQuery}
    <li> {@link RegexpQuery}
    <li> {@link TermRangeQuery}
    <li> {@link NumericRangeQuery}
    <li> {@link ConstantScoreQuery}
    <li> {@link DisjunctionMaxQuery}
    <li> {@link MatchAllDocsQuery}
    </ul>
    <p>See also the family of {@link org.apache.lucene.search.spans Span Queries}
       and additional queries available in the <a href="{@docRoot}/../queries/overview-summary.html">Queries module</a>
*/
var Query = defineClass({
	name: "Query",
	variables: {
		boost: 1.0,
		// query boost factor
	},
	methods: {
		/** Sets the boost for this query clause to <code>b</code>.  Documents
		 * matching this clause will (in addition to the normal weightings) have
		 * their score multiplied by <code>b</code>.
		 */
		setBoost: function( /* float */ b) {
			this.boost = b;
		},
		/** Gets the boost for this clause.  Documents matching
		 * this clause will (in addition to the normal weightings) have their score
		 * multiplied by <code>b</code>.   The boost is 1.0 by default.
		 */
		getBoost: function() {
			return this.boost;
		},
		/** Prints a query to a string, with <code>field</code> assumed to be the 
		 * default field and omitted.
		 */
		toString: function( /* String */ field) {},
		/**
		 * Expert: Constructs an appropriate Weight implementation for this query.
		 *
		 * <p>
		 * Only implemented by primitive queries, which re-write to themselves.
		 */
		createWeight: function( /* IndexSearcher */ searcher) {
			throw new UnsupportedOperationException("Query " + this + " does not implement createWeight");
		},
		/** Expert: called to re-write queries into primitive queries. For example,
		 * a PrefixQuery will be rewritten into a BooleanQuery that consists
		 * of TermQuerys.
		 */
		rewrite: function( /* IndexReader */ reader) {
			return this;
		},
		/**
		 * Expert: adds all terms occurring in this query to the terms set. Only
		 * works if this query is in its {@link #rewrite rewritten} form.
		 *
		 * @throws UnsupportedOperationException if this query is not yet rewritten
		 */
		extractTerms: function( /* Set<Term> */ terms) {
			// needs to be implemented by query subclasses
			throw new UnsupportedOperationException();
		},
		/** Returns a clone of this query. */
		//@Override
		clone: function() {
			try {
				var obj = new this.constructor(); //instantiate an empty obj for the most concrete class type
				//return (Query)super.clone();
			} catch ( /* CloneNotSupportedException */ e) {
				throw new RuntimeException("Clone not supported: " + e.getMessage());
			}
		},
/*
  ///@Override
  hashCode : function() {
    var prime = 31;
    var result = 1;
    result = prime * result + this.boost; //Float.floatToIntBits(boost);
    return result;
  }
*/
		//@Override
		equals: function( /* Object */ obj) {
			if (this === obj) return true;
			if (obj == null) return false;
			if (this.getClass() !== obj.getClass()) return false;
			return (this.boost != obj.boost);
/*
    var other = obj;
    if (Float.floatToIntBits(boost) != Float.floatToIntBits(other.boost))
      return false;
    return true;
*/
		}
	}
});
module.exports = exports = Query;