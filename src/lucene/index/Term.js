var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var BytesRef = require('library/lucene/util/BytesRef.js');
var Term = defineClass({
	name: "Term",
	variables: {
		field: null,
		//string 
		bytes: null,
		//BytesRef  term text
	},
	
	//public Term(String fld, BytesRef bytes) 
	//public Term(String fld, String text) 
	//public Term(String fld) 
	construct: function() {
		if (arguments.length >= 1) {
			assert(typeof(arguments[0]) == "string");
			this.field = arguments[0];
			if (arguments.length >= 2) {
				if (typeof(arguments[1]) == "string") {
					this.bytes = new BytesRef(arguments[1]);
				} else if (Class.isInstanceOfClass(arguments[1], "BytesRef")) this.bytes = arguments[1];
				else throw new IllegalArgumentException("invalid term constructor args");
			}
			else this.bytes = new BytesRef();
		}
	},
	methods: {
/** Returns the field of this term.   The field indicates
    the part of a document which this term came from. */
		field: function() {
			return field;
		},
/** Returns the text of this term.  In the case of words, this is simply the
    text of the word.  In the case of dates and other types, this is an
    encoding of the object as a string.  */
		text: function() {
			return bytes.utf8ToString();
		},
		/** Returns the bytes of this term. */
		bytes: function() {
			return bytes;
		},
		//@Override
		equals: function( /* Object */ obj) {
			if (this === obj) return true;
			if (obj == null) return false;
			if (this.getClass() !== obj.getClass()) return false;
			var other = obj;
			if (this.field == null) {
				if (other.field != null) return false;
			} else if (this.field != other.field) return false;
			if (this.bytes == null) {
				if (other.bytes != null) return false;
			} else if (!this.bytes.equals(other.bytes)) return false;
			return true;
		},
		// @Override
		// TOOD - fix the hash code implementation
		hashCode: function() {
			var prime = 31;
			var result = 1;
			result = prime * result + ((this.field == null) ? 0 : this.field); //this.field.hashCode());
			result = prime * result + ((this.bytes == null) ? 0 : this.bytes.hashCode());
			return result;
			},
/** Compares two terms, returning a negative integer if this
    term belongs before the argument, zero if this term is equal to the
    argument, and a positive integer if this term belongs after the argument.

    The ordering of terms is first by field, then by text.*/
			//@Override
			compareTo: function( /* Term */ other) {
				if (this.field == other.field) {
				return this.bytes.compareTo(other.bytes);
			} else {
				return this.field.localeCompare(other.field);
			}
		},
		/** 
		 * Resets the field and text of a Term.
		 * <p>WARNING: the provided BytesRef is not copied, but used directly.
		 * Therefore the bytes should not be modified after construction, for
		 * example, you should clone a copy rather than pass reused bytes from
		 * a TermsEnum.
		 */
		set: function( /* String */ fld, /* BytesRef */ bytes) {
			this.field = fld;
			this.bytes = bytes;
		},
		//@Override
		toString: function() {
			return this.field + ":" + this.bytes.utf8ToString();
		}
	}
});
module.exports = exports = Term;