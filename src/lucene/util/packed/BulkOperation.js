var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var PackedInts = require('./PackedInts.js');
var AssertionError = require('library/java/lang/AssertionError.js');
/**
 * Efficient sequential read/write of packed integers.
 */
var BulkOperation = defineClass({
	name: "BulkOperation",
	implement: [PackedInts.Decoder, PackedInts.Encoder],
	statics: {
		packedBulkOps: null,
		//BulkOperation[]
		packedSingleBlockBulkOps: null,
		//BulkOperation[]  //// NOTE: this is sparse (some entries are null):
		//@return BulkOperation
		of: function( /* PackedInts.Format */ format, /* int */ bitsPerValue) {
			switch (format) {
			case PackedInts.Format.PACKED:
				if (!BulkOperation.packedBulkOps) BulkOperationInit();
				assert(BulkOperation.packedBulkOps[bitsPerValue - 1] != null);
				return BulkOperation.packedBulkOps[bitsPerValue - 1];
			case PackedInts.Format.PACKED_SINGLE_BLOCK:
				if (!BulkOperation.packedSingleBlockBulkOps) BulkOperationInit();
				assert(BulkOperation.packedSingleBlockBulkOps[bitsPerValue - 1] != null);
				return BulkOperation.packedSingleBlockBulkOps[bitsPerValue - 1];
			default:
				throw new AssertionError("BulkOperation.js");
			}
		}
	},
	methods: {
		//@return int
		writeLong: function( /* long */ block, /* byte[] */ blocks, /* int */ blocksOffset) {
			for (var j = 1; j <= 8; ++j) {
				blocks[blocksOffset++] = (block >>> (64 - (j << 3)));
			}
			return blocksOffset;
		},
		/**
		 * For every number of bits per value, there is a minimum number of
		 * blocks (b) / values (v) you need to write in order to reach the next block
		 * boundary:
		 *  - 16 bits per value -> b=2, v=1
		 *  - 24 bits per value -> b=3, v=1
		 *  - 50 bits per value -> b=25, v=4
		 *  - 63 bits per value -> b=63, v=8
		 *  - ...
		 *
		 * A bulk read consists in copying <code>iterations*v</code> values that are
		 * contained in <code>iterations*b</code> blocks into a <code>long[]</code>
		 * (higher values of <code>iterations</code> are likely to yield a better
		 * throughput) => this requires n * (b + 8v) bytes of memory.
		 *
		 * This method computes <code>iterations</code> as
		 * <code>ramBudget / (b + 8v)</code> (since a long is 8 bytes).
		 */
		//@return int
		computeIterations: function( /* int */ valueCount, /* int */ ramBudget) {
			var iterations = ramBudget / (this.byteBlockCount() + 8 * this.byteValueCount());
			if (iterations == 0) {
				// at least 1
				return 1;
			} else if ((iterations - 1) * this.byteValueCount() >= valueCount) {
				// don't allocate for more than the size of the reader
				return Math.ceil(valueCount / this.byteValueCount());
			} else {
				return iterations;
			}
		}
	}
});


