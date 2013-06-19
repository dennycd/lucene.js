var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
/**
 * <p>A MergeInfo provides information required for a MERGE context.
 *  It is used as part of an {@link IOContext} in case of MERGE context.</p>
 */
var MergeInfo = defineClass({
	name: "MergeInfo",
	/**
	 * <p>Creates a new {@link MergeInfo} instance from
	 * the values required for a MERGE {@link IOContext} context.
	 *
	 * These values are only estimates and are not the actual values.
	 *
	 */
	construct: function(totalDocCount, estimatedMergeBytes, isExternal, mergeMaxNumSegments) {
		this.totalDocCount = totalDocCount;
		this.estimatedMergeBytes = estimatedMergeBytes;
		this.isExternal = isExternal;
		this.mergeMaxNumSegments = mergeMaxNumSegments;
	},
	methods: {
		hashCode: function() {
			var prime = new Number(31);
			var result = new Number(1);
			result = prime * result + Number(this.estimatedMergeBytes ^ (this.estimatedMergeBytes >>> 32));
			result = prime * result + (this.isExternal ? 1231 : 1237);
			result = prime * result + this.mergeMaxNumSegments;
			result = prime * result + this.totalDocCount;
			return result;
		},
		equals: function(obj) {
			if (this === obj) //self referencing 
			return true;
			if (obj === null || obj === undefined || isNaN(obj)) //invalid obj
			return false;
			if (obj.classname != this.classname) return false;
			if (this.estimatedMergeBytes != obj.estimatedMergeBytes) return false;
			if (this.isExternal != obj.isExternal) return false;
			if (this.mergeMaxNumSegments != obj.mergeMaxNumSegments) return false;
			if (this.totalDocCount != obj.totalDocCount) return false;
			return true;
		},
		toString: function() {
			return "MergeInfo [totalDocCount=" + this.totalDocCount + ", estimatedMergeBytes=" + this.estimatedMergeBytes + ", isExternal=" + this.isExternal + ", mergeMaxNumSegments=" + this.mergeMaxNumSegments + "]";
		}
	}
});
module.exports = exports = MergeInfo;