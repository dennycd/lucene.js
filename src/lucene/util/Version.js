var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');

/**
 * Use by certain classes to match version compatibility
 * across releases of Lucene.
 * 
 * <p><b>WARNING</b>: When changing the version parameter
 * that you supply to components in Lucene, do not simply
 * change the version at search-time, but instead also adjust
 * your indexing code to match, and re-index.
 */
// remove me when java 5 is no longer supported
// this is a workaround for a JDK bug that wrongly emits a warning.

var Version = defineClass({
	name : "Version",
	variables : {
		version : null  //the version string	
	}, 
	construct : function(version){
		this.version = version;	
	},
	
	statics : {

		parseLeniently : function(version) {
/*
			var parsedMatchVersion = version.toUpperCase(Locale.ROOT);
			return Version.valueOf(parsedMatchVersion.replaceFirst("^(\\d)\\.(\\d)$", "LUCENE_$1$2"));
*/
    	}
  
	},
	
	methods : {

		onOrAfter : function(other) {
			//return compareTo(other) >= 0;
		}
  
	}
});


/** Match settings and bugs in Lucene's 4.1 release.
*  <p>
*  Use this to get the latest &amp; greatest settings, bug
*  fixes, etc, for Lucene.
*/
Version.LUCENE_41 = new Version("LUCENE_41");
		
/** Match settings and bugs in Lucene's 4.2 release.
*  <p>
*  Use this to get the latest &amp; greatest settings, bug
*  fixes, etc, for Lucene.
*/
Version.LUCENE_42 = new Version("LUCENE_42");

/* Add new constants for later versions **here** to respect order! */

/**
* <p><b>WARNING</b>: if you use this setting, and then
* upgrade to a newer release of Lucene, sizable changes
* may happen.  If backwards compatibility is important
* then you should instead explicitly specify an actual
* version.
* <p>
* If you use this constant then you  may need to 
* <b>re-index all of your documents</b> when upgrading
* Lucene, as the way text is indexed may have changed. 
* Additionally, you may need to <b>re-test your entire
* application</b> to ensure it behaves as expected, as 
* some defaults may have changed and may break functionality 
* in your application. 
* @deprecated Use an actual version instead. 
*/
//@Deprecated
Version.LUCENE_CURRENT = new Version("LUCENE_CURRENT");



module.exports = exports = Version;