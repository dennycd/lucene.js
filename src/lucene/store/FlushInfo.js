var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

/**
 * <p>A FlushInfo provides information required for a FLUSH context.
 *  It is used as part of an {@link IOContext} in case of FLUSH context.</p>
 */
var FlushInfo = defineClass({
	name: "FlushInfo",
	/**
	 * <p>Creates a new {@link FlushInfo} instance from
	 * the values required for a FLUSH {@link IOContext} context.
	 *
	 * These values are only estimates and are not the actual values.
	 *
	 */
	construct: function(numDocs, estimatedSegmentSize) {
		this.numDocs = numDocs;
		this.estimatedSegmentSize = estimatedSegmentSize;
	},
	methods: {
		hashCode: function() {
			var prime = new Number(31);
			var result = 1;
			result = prime * result + Number(this.estimatedSegmentSize ^ (this.estimatedSegmentSize >>> 32));
			result = prime * result + this.numDocs;
			return result;
		},
		equals: function(obj) {
			if (this === obj) return true;
			if (obj === null || obj === undefined || isNaN(obj)) //invalid obj
			return false;
			if (obj.classname != this.classname) return false;
			if (this.estimatedSegmentSize != obj.estimatedSegmentSize) return false;
			if (this.numDocs != obj.numDocs) return false;
			return true;
		},

		toString : function() {
		    return "FlushInfo [numDocs=" + this.numDocs + ", estimatedSegmentSize="
		        + this.estimatedSegmentSize + "]";
		}

	}
});
module.exports = exports = FlushInfo;