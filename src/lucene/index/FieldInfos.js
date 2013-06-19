var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var TreeMap = require('library/java/util/TreeMap.js');
var HashMap = require('library/java/util/HashMap.js');
var Map = require('library/java/util/Map.js');

var IndexOptions = require('./FieldInfo.js').IndexOptions;
var Collections = require('library/java/util/Collections.js');

/** 
 * Collection of {@link FieldInfo}s (accessible by number or by name).
 *  @lucene.experimental
 */
var FieldInfos = defineClass({
	name: "FieldInfos",
	/**
	 * Constructs a new FieldInfos from an array of FieldInfo objects
	 */
	construct: function( /*FieldInfo[]*/ infos) {
		console.log("FieldInfos::construct");
		if (arguments.length == 1) {
			if (!(arguments[0] instanceof Array)) throw new IllegalArgumentException("FieldInfos::construct");
			var hasVectors = false;
			var hasProx = false;
			var hasPayloads = false;
			var hasOffsets = false;
			var hasFreq = false;
			var hasNorms = false;
			var hasDocValues = false;
			//FieldInfo
			for (var idx in infos) {
				var info = infos[idx];
				var previous = this.byNumber.put(info.number, info); //FieldInfo
				if (previous != null) {
					throw new IllegalArgumentException("duplicate field numbers: " + previous.name + " and " + info.name + " have: " + info.number);
				}
				previous = this.byName.put(info.name, info);
				if (previous != null) {
					throw new IllegalArgumentException("duplicate field names: " + previous.number + " and " + info.number + " have: " + info.name);
				}
				hasVectors |= info.hasVectors();
				hasProx |= info.isIndexed() && (info.getIndexOptions()-IndexOptions.DOCS_AND_FREQS_AND_POSITIONS) >= 0;
				hasFreq |= info.isIndexed() && (info.getIndexOptions() != IndexOptions.DOCS_ONLY);
				hasOffsets |= info.isIndexed() && (info.getIndexOptions()-IndexOptions.DOCS_AND_FREQS_AND_POSITIONS_AND_OFFSETS) >= 0;
				hasNorms |= info.hasNorms();
				hasDocValues |= info.hasDocValues();
				hasPayloads |= info.hasPayloads();
			}
			this.hasVectors = hasVectors;
			this.hasProx = hasProx;
			this.hasPayloads = hasPayloads;
			this.hasOffsets = hasOffsets;
			this.hasFreq = hasFreq;
			this.hasNorms = hasNorms;
			this.hasDocValues = hasDocValues;
			this.values = Collections.unmodifiableCollection(this.byNumber.values());
		}
		console.log("FieldInfos::construct done");
	},
	variables: {
		hasFreq: false,
		hasProx: false,
		hasPayloads: false,
		hasOffsets: false,
		hasVectors: false,
		hasNorms: false,
		hasDocValues: false,
		byNumber: new TreeMap(),
		// new TreeMap<Integer,FieldInfo>(), //SortedMap<Integer,FieldInfo> 
		byName: new HashMap(),
		//new HashMap<String,FieldInfo>(), // HashMap<String,FieldInfo> 
		values: null //[] //Collection<FieldInfo>  // for an unmodifiable iterator
	},
	methods: { /** Returns the number of fields */
	
		//invoked for each fieldInfo
		//op - function(fieldInfo)
		forEach : function(op){
			for(var i in this.values) op(this.values[i]);
		},
	
		size: function() {
			assert(this.byNumber.size() == this.byName.size());
			return this.byNumber.size();
		},
		
		fieldInfo : function(f){
			if(typeof(f)=="string") return this.fieldInfoWithFieldName(f);
			else return this.fieldInfoWithFieldNumber(f);
		}, 
		
		/**
		 * Return the fieldinfo object referenced by the field name
		 * @return the FieldInfo object or null when the given fieldName
		 * doesn't exist.
		 */
		//FieldInfo
		fieldInfoWithFieldName: function( /* String */ fieldName) {
			return this.byName.get(fieldName);
		},
		/**
		 * Return the fieldinfo object referenced by the fieldNumber.
		 * @param fieldNumber field's number. if this is negative, this method
		 *        always returns null.
		 * @return the FieldInfo object or null when the given fieldNumber
		 * doesn't exist.
		 */
		// TODO: fix this negative behavior, this was something related to Lucene3x?
		// if the field name is empty, i think it writes the fieldNumber as -1
		//@return FieldInfo
		fieldInfoWithFieldNumber: function( /* int */ fieldNumber) {
			return (fieldNumber >= 0) ? this.byNumber.get(fieldNumber) : null;
		}
	}
});
var FieldNumbers = defineClass({
	name: "FieldNumbers",
	construct: function() {
		this.nameToNumber = new HashMap(), //new HashMap < String, Integer > ();
		this.numberToName = new HashMap(), //new HashMap < Integer, String > ();
		this.docValuesType = new HashMap() //new HashMap < String, DocValuesType > ();
	},
	variables: {
		numberToName: null,
		//Map<Integer,String>
		nameToNumber: null,
		// We use this to enforce that a given field never
		// changes DV type, even across segments / IndexWriter
		// sessions:
		docValuesType: null,
		//Map<String,DocValuesType>
		// TODO: we should similarly catch an attempt to turn
		// norms back on after they were already ommitted; today
		// we silently discard the norm but this is badly trappy
		lowestUnassignedFieldNumber: -1
	},
	methods: {
		/**
		 * Returns the global field number for the given field name. If the name
		 * does not exist yet it tries to add it with the given preferred field
		 * number assigned if possible otherwise the first unassigned field number
		 * is used as the field number.
		 */
		//@return int
		addOrGet: function( /* String */ fieldName, /* int */ preferredFieldNumber, /* DocValuesType */ dvType) {
			if (dvType != null) {
				var currentDVType = this.docValuesType.get(fieldName); //DocValuesType
				if (currentDVType == null) {
					this.docValuesType.put(fieldName, dvType);
				} else if (currentDVType != null && currentDVType != dvType) {
					throw new IllegalArgumentException("cannot change DocValues type from " + currentDVType + " to " + dvType + " for field \"" + fieldName + "\"");
				}
			}
			var fieldNumber = this.nameToNumber.get(fieldName); //Integer
			if (fieldNumber == null) {
				var preferredBoxed = Number(preferredFieldNumber);
				if (preferredFieldNumber != -1 && !this.numberToName.containsKey(preferredBoxed)) {
					// cool - we can use this number globally
					fieldNumber = preferredBoxed;
				} else {
					// find a new FieldNumber
					while (this.numberToName.containsKey(++this.lowestUnassignedFieldNumber)) {
						// might not be up to date - lets do the work once needed
					}
					fieldNumber = this.lowestUnassignedFieldNumber;
				}
				this.numberToName.put(fieldNumber, fieldName);
				this.nameToNumber.put(fieldName, fieldNumber);
			}
			return fieldNumber; //fieldNumber.intValue();
		},
		// used by assert
		//@return boolean
		containsConsistent: function( /* Integer */ number, /* String */ name, /* DocValuesType */ dvType) {
			return (name == this.numberToName.get(number)) && (number == nameToNumber.get(name)) && (dvType == null || this.docValuesType.get(name) == null || dvType == this.docValuesType.get(name));
		},
		clear: function() {
			this.numberToName.clear();
			this.nameToNumber.clear();
			this.docValuesType.clear();
		}
	}
})
var Builder = defineClass({
	name: "Builder",
	construct: function() {
		if (arguments.length == 0) this.globalFieldNumbers = new FieldNumbers();
		else {
			if (!Class.isInstanceOfClass(arguemtns[0], "FieldNumbers")) throw new IllegalArgumentException("Builder::construct");
			this.globalFieldNumbers = arguments[0];
		}
	},
	variables: {
		byName: new HashMap(),
		//new HashMap<String,FieldInfo>(); //private final HashMap<String,FieldInfo> 
		globalFieldNumbers: null //FieldNumbers
	},
	methods: {
		add: function( /* FieldInfos */ other) {
			for ( /*FieldInfo*/
			var fieldInfo in other) {
				this.addFieldInfo(fieldInfo);
			}
		},
		/** NOTE: this method does not carry over termVector
		 *  booleans nor docValuesType; the indexer chain
		 *  (TermVectorsConsumerPerField, DocFieldProcessor) must
		 *  set these fields when they succeed in consuming
		 *  the document */
		//@return FieldInfo
		addOrUpdate: function( /* String */ name, /* IndexableFieldType */ fieldType) {
			// TODO: really, indexer shouldn't even call this
			// method (it's only called from DocFieldProcessor);
			// rather, each component in the chain should update
			// what it "owns".  EG fieldType.indexOptions() should
			// be updated by maybe FreqProxTermsWriterPerField:
			return this.addOrUpdateInternal(name, -1, fieldType.indexed(), false, fieldType.omitNorms(), false, fieldType.indexOptions(), fieldType.docValueType(), null);
		},
		//@return FieldInfo
		addOrUpdateInternal: function( /* String */ name, /* int */ preferredFieldNumber, /* boolean */ isIndexed, /* boolean */ storeTermVector, /* boolean */ omitNorms, /* boolean */ storePayloads, /* IndexOptions */ indexOptions, /* DocValuesType */ docValues, /* DocValuesType */ normType) {
			var fi = this.fieldInfo(name); //FieldInfo
			if (fi == null) {
				// This field wasn't yet added to this in-RAM
				// segment's FieldInfo, so now we get a global
				// number for this field.  If the field was seen
				// before then we'll get the same name and number,
				// else we'll allocate a new one:
				var fieldNumber = this.globalFieldNumbers.addOrGet(name, preferredFieldNumber, docValues); //int
				fi = new FieldInfo(name, isIndexed, fieldNumber, storeTermVector, omitNorms, storePayloads, indexOptions, docValues, normType, null);
				assert(!this.byName.containsKey(fi.name));
				assert(this.globalFieldNumbers.containsConsistent(Number(fi.number), fi.name, fi.getDocValuesType()));
				this.byName.put(fi.name, fi);
			} else {
				fi.update(isIndexed, storeTermVector, omitNorms, storePayloads, indexOptions);
				if (docValues != null) {
					fi.setDocValuesType(docValues);
				}
				if (!fi.omitsNorms() && normType != null) {
					fi.setNormValueType(normType);
				}
			}
			return fi;
		},
		//@return FieldInfo
		addFieldInfo: function( /* FieldInfo */ fi) {
			// IMPORTANT - reuse the field number if possible for consistent field numbers across segments
			return this.addOrUpdateInternal(fi.name, fi.number, fi.isIndexed(), fi.hasVectors(), fi.omitsNorms(), fi.hasPayloads(), fi.getIndexOptions(), fi.getDocValuesType(), fi.getNormType());
		},
		//FieldInfo
		fieldInfo: function( /* String */ fieldName) {
			return this.byName.get(fieldName);
		},
		//FieldInfos
		finish: function() {
			var arr = new Array(this.byName.size()); //new FieldInfo[byName.size()]);
			return new FieldInfos(this.byName.values().toArray(arr));
		}
	}
});
module.exports = exports = FieldInfos;