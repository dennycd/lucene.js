var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var DefaultSimilarity = require('./similarities/DefaultSimilarity.js');
var FilteredQuery = require('./FilteredQuery.js');
var TopScoreDocCollector = require('./TopScoreDocCollector.js');

var HitQueue = require('./HitQueue.js');
var ReentrantLock = require('library/java/util/concurrent/ReentrantLock.js');

var NoSuchElementException = require('library/java/util/NoSuchElementException.js');
var UnsupportedOperationException = require('library/java/lang/UnsupportedOperationException.js');

var TopDocs = require('./TopDocs.js');

var IndexSearcher = defineClass({
	name: "IndexSearcher",
	statics: {
		// the default Similarity
		defaultSimilarity: new DefaultSimilarity(),
		/**
		 * Expert: returns a default Similarity instance.
		 * In general, this method is only called to initialize searchers and writers.
		 * User code and query implementations should respect
		 * {@link IndexSearcher#getSimilarity()}.
		 * @lucene.internal
		 */
		getDefaultSimilarity: function() {
			return IndexSearcher.defaultSimilarity;
		},
	},
	variables: {
		reader: null,
		//IndexReader // package private for testing!
		readerContext: null,
		//IndexReaderContext // NOTE: these members might change in incompatible ways in the next release
		leafContexts: null,
		//List<AtomicReaderContext> 
		leafSlices: null,
		//protected final LeafSlice[]  /** used with executor - each slice holds a set of leafs executed within one thread */
		executor: null,
		//ExecutorService // These are only used for multi-threaded search
		/** The Similarity implementation used by this searcher. */
		similarity: null,
	},
	construct: function() {
		this.similarity = IndexSearcher.defaultSimilarity;
		if (arguments.length >= 1) {
			var context = null;
			var executor = null;
			if (Class.isInstanceOfClass(arguments[0], "IndexReaderContext")) {
				context = arguments[0];
			} else if (Class.isInstanceOfClass(arguments[0], "IndexReader")) {
				context = r.getContext();
			}
			if (arguments.length >= 2) {
				if (Class.isInstanceOfClass(arguments[1], "ExecutorService")) executor = arguments[1];
			}
			assert(context.isTopLevel, "IndexSearcher's ReaderContext must be topLevel for reader" + context.reader());
			this.reader = context.reader();
			this.executor = executor;
			this.readerContext = context;
			this.leafContexts = context.leaves();
			this.leafSlices = executor == null ? null : this.slices(this.leafContexts);
		}
	},
	methods: {
	

  /** Finds the top <code>n</code>
   * hits for <code>query</code>.
   *
   * @throws BooleanQuery.TooManyClauses If a query would exceed 
   *         {@link BooleanQuery#getMaxClauseCount()} clauses.
   */
   searchWithQuery : function(/* Query */ query, /* int */ n){
    return this.searchWithQueryFilter(query, null, n);
   },
   
   
  /** Finds the top <code>n</code>
   * hits for <code>query</code>, applying <code>filter</code> if non-null.
   *
   * @throws BooleanQuery.TooManyClauses If a query would exceed 
   *         {@link BooleanQuery#getMaxClauseCount()} clauses.
   */
   searchWithQueryFilter : function(/* Query */ query, /* Filter */ filter, /* int */ n){
    return this.searchWithWeightScoreDoc(this.createNormalizedWeight( this.wrapFilter( query, filter)), null, n);
   },    
   
   
  /** Expert: Low-level search implementation.  Finds the top <code>n</code>
   * hits for <code>query</code>, applying <code>filter</code> if non-null.
   *
   * <p>Applications should usually call {@link IndexSearcher#search(Query,int)} or
   * {@link IndexSearcher#search(Query,Filter,int)} instead.
   * @throws BooleanQuery.TooManyClauses If a query would exceed 
   *         {@link BooleanQuery#getMaxClauseCount()} clauses.
   */
   searchWithWeightScoreDoc : function(/* Weight */ weight, /* ScoreDoc */ after, /* int */ nDocs)  {
   		var self = this;
   		
	    if (this.executor == null) {
	      return searchWithContextsWeightScoreDoc(this.leafContexts, weight, after, nDocs);
	    } 
	    else {
	    
	      var hq = new HitQueue(nDocs, false);
	      var lock = new ReentrantLock();
	      var runner = new ExecutionHelper(this.executor); //new ExecutionHelper<TopDocs>(executor);
	    
	      for (var i = 0; i < this.leafSlices.length; i++) { // search each sub
	        runner.submit( new SearcherCallableNoSort(lock, this, this.leafSlices[i], weight, after, nDocs, hq ) );
	      }
	
	      var totalHits = 0;
	      var maxScore = Number.NEGATIVE_INFINITY;
	      
	      runner.forEach(function(/* TopDocs */ topDocs){
	        if(topDocs.totalHits != 0) {
	          totalHits += topDocs.totalHits;
	          maxScore = Math.max(maxScore, topDocs.getMaxScore());
	        }		     
	      });

	
	      var scoreDocs = new Array(hq.size());  //new ScoreDoc[hq.size()];
	      for (var i = hq.size() - 1; i >= 0; i--) // put docs in array
	        scoreDocs[i] = hq.pop();
	
	      return new TopDocs(totalHits, scoreDocs, maxScore);
	    }
	    
  },
  
  /** Expert: Low-level search implementation.  Finds the top <code>n</code>
   * hits for <code>query</code>.
   *
   * <p>Applications should usually call {@link IndexSearcher#search(Query,int)} or
   * {@link IndexSearcher#search(Query,Filter,int)} instead.
   * @throws BooleanQuery.TooManyClauses If a query would exceed 
   *         {@link BooleanQuery#getMaxClauseCount()} clauses.
   */
   searchWithContextsWeightScoreDoc : function(/* List<AtomicReaderContext> */ leaves, /* Weight */ weight, /* ScoreDoc */ after, /* int */ nDocs){
	    // single thread
	    var limit = this.reader.maxDoc();
	    if (limit == 0) {
	      limit = 1;
	    }
	    nDocs = Math.min(nDocs, limit);
	    var collector = TopScoreDocCollector.create(nDocs, after, !weight.scoresDocsOutOfOrder());
	    
	    this.searchWithContextsWeightCollector(leaves, weight, collector);
	    
	    return collector.topDocs();
  }, 
   
  

  /**
   * Lower-level search API.
   * 
   * <p>
   * {@link Collector#collect(int)} is called for every document. <br>
   * 
   * <p>
   * NOTE: this method executes the searches on all given leaves exclusively.
   * To search across all the searchers leaves use {@link #leafContexts}.
   * 
   * @param leaves 
   *          the searchers leaves to execute the searches on
   * @param weight
   *          to match documents
   * @param collector
   *          to receive hits
   * @throws BooleanQuery.TooManyClauses If a query would exceed 
   *         {@link BooleanQuery#getMaxClauseCount()} clauses.
   */
   searchWithContextsWeightCollector : function(/* List<AtomicReaderContext> */ leaves, /* Weight */ weight, /* Collector */ collector){
	
	    // TODO: should we make this
	    // threaded...?  the Collector could be sync'd?
	    // always use single thread:
	    for (/* AtomicReaderContext */var i in leaves) { // search each subreader
	    	var ctx = leaves[i];
	      collector.setNextReader(ctx);
	      var scorer = weight.scorer(ctx, !collector.acceptsDocsOutOfOrder(), true, ctx.reader().getLiveDocs());
	      if (scorer != null) {
	        scorer.score(collector);
	      }
	    }
  }, 
  
  
  
	/**
	 * Expert: Creates an array of leaf slices each holding a subset of the given leaves.
	 * Each {@link LeafSlice} is executed in a single thread. By default there
	 * will be one {@link LeafSlice} per leaf ({@link AtomicReaderContext}).
	 */
	/* LeafSlice[] */
	slices: function( /* List<AtomicReaderContext> */ leaves) {
		var slices = new Array(leaves.size()); //new LeafSlice[leaves.size()];
		for (var i = 0; i < slices.length; i++) {
			slices[i] = new LeafSlice(leaves.get(i));
		}
		return slices;
	},

  /**
   * Creates a normalized weight for a top-level {@link Query}.
   * The query is rewritten by this method and {@link Query#createWeight} called,
   * afterwards the {@link Weight} is normalized. The returned {@code Weight}
   * can then directly be used to get a {@link Scorer}.
   * @lucene.internal
   */
   createNormalizedWeight : function(/* Query */ query)  {
	    query = this.rewrite(query);
	    var weight = query.createWeight(this);
	    var v = weight.getValueForNormalization();
	    var norm = this.getSimilarity().queryNorm(v);
	    
	    if(isFinite(norm) || isNaN(norm)){
	      norm = 1.0;
	    }
	    
	    weight.normalize(norm, 1.0);
	    return weight;
  },
 
  /** @lucene.internal */
   wrapFilter : function(/* Query */ query,/*  Filter */ filter) {
    return (filter == null) ? query : new FilteredQuery(query, filter);
  },
  

  /** Expert: called to re-write queries into primitive queries.
   * @throws BooleanQuery.TooManyClauses If a query would exceed 
   *         {@link BooleanQuery#getMaxClauseCount()} clauses.
   */
   rewrite : function(/* Query */ original)  {
    var query = original;
    for (var rewrittenQuery = query.rewrite(this.reader); rewrittenQuery != query; rewrittenQuery = query.rewrite(this.reader)) {
      query = rewrittenQuery;
    }
    return query;
   },
   
   
   getSimilarity : function() {
    return this.similarity;
  },
  
   


  
  
	}
});
/**
 * A class holding a subset of the {@link IndexSearcher}s leaf contexts to be
 * executed within a single thread.
 *
 * @lucene.experimental
 */
