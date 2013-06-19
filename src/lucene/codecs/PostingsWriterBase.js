var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var Closeable = require('library/lucene/util/Closeable.js');
var PostingsConsumer = require('./PostingsConsumer.js');
/**
 * Extension of {@link PostingsConsumer} to support pluggable term dictionaries.
 * <p>
 * This class contains additional hooks to interact with the provided
 * term dictionaries such as {@link BlockTreeTermsWriter}. If you want
 * to re-use an existing implementation and are only interested in
 * customizing the format of the postings list, extend this class
 * instead.
 *
 * @see PostingsReaderBase
 * @lucene.experimental
 */
// TODO: find a better name; this defines the API that the
// terms dict impls use to talk to a postings impl.
// TermsDict + PostingsReader/WriterBase == PostingsConsumer/Producer
var PostingsWriterBase = defineClass({
	name: "PostingsWriterBase",
	extend: PostingsConsumer,
	implement: Closeable,
	methods: {
		/** Called once after startup, before any terms have been
		 *  added.  Implementations typically write a header to
		 *  the provided {@code termsOut}. */
		start: function( /* IndexOutput */ termsOut) {
			throw new ImplNotSupportedException("PostingsWriterBase::start");
		},
		/** Start a new term.  Note that a matching call to {@link
		 *  #finishTerm(TermStats)} is done, only if the term has at least one
		 *  document. */
		startTerm: function() {
			throw new ImplNotSupportedException("PostingsWriterBase::startTerm");
		},
		/** Flush count terms starting at start "backwards", as a
		 *  block. start is a negative offset from the end of the
		 *  terms stack, ie bigger start means further back in
		 *  the stack. */
		flushTermsBlock: function( /* int */ start, /* int */ count) {
			throw new ImplNotSupportedException("PostingsWriterBase::flushTermsBlock");
		},
		/** Finishes the current term.  The provided {@link
		 *  TermStats} contains the term's summary statistics. */
		finishTerm: function( /* TermStats */ stats) {
			throw new ImplNotSupportedException("PostingsWriterBase::finishTerm");
		},
		/** Called when the writing switches to another field. */
		setField: function( /* FieldInfo */ fieldInfo) {
			throw new ImplNotSupportedException("PostingsWriterBase::setField");
		}
		//@Override
		close: function() {
			throw new ImplNotSupportedException("PostingsWriterBase::close");
		}
	}
});
module.exports = exports = PostingsWriterBase;