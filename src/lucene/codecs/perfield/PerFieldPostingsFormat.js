var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var PostingsFormat = require('../PostingsFormat.js');
var Closeable = require('library/lucene/util/Closeable.js');
var IllegalStateException = require('library/lucene/util/IllegalStateException.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var SegmentWriteState = require('library/lucene/index/SegmentWriteState.js');
var SegmentReadState = require('library/lucene/index/SegmentReadState.js');
var IOUtils = require('library/lucene/util/IOUtils.js');
var TreeMap = require('library/java/util/TreeMap.js');
var HashMap = require('library/java/util/HashMap.js');
var FieldsProducer = require('library/lucene/codecs/FieldsProducer.js');
var FieldsConsumer = require('library/lucene/codecs/FieldsConsumer.js');
/**
 * Enables per field postings support.
 * <p>
 * Note, when extending this class, the name ({@link #getName}) is
 * written into the index. In order for the field to be read, the
 * name must resolve to your implementation via {@link #forName(String)}.
 * This method uses Java's
 * {@link ServiceLoader Service Provider Interface} to resolve format names.
 * <p>
 * Files written by each posting format have an additional suffix containing the
 * format name. For example, in a per-field configuration instead of <tt>_1.prx</tt>
 * filenames would look like <tt>_1_Lucene40_0.prx</tt>.
 * @see ServiceLoader
 * @lucene.experimental
 */
var PerFieldPostingsFormat = defineClass({
	name: "PerFieldPostingsFormat",
	extend: PostingsFormat,
	construct: function() {
		PostingsFormat.call(this, PerFieldPostingsFormat.PER_FIELD_NAME);
	},
	
	statics: { /** Name of this {@link PostingsFormat}. */
		PER_FIELD_NAME: "PerField40",
		/** {@link FieldInfo} attribute name used to store the
		 *  format name for each field. */
		PER_FIELD_FORMAT_KEY: null,
		//PerFieldPostingsFormat.class.getSimpleName() + ".format";
		/** {@link FieldInfo} attribute name used to store the
		 *  segment suffix name for each field. */
		PER_FIELD_SUFFIX_KEY: null,
		//PerFieldPostingsFormat.class.getSimpleName() + ".suffix";
		getSuffix: function( /* String */ formatName, /* String */ suffix) {
			return formatName + "_" + suffix;
		},
		getFullSegmentSuffix: function( /* String */ fieldName, /* String */ outerSegmentSuffix, /* String */ segmentSuffix) {
			if (outerSegmentSuffix.length == 0) {
				return segmentSuffix;
			} else {
				// TODO: support embedding; I think it should work but
				// we need a test confirm to confirm
				// return outerSegmentSuffix + "_" + segmentSuffix;
				throw new IllegalStateException("cannot embed PerFieldPostingsFormat inside itself (field \"" + fieldName + "\" returned PerFieldPostingsFormat)");
			}
		}
	},
	methods: {
		//@Override
		//FieldsConsumer
		fieldsConsumer: function( /* SegmentWriteState */ state) {
			return new FieldsWriter(this, state);
		},
		//@Override
		//@return FieldsProducer
		fieldsProducer: function( /* SegmentReadState */ state) {
			return new FieldsReader(this, state);
		},
		/** 
		 * Returns the postings format that should be used for writing
		 * new segments of <code>field</code>.
		 * <p>
		 * The field to format mapping is written to the index, so
		 * this method is only invoked when writing, not when reading. */
		//@return PostingsFormat
		getPostingsFormatForField: function( /* String */ field) {
			throw new ImplNotSupportedException("PerFieldPostingsFormat::getPostingsFormatForField");
		}
	}
});
//static variable initialization
PerFieldPostingsFormat.PER_FIELD_FORMAT_KEY = PerFieldPostingsFormat.__class.getSimpleName() + ".format";
PerFieldPostingsFormat.PER_FIELD_SUFFIX_KEY = PerFieldPostingsFormat.__class.getSimpleName() + ".suffix";


var FieldsConsumerAndSuffix = defineClass({
	name: "FieldsConsumerAndSuffix",
	variables: {
		consumer: null,
		//FieldsConsumer
		suffix: null //int
	},
	methods: {
		//@Override
		close: function() {
			this.consumer.close();
		}
	}
});
var FieldsWriter = defineClass({
	name: "FieldsWriter",
	extend: FieldsConsumer,
	variables: {
		formats: new HashMap(),
		//new HashMap<PostingsFormat,FieldsConsumerAndSuffix>(); //Map<PostingsFormat,FieldsConsumerAndSuffix> 
		suffixes: new HashMap(), //Map<String,Integer> //new HashMap<String,Integer>();
		segmentWriteState: null,
		//SegmentWriteState
		parent: null,
		//PerFieldPostingsFormat - the parenting posting format instance
	},
	construct: function( /* PerFieldPostingsFormat */ parent, /* SegmentWriteState */ state) {
		this.parent = parent;
		this.segmentWriteState = state;
	},
	methods: {
		//@Override
		//TermsConsumer
		addField: function( /* FieldInfo */ field) {
			assert(Class.isInstanceOfClass(field, "FieldInfo"));
			var format = this.parent.getPostingsFormatForField(field.name); //PostingsFormat
			if (format == null) {
				throw new IllegalStateException("invalid null PostingsFormat for field=\"" + field.name + "\"");
			}
			var formatName = format.getName();
			var previousValue = field.putAttribute(PerFieldPostingsFormat.PER_FIELD_FORMAT_KEY, formatName); //String
			assert(previousValue == null);
			var suffix; //Integer
			var consumer = this.formats.get(format); //FieldsConsumerAndSuffix
			if (consumer == null) {
				// First time we are seeing this format; create a new instance
				// bump the suffix
				suffix = this.suffixes.get(formatName);
				if (suffix == null) {
					suffix = 0;
				} else {
					suffix = suffix + 1;
				}
				this.suffixes.put(formatName, suffix);
				var segmentSuffix = PerFieldPostingsFormat.getFullSegmentSuffix(field.name, this.segmentWriteState.segmentSuffix, PerFieldPostingsFormat.getSuffix(formatName, suffix.toString()));
				consumer = new FieldsConsumerAndSuffix();
				consumer.consumer = format.fieldsConsumer(new SegmentWriteState(this.segmentWriteState, segmentSuffix));
				consumer.suffix = suffix;
				this.formats.put(format, consumer);
			} else {
				// we've already seen this format, so just grab its suffix
				assert(this.suffixes.containsKey(formatName));
				suffix = consumer.suffix;
			}
			previousValue = field.putAttribute(PerFieldPostingsFormat.PER_FIELD_SUFFIX_KEY, suffix.toString());
			assert(previousValue == null);
			// TODO: we should only provide the "slice" of FIS
			// that this PF actually sees ... then stuff like
			// .hasProx could work correctly?
			// NOTE: .hasProx is already broken in the same way for the non-perfield case,
			// if there is a fieldinfo with prox that has no postings, you get a 0 byte file.
			return consumer.consumer.addField(field);
		},
		//@Override
		close: function() {
			// Close all subs
			IOUtils.closeWithObjects(this.formats.values());
		}
	}
})
var FieldsReader = defineClass({
	name: "FieldsReader",
	extend: FieldsProducer,
	variables: {
		parent: null,
		//PerFieldPostingsFormat - the parenting posting format instance
		fields: new TreeMap(),
		//private final Map<String,FieldsProducer> // new TreeMap<String,FieldsProducer>();
		formats: new HashMap() //final Map<String,FieldsProducer> formats = new HashMap<String,FieldsProducer>();			
	},
	construct: function( /* PerFieldPostingsFormat */ parent, /* SegmentReadState */ readState) {
		console.log("FieldsReader::construct");
		this.parent = parent;
		// Read _X.per and init each format:
		var success = false;
		try {
			// Read field name -> format name
			var self = this;
			
			readState.fieldInfos.forEach(function(fi) {
			
				debugger;
				if (fi.isIndexed()) {
					var fieldName = fi.name;
					var formatName = fi.getAttribute(PerFieldPostingsFormat.PER_FIELD_FORMAT_KEY);
					if (formatName != null) {
						// null formatName means the field is in fieldInfos, but has no postings!
						var suffix = fi.getAttribute(PerFieldPostingsFormat.PER_FIELD_SUFFIX_KEY);
						assert(suffix != null, "FieldsReader::construct");
						var format = PostingsFormat.forName(formatName); //PostingsFormat
						var segmentSuffix = PerFieldPostingsFormat.getSuffix(formatName, suffix); //String
						if (!self.formats.containsKey(segmentSuffix)) {
							self.formats.put(segmentSuffix, format.fieldsProducer(new SegmentReadState(readState, segmentSuffix)));
						}
						self.fields.put(fieldName, self.formats.get(segmentSuffix));
					}
				}
			});
			success = true;
		} catch (e) {
			console.log(e.toString());
		} finally {
			if (!success) {
				IOUtils.closeWhileHandlingException(this.formats.values());
			}
		}
		console.log("FieldsReader::construct done");

	},
	methods: {
		//@Override
		//@return Terms
		terms: function( /* String */ field) {
			var fieldsProducer = this.fields.get(field); //FieldsProducer
			return fieldsProducer == null ? null : fieldsProducer.terms(field);
		},
		//@Override
		size: function() {
			return this.fields.size();
		},
		//@Override
		close: function() {
			IOUtils.close(this.formats.values());
		}
	}
})
PerFieldPostingsFormat.FieldsConsumerAndSuffix = FieldsConsumerAndSuffix;
module.exports = exports = PerFieldPostingsFormat;