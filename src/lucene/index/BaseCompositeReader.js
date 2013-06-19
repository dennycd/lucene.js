var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Collections = require('library/java/util/Collections.js');
var Arrays = require('library/java/util/Arrays.js');
var CompositeReader = require('./CompositeReader.js');
var ReaderUtil = require('./ReaderUtil.js');



var BaseCompositeReader = defineClass({
	name: "BaseCompositeReader",
	extend: CompositeReader,
	variables: {
		subReaders: null,
		starts: null,
		// 1st docno for each reader
		maxDoc: 0,
		numDocs: 0,
		hasDeletions: false,
		/** List view solely for {@link #getSequentialSubReaders()}, for effectiveness the array is used internally. */
		subReadersList: null //  private final List<R> 		
	},
	/**
	 * Constructs a {@code BaseCompositeReader} on the given subReaders.
	 * @param subReaders the wrapped sub-readers. This array is returned by
	 * {@link #getSequentialSubReaders} and used to resolve the correct
	 * subreader for docID-based methods. <b>Please note:</b> This array is <b>not</b>
	 * cloned and not protected for modification, the subclass is responsible
	 * to do this.
	 */
	construct: function(subReaders) {

		CompositeReader.call(this);
		
		if(arguments.length==1 && subReaders!=null){
			this.subReaders = subReaders;
			this.subReadersList = Collections.unmodifiableList(Arrays.asList(subReaders));
			this.starts = new Array(subReaders.length + 1); // build starts array
			var maxDoc = 0,
				numDocs = 0;
			var hasDeletions = false;
			for (var i = 0; i < this.subReaders.length; i++) {
				this.starts[i] = maxDoc;
				var r = this.subReaders[i]; //IndexReader
				maxDoc += r.maxDoc(); // compute maxDocs
				if (maxDoc < 0 /* overflow */ ) {
					throw new IllegalArgumentException("Too many documents, composite IndexReaders cannot exceed " + Integer.MAX_VALUE);
				}
				numDocs += r.numDocs(); // compute numDocs
				if (r.hasDeletions()) {
					hasDeletions = true;
				}
				r.registerParentReader(this);
			}
			this.starts[subReaders.length] = maxDoc;
			this.maxDoc = maxDoc;
			this.numDocs = numDocs;
			this.hasDeletions = hasDeletions;			
		}
	},
	methods: {
		//@Override
		getTermVectors: function(docID) {
			this.ensureOpen();
			var i = this.readerIndex(docID); // find subreader num
			return this.subReaders[i].getTermVectors(docID - this.starts[i]); // dispatch to subreader
		},
		//@Override
		numDocs: function() {
			// Don't call ensureOpen() here (it could affect performance)
			return this.numDocs;
		},
		//@Override
		maxDoc: function() {
			// Don't call ensureOpen() here (it could affect performance)
			return this.maxDoc;
		},
		//@Override
		document: function( /* int */ docID, /* StoredFieldVisitor */ visitor) {
			this.ensureOpen();
			var i = this.readerIndex(docID); // find subreader num
			this.subReaders[i].document(docID - this.starts[i], visitor); // dispatch to subreader
		},
		//@Override
		hasDeletions: function() {
			// Don't call ensureOpen() here (it could affect performance)
			return this.hasDeletions;
		},
		//@Override
		docFreq: function( /* Term */ term) {
			this.ensureOpen();
			var total = 0; // sum freqs in subreaders
			for (var i = 0; i < this.subReaders.length; i++) {
				total += this.subReaders[i].docFreq(term);
			}
			return total;
		},
		//@Override
		totalTermFreq: function( /* Term */ term) {
			this.ensureOpen();
			var total = 0; // sum freqs in subreaders
			for (var i = 0; i < this.subReaders.length; i++) {
				var sub = this.subReaders[i].totalTermFreq(term);
				if (sub == -1) {
					return -1;
				}
				total += sub;
			}
			return total;
		},
		/** Helper method for subclasses to get the corresponding reader for a doc ID */
		readerIndex: function(docID) {
			if (docID < 0 || docID >= this.maxDoc) {
				throw new IllegalArgumentException("docID must be >= 0 and < maxDoc=" + this.maxDoc + " (got docID=" + docID + ")");
			}
			return ReaderUtil.subIndex(docID, this.starts);
		},
		/** Helper method for subclasses to get the docBase of the given sub-reader index. */
		readerBase: function( /* int */ readerIndex) {
			if (readerIndex < 0 || readerIndex >= this.subReaders.length) {
				throw new IllegalArgumentException("readerIndex must be >= 0 and < getSequentialSubReaders().size()");
			}
			return this.starts[readerIndex];
		},
		//@Override
		getSequentialSubReaders: function() {
			return this.subReadersList;
		},
	}
});
module.exports = exports = BaseCompositeReader;