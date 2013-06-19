#!/usr/bin/env node
process.chdir("../../");
console.log("switching to directory " + process.cwd());

var fs = require('fs');
var ReadableStream = require('stream').Readable;
var CodecUtil = require('library/lucene/codecs/CodecUtil.js').CodecUtil;


var workspace = "./workspace";
var index_dir = workspace + "/index";
var util = require('util');

var segmentinfo_file = index_dir + "/_0.si";

fs.exists(segmentinfo_file, function(exists){
	console.log("file ", exists ? "exist " : "do not exist");
	if(exists){
		var stat = fs.statSync(segmentinfo_file);
		//console.log(util.inspect(stat));
	}
});

//handle stream 
var instream = fs.createReadStream(segmentinfo_file); //fs.ReadStream 



//file stream
instream.on('open', function(fd){
	console.log("file opened for reading with fd " + fd);
})

//low level stream events
instream.on('end',function(){
	console.log("reaching EOF");
});
instream.on('error', function(err){
	console.log("ERROR:" + util.inspect(err));
});
instream.on('readable', function(){
	console.log(segmentinfo_file + " become readable");	
	read_func();
});



/* var IsBigEndian = false; */
var hasStartedRead = false;
var read_func = function(){
	if(hasStartedRead) return; //avoid reentrant
	else hasStartedRead = true;

	//a buffer to hold 32bit/4 bytes integer
	var buf = instream.read(4);
	if(!buf) console.log("READ FAILED");
	var val1 = buf.readUInt32BE(0);
	var val2 = buf.readUInt32LE(0);
	if(val1 == CodecUtil.CODEC_MAGIC)
		console.log("matching header tag with Big Endian Encoding");
	else if(val2 == CodecUtil.CODEC_MAGIC)
		console.log("matching header tag with Little Endian Encoding");
	else
		console.log("ERROR reading header tag magic number");
		
	
	//then a string of segment info's codecs 
	var expectedCodec = "Lucene40SegmentInfo";
	console.log("expecting codec length " + expectedCodec.length);
	buf = instream.read(expectedCodec.length); //TODO: a weird thing that a first char is always empty space
	if(!buf) console.log("READ FAILED");
	
	var seenCodec = buf.toString().trim();
	console.log("READING CODEC " + seenCodec + " of length " + seenCodec.length);
	
	if(expectedCodec == seenCodec)
		console.log("CODECS MATCHED");
	
	
	//then another 32bit/4 bytes version number
	buf = instream.read(4);
	var versionNum = buf.readUInt32BE(0);
	console.log("Version Number is " + versionNum);
	
	
	
	//segment version of format x.y   (index/SegmentInfo)
	var segmentVersion = " x.y";
	buf = instream.read(segmentVersion.length);
	console.log("reading segment version [" + buf.toString() + "]");
	
	
	//segment size int32
	buf = instream.read(4);
	var val = buf.readUInt32BE(0);
	console.log("reading segment size " + val);	
	
	//is CompoundFile int8
	buf = instream.read(1);
	val =buf.readInt8(0);
	console.log("compound file: " + (val > 0 ? "YES" : "NO"));
	
	
	//diagnostic map 
	//REFERENCE  org.apache.lucene.DataOutput
	//  Writes strings as UTF-8 encoded bytes. First the length, in bytes, is written as a {@link #writeVInt VInt}, followed by the bytes.
	//size int32 followed by a number of key-val pairs 
	var size = instream.read(4).readUInt32BE(0);
	console.log("diagnositc map size is " + size);
	
	//each pair is a [vint] [key] [val]
	
	
	
	
	//attribute map 
	//size int32 followed by a number of key-val pairs
/*
	var size = instream.read(4).readUInt32BE(0);
	console.log("attribute map size is " + size);	
*/
	
}