var LeafSlice = defineClass({
	name: "LeafSlice",
	variables: {
		leaves: [],
		// AtomicReaderContext[]
	},
	construct: function() {
		for (var i = 0; i < arguments.length; i++) {
			this.leaves.push(arguments[i]);
		}
	}
});


  /**
   * A helper class that wraps a {@link CompletionService} and provides an
   * iterable interface to the completed {@link Callable} instances.
   * 
   * @param <T>
   *          the type of the {@link Callable} return value
   */
var ExecutionHelper = defineClass({
	name : "ExecutionHelper",
	variables : {
	    service : null, //private final CompletionService<T> 
	    numTasks : 0, //int
	},
	construct : function(/* Executor */ executor){
		this.service = new ExecutorCompletionService(executor); //new ExecutorCompletionService<T>(executor);
	},
	
	methods : {

    //@Override
    hasNext : function() {
      return this.numTasks > 0;
    },

     submit : function(/* Callable<T> */ task) {
      this.service.submit(task);
      ++this.numTasks;
    },

    //@Override
    next : function() {
      if(!this.hasNext()) 
        throw new NoSuchElementException("next() is called but hasNext() returned false");
      try {
        return this.service.take().get();
      } catch (e) {
        throw e;
       } finally {
        --this.numTasks;
      }
    },

    //@Override
    remove : function() {
      throw new UnsupportedOperationException();
    },

    //@Override
    iterator : function() {
      // use the shortcut here - this is only used in a private context
      return this;
    }

		
		
	}
});

  /**
   * A thread subclass for searching a single searchable 
   */
