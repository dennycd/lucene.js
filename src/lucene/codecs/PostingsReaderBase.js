var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Closeable = require('library/lucene/util/Closeable.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/** The core terms dictionaries (BlockTermsReader,
 *  BlockTreeTermsReader) interact with a single instance
 *  of this class to manage creation of {@link DocsEnum} and
 *  {@link DocsAndPositionsEnum} instances.  It provides an
 *  IndexInput (termsIn) where this class may read any
 *  previously stored data that it had written in its
 *  corresponding {@link PostingsWriterBase} at indexing
 *  time.
 *  @lucene.experimental */
// TODO: find a better name; this defines the API that the
// terms dict impls use to talk to a postings impl.
// TermsDict + PostingsReader/WriterBase == PostingsConsumer/Producer
var PostingsReaderBase defineClass({
	name: "PostingsReaderBase",
	implement: Closeable,
	construct: function() {},
	methods: {
		/** Performs any initialization, such as reading and
		 *  verifying the header from the provided terms
		 *  dictionary {@link IndexInput}. */
		init: function( /* IndexInput */ termsIn) {
			throw new ImplNotSupportedException("PostingsReaderBase::init");
		},
		/** Return a newly created empty TermState */
		//@return BlockTermState
		newTermState: function() {
			throw new ImplNotSupportedException("PostingsReaderBase::newTermState");
		},
		/** Actually decode metadata for next term */
		nextTerm: function( /* FieldInfo */ fieldInfo, /* BlockTermState */ state) {
			throw new ImplNotSupportedException("PostingsReaderBase::newTermState");
		},
		/** Must fully consume state, since after this call that
		 *  TermState may be reused. */
		//@return DocsEnum
		docs: function( /* FieldInfo */ fieldInfo, /* BlockTermState */ state, /* Bits */ skipDocs, /* DocsEnum */ reuse, /* int */ flags) {
			throw new ImplNotSupportedException("PostingsReaderBase::docs");
		},
		/** Must fully consume state, since after this call that
		 *  TermState may be reused. */
		//@return DocsAndPositionsEnum
		docsAndPositions: function( /* FieldInfo */ fieldInfo, /* BlockTermState */ state, /* Bits */ skipDocs, /* DocsAndPositionsEnum */ reuse, /* int */ flags) {
			throw new ImplNotSupportedException("PostingsReaderBase::docsAndPositions");
		},
		//@Override
		close: function() {
			throw new ImplNotSupportedException("PostingsReaderBase::close");
		};
		/** Reads data for all terms in the next block; this
		 *  method should merely load the byte[] blob but not
		 *  decode, which is done in {@link #nextTerm}. */
		readTermsBlock: function( /* IndexInput */ termsIn, /* FieldInfo */ fieldInfo, /* BlockTermState */ termState) {
			throw new ImplNotSupportedException("PostingsReaderBase::readTermsBlock");
		}
	}
});
module.exports = exports = PostingsReaderBase;