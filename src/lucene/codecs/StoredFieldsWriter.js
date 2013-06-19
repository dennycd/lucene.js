var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Closeable = require('library/lucene/util/Closeable.js');
/**
 * Codec API for writing stored fields:
 * <p>
 * <ol>
 *   <li>For every document, {@link #startDocument(int)} is called,
 *       informing the Codec how many fields will be written.
 *   <li>{@link #writeField(FieldInfo, IndexableField)} is called for
 *       each field in the document.
 *   <li>After all documents have been written, {@link #finish(FieldInfos, int)}
 *       is called for verification/sanity-checks.
 *   <li>Finally the writer is closed ({@link #close()})
 * </ol>
 *
 * @lucene.experimental
 */
var StoredFieldsWriter = defineClass({
	name: "StoredFieldsWriter",
	implement: Closeable,
	construct: function() {},
	methods: {
		/** Called before writing the stored fields of the document.
		 *  {@link #writeField(FieldInfo, IndexableField)} will be called
		 *  <code>numStoredFields</code> times. Note that this is
		 *  called even if the document has no stored fields, in
		 *  this case <code>numStoredFields</code> will be zero. */
		startDocument: function( /* int */ numStoredFields) {},
		/** Called when a document and all its fields have been added. */
		finishDocument: function() {},
		/** Writes a single stored field. */
		writeField: function( /* FieldInfo */ info, /* IndexableField */ field) {},
		/** Aborts writing entirely, implementation should remove
		 *  any partially-written files, etc. */
		abort: function() {},
		/** Called before {@link #close()}, passing in the number
		 *  of documents that were written. Note that this is
		 *  intentionally redundant (equivalent to the number of
		 *  calls to {@link #startDocument(int)}, but a Codec should
		 *  check that this is the case to detect the JRE bug described
		 *  in LUCENE-1282. */
		finish: function( /* FieldInfos */ fis, /* int */ numDocs),
		/** Merges in the stored fields from the readers in 
		 *  <code>mergeState</code>. The default implementation skips
		 *  over deleted documents, and uses {@link #startDocument(int)},
		 *  {@link #writeField(FieldInfo, IndexableField)}, and {@link #finish(FieldInfos, int)},
		 *  returning the number of documents that were written.
		 *  Implementations can override this method for more sophisticated
		 *  merging (bulk-byte copying, etc). */
		merge: function( /* MergeState */ mergeState) {
			var docCount = 0;
			for ( /* AtomicReader */
			var reader in mergeState.readers) {
				var maxDoc = reader.maxDoc(); /* Bits */
				var liveDocs = reader.getLiveDocs();
				for (var i = 0; i < maxDoc; i++) {
					if (liveDocs != null && !liveDocs.get(i)) {
						// skip deleted docs
						continue;
					}
					// TODO: this could be more efficient using
					// FieldVisitor instead of loading/writing entire
					// doc; ie we just have to renumber the field number
					// on the fly?
					// NOTE: it's very important to first assign to doc then pass it to
					// fieldsWriter.addDocument; see LUCENE-1282
					/* Document */
					var doc = reader.document(i);
					this.addDocument(doc, mergeState.fieldInfos);
					docCount++;
					mergeState.checkAbort.work(300);
				}
			}
			this.finish(mergeState.fieldInfos, docCount);
			return docCount;
		},
		/** sugar method for startDocument() + writeField() for every stored field in the document */
		addDocument: function( /* Iterable<? extends IndexableField> */ doc, /* FieldInfos */ fieldInfos) {
			var storedCount = 0;
			for ( /* IndexableField */
			var field in doc) {
				if (field.fieldType().stored()) {
					storedCount++;
				}
			}
			this.startDocument(storedCount);
			for ( /* IndexableField */
			var field in doc) {
				if (field.fieldType().stored()) {
					this.writeField(fieldInfos.fieldInfo(field.name()), field);
				}
			}
			this.finishDocument();
		}
		//@Override
		close: function() {};
	}
});
module.exports = exports = StoredFieldsWriter;