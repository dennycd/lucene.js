var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Closeable = require('library/lucene/util/Closeable.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/** 
 * Abstract API that consumes terms, doc, freq, prox, offset and
 * payloads postings.  Concrete implementations of this
 * actually do "something" with the postings (write it into
 * the index in a specific format).
 * <p>
 * The lifecycle is:
 * <ol>
 *   <li>FieldsConsumer is created by
 *       {@link PostingsFormat#fieldsConsumer(SegmentWriteState)}.
 *   <li>For each field, {@link #addField(FieldInfo)} is called,
 *       returning a {@link TermsConsumer} for the field.
 *   <li>After all fields are added, the consumer is {@link #close}d.
 * </ol>
 *
 * @lucene.experimental
 */
var FieldsConsumer = defineClass({
	name: "FieldsConsumer",
	implement: Closeable,
	construct: function() {},
	methods: { /** Add a new field */
		//@return TermsConsumer
		addField: function( /* FieldInfo */ field) {
			throw new ImplNotSupportedException("FieldsConsumer::addField");
		},
		/** Called when we are done adding everything. */
		//@Override
		close: function() {
			throw new ImplNotSupportedException("FieldsConsumer::close");
		},
		/** Called during merging to merge all {@link Fields} from
		 *  sub-readers.  This must recurse to merge all postings
		 *  (terms, docs, positions, etc.).  A {@link
		 *  PostingsFormat} can override this default
		 *  implementation to do its own merging. */
		merge: function( /* MergeState */ mergeState, /* Fields */ fields) {
			for ( /* String */
			var i in fields) {
				var field = fields[i];
				var info = mergeState.fieldInfos.fieldInfo(field); //FieldInfo
				assert(info != null, "FieldInfo for field is null: " + field);
				var terms = fields.terms(field); //Terms
				if (terms != null) {
					var termsConsumer = this.addField(info); //TermsConsumer
					termsConsumer.merge(mergeState, info.getIndexOptions(), terms.iterator(null));
				}
			}
		}
	}
});
module.exports = exports = FieldsConsumer;