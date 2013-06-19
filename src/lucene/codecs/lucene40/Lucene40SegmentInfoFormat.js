var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');


var SegmentInfoFormat = require('../SegmentInfoFormat.js');
var Lucene40SegmentInfoReader = require('./Lucene40SegmentInfoReader.js');
var Lucene40SegmentInfoWriter = require('./Lucene40SegmentInfoWriter.js');


var Lucene40SegmentInfoFormat = defineClass({
	name : "Lucene40SegmentInfoFormat",
	extend : SegmentInfoFormat,
	statics : {
		  /** File extension used to store {@link SegmentInfo}. */
		   SI_EXTENSION : "si",
		   CODEC_NAME : "Lucene40SegmentInfo",
		   VERSION_START : 0,
		   VERSION_CURRENT : 0,
	},
	
	variables : {
		reader : new Lucene40SegmentInfoReader(),
		writer : new Lucene40SegmentInfoWriter(),
	},

	construct : function(){
		
	},	
	methods : {

		  //@Override
		   getSegmentInfoReader : function() {
		    return this.reader;
		  },
		
		  //@Override
		  getSegmentInfoWriter : function() {
		    return this.writer;
		  }
  

	}
});
module.exports = exports = Lucene40SegmentInfoFormat;