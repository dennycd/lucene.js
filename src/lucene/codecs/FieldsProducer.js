var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Fields = require('library/lucene/index/Fields.js');
var Closeable = require('library/lucene/util/Closeable.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/** Abstract API that produces terms, doc, freq, prox, offset and
 *  payloads postings.
 *
 * @lucene.experimental
 */
var FieldsProducer = defineClass({
	name: "FieldsProducer",
	extend: Fields,
	implement: Closeable,
	methods: {
		//@Override
		close: function() {
			throw new ImplNotSupportedException("FieldsProducer::close");
		}
	}
});
module.exports = exports = FieldsProducer;