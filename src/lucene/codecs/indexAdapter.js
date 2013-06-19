/**
 Index DB Adapter module
 takes in analyzer's output and index the content to internal index database
**/
var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');



/**
 Basic Lucene Format Codecs
 
 REFERENCE http://lucene.apache.org/core/4_2_0/core/org/apache/lucene/codecs/lucene42/package-summary.html#package_description
 REFERENCE Lucene in Action 2nd Ed. Appendix B.
 
 Implementation Reference Based on 
	http://lucene.apache.org/core/4_2_0/core/org/apache/lucene/codecs/lucene42/Lucene42Codec.html
	 	
 	
**/
