var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
/**
 * Expert: Controls the format of the 
 * {@link SegmentInfo} (segment metadata file).
 * <p>
 * 
 * @see SegmentInfo
 * @lucene.experimental
 */
var SegmentInfoFormat = defineClass({
	name : "SegmentInfoFormat",
	construct : function(){},
	methods : {

  /** Returns the {@link SegmentInfoReader} for reading
   *  {@link SegmentInfo} instances. */
   /* SegmentInfoReader */ getSegmentInfoReader : function(){throw new ImplNotSupportedException("SegmentInfoFormat::getSegmentInfoReader");},

  /** Returns the {@link SegmentInfoWriter} for writing
   *  {@link SegmentInfo} instances. */
   /* SegmentInfoWriter */ getSegmentInfoWriter : function(){throw new ImplNotSupportedException("SegmentInfoFormat::getSegmentInfoWriter");}		
	}
});
module.exports = exports = SegmentInfoFormat;

