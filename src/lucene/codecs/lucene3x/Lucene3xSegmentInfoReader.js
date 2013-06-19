var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

/**
 * Lucene 3x implementation of {@link SegmentInfoReader}.
 * @lucene.experimental
 * @deprecated Only for reading existing 3.x indexes
 */
var Lucene3xSegmentInfoReader = defineClass({
	name : "Lucene3xSegmentInfoReader"
	statics : {
		  readLegacyInfos : function(/* SegmentInfos */ infos, /* Directory */ directory, /* IndexInput */ input, /* int */ format)  {
		  
		  }


	}
});
module.exports = exports = Lucene3xSegmentInfoReader;