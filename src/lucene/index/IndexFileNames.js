var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var StringBuilder = require('library/lucene/util/StringBuilder.js');
var Character = require('library/java/lang/Character.js');


var IndexFileNames = defineClass({
	name : "IndexFileNames",
	statics : {
		
		/** Name of the index segment file */
		 SEGMENTS : "segments",
		
		/** Extension of gen file */
		 GEN_EXTENSION : "gen",
		
		/** Name of the generation reference file name */
		 SEGMENTS_GEN : "segments." +  "gen",
		
		/** Extension of compound file */
		 COMPOUND_FILE_EXTENSION : "cfs",
		
		/** Extension of compound file entries */
		 COMPOUND_FILE_ENTRIES_EXTENSION : "cfe",


		/**
			Computes the full file name from base, extension and generation. If the generation is -1, 
			the file name is null. If it's 0, the file name is <base>.<ext>. If it's > 0, the file name is <base>_<gen>.<ext>.
			NOTE: .<ext> is added to the name only if ext is not an empty string.		* 
		* @param base main part of the file name
		* @param ext extension of the filename
		* @param gen generation
		*/
		fileNameFromGeneration : function(/* String */ base, /* String */ ext, /* long */ gen){
			if (gen == -1) {
			  return null;
			} else if (gen == 0) {
			  return IndexFileNames.segmentFileName(base, "", ext);
			} else {
			  assert(gen > 0);
			  // The '6' part in the length is: 1 for '.', 1 for '_' and 4 as estimate
			  // to the gen length as string (hopefully an upper limit so SB won't
			  // expand in the middle.
/*
			  var res = new StringBuilder(base.length + 6 + ext.length);
			  res.append(base).append('_').append( Number(gen).toString(Character.MAX_RADIX)); //Long.toString(gen, Character.MAX_RADIX));
			  if (ext.length() > 0) {
			    res.append('.').append(ext);
*/
				var res = base + "_" + Number(gen).toString(Character.MAX_RADIX);
				if(ext.length > 0)
					res += "." + ext;
			  //}
			  return  res; //res.toString();
			}
		}, 
  
		/**
		Returns a file name that includes the given segment name, your own custom name and extension. The format of the filename is: <segmentName>(_<name>)(.<ext>).
		NOTE: .<ext> is added to the result file name only if ext is not empty.
		NOTE: _<segmentSuffix> is added to the result file name only if it's not the empty string
		NOTE: all custom files should be named using this method, or otherwise some structures may fail to handle them properly (such as if they are added to compound files).
		**/
		segmentFileName : function(/* String */ segmentName, /* String */ segmentSuffix, /* String */ ext) {
			if (ext.length > 0 || segmentSuffix.length > 0) {
			  assert( ext.indexOf(".") == -1);
			  var sb = segmentName;
			  if (segmentSuffix.length > 0) {
			    sb += "_" + segmentSuffix;
			  }
			  if (ext.length > 0) {
			    sb += "." + ext;
			  }
			  return sb;
			} else {
			  return segmentName;
			}
		},
  
		
  
	}
});

module.exports = exports = IndexFileNames;