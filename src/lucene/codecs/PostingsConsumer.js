var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');

/**
 * Abstract API that consumes postings for an individual term.
 * <p>
 * The lifecycle is:
 * <ol>
 *    <li>PostingsConsumer is returned for each term by
 *        {@link TermsConsumer#startTerm(BytesRef)}. 
 *    <li>{@link #startDoc(int, int)} is called for each
 *        document where the term occurs, specifying id 
 *        and term frequency for that document.
 *    <li>If positions are enabled for the field, then
 *        {@link #addPosition(int, BytesRef, int, int)}
 *        will be called for each occurrence in the 
 *        document.
 *    <li>{@link #finishDoc()} is called when the producer
 *        is done adding positions to the document.
 * </ol>
 * 
 * @lucene.experimental
 */
var PostingsConsumer = defineClass({
	name : "PostingsConsumer"
});
module.exports = exports = PostingsConsumer;