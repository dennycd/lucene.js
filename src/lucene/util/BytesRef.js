var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

/** Represents byte[], as a slice (offset + length) into an
 *  existing byte[].  The {@link #bytes} member should never be null;
 *  use {@link #EMPTY_BYTES} if necessary.
 *
 * <p><b>Important note:</b> Unless otherwise noted, Lucene uses this class to
 * represent terms that are encoded as <b>UTF8</b> bytes in the index. To
 * convert them to a Java {@link String} (which is UTF16), use {@link #utf8ToString}.
 * Using code like {@code new String(bytes, offset, length)} to do this
 * is <b>wrong</b>, as it does not respect the correct character set
 * and may return wrong results (depending on the platform's defaults)!
 */
var BytesRef = defineClass({
	name : "BytesRef",
	
	construct : function(){
		
	},
	
	methods : {
		
	}
});



module.exports = exports = BytesRef;
 