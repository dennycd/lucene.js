var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IndexReader = require('./IndexReader.js');
var CompositeReaderContext = require('./CompositeReaderContext.js');
var StringBuilder = require('library/lucene/util/StringBuilder.js');
var CompositeReader = defineClass({
	name: "CompositeReader",
	extend: IndexReader,
	variables: {
		readerContext: null,
		//CompositeReaderContext
	},
	construct: function() {
		IndexReader.call(this);
	},
	methods: {
		//@Override
		toString: function() {
			var buffer = new StringBuilder();
			buffer.append(this.getClass().getSimpleName());
			buffer.append('(');
			var subReaders = this.getSequentialSubReaders(); //final List<? extends IndexReader> subReaders = getSequentialSubReaders();
			assert(subReaders != null);
			if (!subReaders.isEmpty()) {
				buffer.append(subReaders.get(0));
				for (var i = 1, c = subReaders.size(); i < c; ++i) {
					buffer.append(" ").append(subReaders.get(i));
				}
			}
			buffer.append(')');
			return buffer.toString();
		},
		/** Expert: returns the sequential sub readers that this
		 *  reader is logically composed of. This method may not
		 *  return {@code null}.
		 *
		 *  <p><b>NOTE:</b> In contrast to previous Lucene versions this method
		 *  is no longer public, code that wants to get all {@link AtomicReader}s
		 *  this composite is composed of should use {@link IndexReader#leaves()}.
		 * @see IndexReader#leaves()
		 */
		//protected abstract List<? extends IndexReader> getSequentialSubReaders();		
		getSequentialSubReaders$abstract: function() {},
		//@Override
		//public final CompositeReaderContext getContext() {
		getContext: function() {
			this.ensureOpen();
			// lazy init without thread safety for perf reasons: Building the readerContext twice does not hurt!
			if (this.readerContext == null) {
				assert(this.getSequentialSubReaders() != null);
				this.readerContext = CompositeReaderContext.create(this);
			}
			return readerContext;
		}
	}
});
module.exports = exports = CompositeReader;