//delayed initialization to resolve cyclic definition problem
function BulkOperationInit(){
	//make sure all pre considtion are valid
	assert(BulkOperation!=undefined && BulkOperation.packedBulkOps==null && BulkOperation.packedSingleBlockBulkOps==null); 
	
	//loading the concrete class here 
	var BulkOperationPacked = require('./BulkOperationPacked.js');
	var BulkOperationPackedSingleBlock = require('./BulkOperationPackedSingleBlock.js');
	
	var BulkOperationPacked1 = require('./BulkOperationPacked1.js');
	var BulkOperationPacked2 = require('./BulkOperationPacked2.js');
	var BulkOperationPacked3 = require('./BulkOperationPacked3.js');
	var BulkOperationPacked4 = require('./BulkOperationPacked4.js');
	var BulkOperationPacked5 = require('./BulkOperationPacked5.js');
	var BulkOperationPacked6 = require('./BulkOperationPacked6.js');
	var BulkOperationPacked7 = require('./BulkOperationPacked7.js');
	var BulkOperationPacked8 = require('./BulkOperationPacked8.js');
	var BulkOperationPacked9 = require('./BulkOperationPacked9.js');
	var BulkOperationPacked10 = require('./BulkOperationPacked10.js');
	var BulkOperationPacked11 = require('./BulkOperationPacked11.js');
	var BulkOperationPacked12 = require('./BulkOperationPacked12.js');
	var BulkOperationPacked13 = require('./BulkOperationPacked13.js');
	var BulkOperationPacked14 = require('./BulkOperationPacked14.js');
	var BulkOperationPacked15 = require('./BulkOperationPacked15.js');
	var BulkOperationPacked16 = require('./BulkOperationPacked16.js');
	var BulkOperationPacked17 = require('./BulkOperationPacked17.js');
	var BulkOperationPacked18 = require('./BulkOperationPacked18.js');
	var BulkOperationPacked19 = require('./BulkOperationPacked19.js');
	var BulkOperationPacked20 = require('./BulkOperationPacked20.js');
	var BulkOperationPacked21 = require('./BulkOperationPacked21.js');
	var BulkOperationPacked22 = require('./BulkOperationPacked22.js');
	var BulkOperationPacked23 = require('./BulkOperationPacked23.js');
	var BulkOperationPacked24 = require('./BulkOperationPacked24.js');

	BulkOperation.packedBulkOps = new Array( //new  {
		    new BulkOperationPacked1(),
		    new BulkOperationPacked2(),
		    new BulkOperationPacked3(),
		    new BulkOperationPacked4(),
		    new BulkOperationPacked5(),
		    new BulkOperationPacked6(),
		    new BulkOperationPacked7(),
		    new BulkOperationPacked8(),
		    new BulkOperationPacked9(),
		    new BulkOperationPacked10(),
		    new BulkOperationPacked11(),
		    new BulkOperationPacked12(),
		    new BulkOperationPacked13(),
		    new BulkOperationPacked14(),
		    new BulkOperationPacked15(),
		    new BulkOperationPacked16(),
		    new BulkOperationPacked17(),
		    new BulkOperationPacked18(),
		    new BulkOperationPacked19(),
		    new BulkOperationPacked20(),
		    new BulkOperationPacked21(),
		    new BulkOperationPacked22(),
		    new BulkOperationPacked23(),
		    new BulkOperationPacked24(),
		    new BulkOperationPacked(25),
		    new BulkOperationPacked(26),
		    new BulkOperationPacked(27),
		    new BulkOperationPacked(28),
		    new BulkOperationPacked(29),
		    new BulkOperationPacked(30),
		    new BulkOperationPacked(31),
		    new BulkOperationPacked(32),
		    new BulkOperationPacked(33),
		    new BulkOperationPacked(34),
		    new BulkOperationPacked(35),
		    new BulkOperationPacked(36),
		    new BulkOperationPacked(37),
		    new BulkOperationPacked(38),
		    new BulkOperationPacked(39),
		    new BulkOperationPacked(40),
		    new BulkOperationPacked(41),
		    new BulkOperationPacked(42),
		    new BulkOperationPacked(43),
		    new BulkOperationPacked(44),
		    new BulkOperationPacked(45),
		    new BulkOperationPacked(46),
		    new BulkOperationPacked(47),
		    new BulkOperationPacked(48),
		    new BulkOperationPacked(49),
		    new BulkOperationPacked(50),
		    new BulkOperationPacked(51),
		    new BulkOperationPacked(52),
		    new BulkOperationPacked(53),
		    new BulkOperationPacked(54),
		    new BulkOperationPacked(55),
		    new BulkOperationPacked(56),
		    new BulkOperationPacked(57),
		    new BulkOperationPacked(58),
		    new BulkOperationPacked(59),
		    new BulkOperationPacked(60),
		    new BulkOperationPacked(61),
		    new BulkOperationPacked(62),
		    new BulkOperationPacked(63),
		    new BulkOperationPacked(64),
	  );
	  
  BulkOperation.packedSingleBlockBulkOps = new Array(
	    new BulkOperationPackedSingleBlock(1),
	    new BulkOperationPackedSingleBlock(2),
	    new BulkOperationPackedSingleBlock(3),
	    new BulkOperationPackedSingleBlock(4),
	    new BulkOperationPackedSingleBlock(5),
	    new BulkOperationPackedSingleBlock(6),
	    new BulkOperationPackedSingleBlock(7),
	    new BulkOperationPackedSingleBlock(8),
	    new BulkOperationPackedSingleBlock(9),
	    new BulkOperationPackedSingleBlock(10),
	    null,
	    new BulkOperationPackedSingleBlock(12),
	    null,
	    null,
	    null,
	    new BulkOperationPackedSingleBlock(16),
	    null,
	    null,
	    null,
	    null,
	    new BulkOperationPackedSingleBlock(21),
	    null,
	    null,
	    null,
	    null,
	    null,
	    null,
	    null,
	    null,
	    null,
	    null,
	    new BulkOperationPackedSingleBlock(32),
  ); 	  
}

module.exports = exports = BulkOperation;