var SearcherCallableNoSort = defineClass({
	name : "SearcherCallableNoSort",
	variables : {

		lock : null, //Lock
		searcher : null, //IndexSearcher
		weight : null, //Weight
		after : null, //ScoreDoc
		nDocs : null, //int
		hq : null, //HitQueue
		slice : null //LeafSlice
    		
	},
	construct : function(/* Lock */ lock, /* IndexSearcher */ searcher, /* LeafSlice */ slice,  /* Weight */ weight, /* ScoreDoc */ after, /* int */ nDocs, /* HitQueue */ hq){
		
      this.lock = lock;
      this.searcher = searcher;
      this.weight = weight;
      this.after = after;
      this.nDocs = nDocs;
      this.hq = hq;
      this.slice = slice;
    },
	
	methods : {
		
	    //@Override
	    //@return TopDocs
	     call : function() {
	      var docs = searcher.searchWithContextsWeightScoreDoc(Arrays.asList(this.slice.leaves), this.weight, this.after, this.nDocs);
	      var scoreDocs = docs.scoreDocs; //final ScoreDoc[]
	      //it would be so nice if we had a thread-safe insert 
	      
	      this.lock.lock();
	      try {
	        for (var j = 0; j < scoreDocs.length; j++) { // merge scoreDocs into hq
	          var scoreDoc = scoreDocs[j];
	          if (scoreDoc == this.hq.insertWithOverflow(scoreDoc)) {
	            break;
	          }
	        }
	      } finally {
	        this.lock.unlock();
	      }
	      return docs;
	    }		
		
	}
})

  
module.exports = exports = IndexSearcher;