var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

/**
 * Controls the format of stored fields
 */
var StoredFieldsFormat = defineClass({
	name : "StoredFieldsFormat",
	construct : function(){},
  /** Returns a {@link StoredFieldsReader} to load stored
   *  fields. */
   /* StoredFieldsReader */ 
   fieldsReader : function(/* Directory */ directory, /* SegmentInfo */ si, /* FieldInfos */ fn, /* IOContext */ context){},

  /** Returns a {@link StoredFieldsWriter} to write stored
   *  fields. */
   /* StoredFieldsWriter */ 
   fieldsWriter : function(/* Directory */ directory, /* SegmentInfo */ si, /* IOContext */ context){}
});
module.exports = exports = StoredFieldsFormat;