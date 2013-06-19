var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Query = require('./Query.js');
var TermContext = require('library/lucene/index/TermContext.js');
var Weight = require('library/lucene/search/Weight.js');
var StringBuilder = require('library/lucene/util/StringBuilder.js');
var ToStringUtils = require('library/lucene/util/ToStringUtils.js');
var ReaderUtil = require('library/lucene/util/ReaderUtil.js');
var ComplexExplanation = require('library/lucene/search/ComplexExplanation.js');
var Explanation = require('library/lucene/search/Explanation.js');


/** A Query that matches documents containing a term.
  This may be combined with other terms with a {@link BooleanQuery}.
*/
var TermQuery = defineClass({
	name: "TermQuery",
	extend: Query,
	variables: {
		term: null,
		//Term
		docFreq: null,
		//int 
		perReaderTermState: null,
		//TermContext
	},
	//public TermQuery(Term t)
	//public TermQuery(Term t, int docFreq)
	//public TermQuery(Term t, TermContext states)
	construct: function() {
		if (arguments.length >= 1) {
			assert(Class.isInstanceOfClass(arguments[0], "Term"));
			this.term = arguments[0];
			if (arguments.length >= 2) {
				if (typeof(arguments[1]) == "number") {
					this.docFreq = arguments[1];
					this.perReaderTermState = null;
				} else if (Class.isInstanceOfClass(arguments[1], "TermContext")) {
					this.docFreq = arguments[1].docFreq();
					this.perReaderTermState = arguments[1];
				}
			} else {
				this.docFreq = -1;
				this.perReaderTermState = null;
			}
		}
	},
	methods: { /** Returns the term of this query. */
		getTerm: function() {
			return term;
		},
		//@Override
		createWeight: function( /* IndexSearcher */ searcher) {
			var context = searcher.getTopReaderContext(); //IndexReaderContext
			var termState = null; //TermContext
			if (this.perReaderTermState == null || this.perReaderTermState.topReaderContext !== context) {
				// make TermQuery single-pass if we don't have a PRTS or if the context differs!
				termState = TermContext.build(context, this.term, true); // cache term lookups!
			} else {
				// PRTS was pre-build for this IS
				termState = this.perReaderTermState;
			}
			// we must not ignore the given docFreq - if set use the given value (lie)
			if (this.docFreq != -1) termState.setDocFreq(this.docFreq);
			return new TermWeight(searcher, termState, this);
		},
		//@Override
		extractTerms: function( /* Set<Term> */ terms) {
			terms.add(this.getTerm());
		},
		/** Prints a user-readable version of this query. */
		//@Override
		toString: function( /* String */ field) {
			var buffer = new StringBuilder();
			if (this.term.field() != field) {
				buffer.append(this.term.field());
				buffer.append(":");
			}
			buffer.append(this.term.text());
			buffer.append(ToStringUtils.boost(this.getBoost()));
			return buffer.toString();
		},
		
		 /** Returns true iff <code>o</code> is equal to this. */
		//@Override
		equals: function( /* Object */ o) {
			if (!Class.isInstanceOfClass(o, "TermQuery")) //if (!(o instanceof TermQuery))
			return false;
			return (this.getBoost() == o.getBoost()) && (this.term == o.term);
		},
		/** Returns a hash code value for this object.*/
		//@Override
/*
  public int hashCode() {
    return Float.floatToIntBits(getBoost()) ^ term.hashCode();
  }
*/
	}
});
var TermWeight = defineClass({
	name: "TermWeight",
	extend: Weight,
	variables: {
		similarity: null,
		//Similarity
		stats: null,
		//Similarity.SimWeight
		termStates: null,
		//TermContext
		termQuery: null,
		//the parent term query associating with this term
	},
	construct: function( /* IndexSearcher */ searcher, /* TermContext */ termStates, /*TermQuery*/ termQuery) {
		assert(termStates != null, "TermContext must not be null");
		this.termStates = termStates;
		this.similarity = searcher.getSimilarity();
		this.stats = similarity.computeWeight(termQuery.getBoost(), searcher.collectionStatistics(termQuery.term.field()), searcher.termStatistics(termQuery.term, termStates));
		this.termQuery = termQuery;
	},
	methods: {
		//@Override
		toString: function() {
			return "weight(" + this.termQuery + ")";
		},
		//@Override
		getQuery: function() {
			return this.termQuery;
		},
		//@Override
		getValueForNormalization: function() {
			return this.stats.getValueForNormalization();
		},
		//@Override
		normalize: function( /* float */ queryNorm, /* float */ topLevelBoost) {
			this.stats.normalize(queryNorm, topLevelBoost);
		},
		//@Override
		scorer: function( /* AtomicReaderContext */ context, /* boolean */ scoreDocsInOrder, /* boolean */ topScorer, /* Bits */ acceptDocs) {
			assert(this.termStates.topReaderContext === ReaderUtil.getTopLevelContext(context), "The top-reader used to create Weight (" + this.termStates.topReaderContext + ") is not the same as the current reader's top-reader (" + ReaderUtil.getTopLevelContext(context));
			var termsEnum = this.getTermsEnum(context); //TermsEnum
			if (termsEnum == null) {
				return null;
			}
			var docs = termsEnum.docs(acceptDocs, null); //DocsEnum
			assert(docs != null);
			return new TermScorer(this, docs, this.similarity.exactSimScorer(this.stats, context), this.termsEnum.docFreq());
		},
		/**
		 * Returns a {@link TermsEnum} positioned at this weights Term or null if
		 * the term does not exist in the given context
		 */
		getTermsEnum: function( /* AtomicReaderContext */ context) {
			var state = this.termStates.get(context.ord); //TermState
			if (state == null) { // term is not present in that reader
				assert(this.termNotInReader(context.reader(), this.termQuery.term), "no termstate found but term exists in reader term=" + this.termQuery.term);
				return null;
			}
			//System.out.println("LD=" + reader.getLiveDocs() + " set?=" + (reader.getLiveDocs() != null ? reader.getLiveDocs().get(0) : "null"));
			var termsEnum = context.reader().terms(this.termQuery.term.field()).iterator(null); //TermsEnum
			termsEnum.seekExact(this.termQuery.term.bytes(), state);
			return termsEnum;
		},
		termNotInReader: function( /* AtomicReader */ reader, /* Term */ term) {
			// only called from assert
			//System.out.println("TQ.termNotInReader reader=" + reader + " term=" + field + ":" + bytes.utf8ToString());
			return reader.docFreq(term) == 0;
		},
		//@Override 
		//@return Explanation
		explain: function( /* AtomicReaderContext */ context, /* int */ doc) {
			var scorer = this.scorer(context, true, false, context.reader().getLiveDocs()); //Scorer
			if (scorer != null) {
				var newDoc = scorer.advance(doc); //int
				if (newDoc == doc) {
					var freq = scorer.freq();
					var docScorer = similarity.exactSimScorer(stats, context); //ExactSimScorer
					var result = new ComplexExplanation();
					result.setDescription("weight(" + this.getQuery() + " in " + doc + ") [" + similarity.getClass().getSimpleName() + "], result of:");
					var scoreExplanation = docScorer.explain(doc, new Explanation(freq, "termFreq=" + freq)); //Explanation
					result.addDetail(scoreExplanation);
					result.setValue(scoreExplanation.getValue());
					result.setMatch(true);
					return result;
				}
			}
			return new ComplexExplanation(false, 0.0, "no matching term");
		}
	}
});
module.exports = exports = TermQuery;