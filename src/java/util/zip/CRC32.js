var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var CRC = require('library/crc/crc.js');
var Checksum = require('./Checksum.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var ArrayIndexOutOfBoundsException = require('library/java/lang/ArrayIndexOutOfBoundsException.js');
var CRC32 = defineClass({
	name: "CRC32",
	implement: Checksum,
	construct: function() {},
	statics: {},
	variables: {
		crc: null,
		//int,
		buf: new Array()
	},
	methods: {
		update: function() {
			console.log("CRC32::update");
			if (arguments.length == 1) {
				if (typeof(arguments[0]) == "string") {
					if (arguments[0].length == 1) return this.updateWithByte(arguments[0].charCodeAt(0));
				} else if (typeof(arguments[0]) == "number") {
					return this.updateWithByte(arguments[0]);
				} else if (arguments[0] instanceof Buffer) return this.updateWithBytes(arguments[0]);
			} else if (arguments.length == 3) {
				return this.updateWithBytesOffset(arguments[0], arguments[1], arguments[2]);
			}
			throw new IllegalArgumentException("CRC32::update with args count " + arguments.length);
		},
		/**
		 * Updates the CRC-32 checksum with the specified byte (the low
		 * eight bits of the argument b).
		 *
		 * @param b the byte to update the checksum with
		 */
		//Override
		updateWithByte: function( /* int */ b) {
			assert(typeof(b) == "number" && b >= 0 && b <= 255);
			this.buf.push(b);
/*
	        if(!this.crc){
	        	this.crc = CRC.crc32(String.fromCharCode(b)); //crc32 interprets input as a string, so we need to convert the byte value to a string
	        }
	        else{
		        this.crc = CRC.crc32Add(this.crc, b);
*/
		},
		/**
		 * Updates the CRC-32 checksum with the specified array of bytes.
		 *
		 * b -  an array of bytes
		 */
		//Override
		updateWithBytesOffset: function( /* byte[] */ b, /* int */ off, /* int */ len) {
			//console.log("CRC32::updateWithBytesOffset");
			if (!(b instanceof Buffer)) throw new IllegalArgumentException("CRC32::updateWithBytesOffset  b must be a buffer obj");
			if (off < 0 || len < 0 || off > b.length - len) throw new ArrayIndexOutOfBoundsException("CRC32::updateWithBytesOffset ");
			for (var i = off; i <  off +len; i++) {
				//assert(typeof(b[i])=="string" && b[i].length==1);
				//this.crc = CRC.crc32Add(this.crc, b[i].charCodeAt(0));
				//this.crc = CRC.crc32Add(this.crc, b[i]);
				this.buf.push(b[i]);
			}
		},
		/**
		 * Updates the CRC-32 checksum with the specified array of bytes.
		 *
		 * @param b the array of bytes to update the checksum with
		 */
		updateWithBytes: function( /* byte[] */ b) {
			this.updateWithBytesOffset(b, 0, b.length);
		},
		/**
		 * Resets CRC-32 to initial value.
		 */
		reset: function() {
			this.crc = null;
		},
		/**
		 * Returns CRC-32 value.
		 */
		getValue: function() {
			if (!this.crc) this.crc = CRC.crc32Buffer(new Buffer(this.buf));
			return this.crc; //& 0xffffffff; 
		}
	}
});
module.exports = exports = CRC32;