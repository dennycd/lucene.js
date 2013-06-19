var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');


var Codec = defineClass({
	name: "Codec",
	statics: {
		defaultCodec: null,
		
		//a constructor refering to a concrete codec class 
		getDefault: function() {

//static variables initialization goes here
			if(!Codec.defaultCodec) 
				Codec.defaultCodec = Codec.forName("Lucene42");
				
			return Codec.defaultCodec;
		},
		setDefault: function( /* Codec */ codec) {
			Codec.defaultCodec = codec;
		},
		/** looks up and return a concrete codec class by name */
		//@return  the constructor obj for the concrete codec class matching the specified name
		//TODO - loading from directory
		forName: function( /* String */ name) {
			//var modulePath = "./" + name + ".js";
			var modulePath = "./lucene42/Lucene42Codec.js";
			var codec = require(modulePath);
			assert(codec && typeof(codec) == "function" && codec.__class && codec.__class.isKindOfClass("Codec"));
			return new codec();
		},
/* returns a list of all available codec names 
			  @return an array of codecs strings
		  */
		availableCodecs: function() {
			return ["Lucene42"];
		},
		reloadCodecs: function() {},
	},
	variables: {
		name: null,
		//string
	},
	/**
	 * Creates a new codec.
	 * <p>
	 * The provided name will be written into the index segment: in order to
	 * for the segment to be read this class should be registered with Java's
	 * SPI mechanism (registered in META-INF/ of your jar file, etc).
	 * @param name must be all ascii alphanumeric, and less than 128 characters in length.
	 */
	construct: function(name) {
		this.name = name;
	},
	methods: {
		getName: function() {
			return this.name;
		},
		/**
		 * returns the codec's name. Subclasses can override to provide
		 * more detail (such as parameters).
		 */
		toString: function() {
			return this.name;
		},
		 /** Encodes/decodes postings */
		/* PostingsFormat */
		postingsFormat: function() {},
		/** Encodes/decodes docvalues */
		/* DocValuesFormat */
		docValuesFormat: function() {},
		/** Encodes/decodes stored fields */
		/* StoredFieldsFormat */
		storedFieldsFormat: function() {},
		/** Encodes/decodes term vectors */
		/* TermVectorsFormat */
		termVectorsFormat: function() {},
		/** Encodes/decodes field infos file */
		/* FieldInfosFormat */
		fieldInfosFormat: function() {},
		/** Encodes/decodes segment info file */
		/* SegmentInfoFormat */
		segmentInfoFormat: function() {},
		/** Encodes/decodes document normalization values */
		/* NormsFormat */
		normsFormat: function() {},
		/** Encodes/decodes live docs */
		/* LiveDocsFormat */
		liveDocsFormat: function() {}
	}
});




module.exports = exports = Codec;