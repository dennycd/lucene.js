var util = require('util');
var assert = require('assert');
var defineInterface = require('library/class/defineInterface.js');

/**
 An interface representing a data checksum.
**/
var Checksum = defineInterface({
	name : "Checksum",
	methods :{
	    /**
	     * Updates the current checksum with the specified byte.
	     *
	     * @param b the byte to update the checksum with
	     */
	     updateWithByte : function(/* int */ b){},
	
	    /**
	     * Updates the current checksum with the specified array of bytes.
	     * @param b the byte array to update the checksum with
	     * @param off the start offset of the data
	     * @param len the number of bytes to use for the update
	     */
	     updateWithBytesOffset : function(/* byte[] */ b, /* int */ off, /* int */ len){},
	
	    /**
	     * Returns the current checksum value.
	     * @return the current checksum value
	     */
	    getValue : function(){},
	
	    /**
	     * Resets the checksum to its initial value.
	     */
	    reset : function(){}
	}
});
module.exports = exports = Checksum;