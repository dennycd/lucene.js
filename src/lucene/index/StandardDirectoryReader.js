var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var DirectoryReader = require('./DirectoryReader.js');
var SegmentInfos = require('./SegmentInfos.js');
var SegmentReader = require('./SegmentReader.js');
var ArrayList = require('library/java/util/ArrayList.js');
var HashMap = require('library/java/util/HashMap.js');
var IOContext = require('library/lucene/store/IOContext.js');
var IOUtils = require('library/lucene/util/IOUtils.js');
var StringBuilder = require('library/lucene/util/StringBuilder.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var IOException = require('library/lucene/util/IOException.js');
var Collections = require('library/java/util/Collections.js');
var IndexCommit = require('./IndexCommit.js');

var StandardDirectoryReader = defineClass({
	name: "StandardDirectoryReader",
	extend: DirectoryReader,
	variables: {
		writer: null,
		//IndexWriter
		segmentInfos: null,
		//SegmentInfos
		termInfosIndexDivisor: 0,
		//int
		applyAllDeletes: false //boolean
	},
	construct: function( /* Directory */ directory, /* AtomicReader[] */ readers, /* IndexWriter */ writer, /* SegmentInfos */ sis, /* int */ termInfosIndexDivisor, /* boolean */ applyAllDeletes) {
		DirectoryReader.call(this, directory, readers);
		this.writer = writer;
		this.segmentInfos = sis;
		this.termInfosIndexDivisor = termInfosIndexDivisor;
		this.applyAllDeletes = applyAllDeletes;
	},
	statics: { 
	
	
		/** called from DirectoryReader.open(...) methods */
		openWithDirectoryCommit: function( /* Directory */ directory, /* IndexCommit */ commit, /* int */ termInfosIndexDivisor) {
			console.log("StandardDirectoryReader::openWithDirectoryCommit");
			
			//parse and load segmentInfos describing the entire index (segments_N)
			var fsf = new SegmentInfos.FindSegmentsFile(directory);
			
			
			//invokec for each sub index (segment)   
			fsf.doBody = function(segmentFileName) {
				console.log("StandardDirectoryReader::openWithDirectoryCommit::doBody ");
				var sis = new SegmentInfos();
				
				sis.readWithDirectorySegmentFileName(directory, segmentFileName);
				
				
				//create a SegmentReader for each listed SegmentInfo obj respectively
				var readers = new Array(sis.size());
				
				for (var i = sis.size() - 1; i >= 0; i--) {
					var prior = null; //IOException
					var success = false;
					try {
						debugger;
						readers[i] = new SegmentReader(sis.info(i), termInfosIndexDivisor, IOContext.READ);
						success = true;
					} catch ( /* IOException */ ex) {
						prior = ex;
					} finally {
						if (!success) IOUtils.closeWhileHandlingException(prior, readers);
					}
				}
				return new StandardDirectoryReader(directory, readers, null, sis, termInfosIndexDivisor, false);
			};
			
			return fsf.run(commit);
			
			
		},
		/** Used by near real-time search */
		openWithIndexWriter: function( /* IndexWriter */ writer, /* SegmentInfos */ infos, /* boolean */ applyAllDeletes) {
			// IndexWriter synchronizes externally before calling
			// us, which ensures infos will not change; so there's
			// no need to process segments in reverse order
			var numSegments = infos.size();
			var readers = new ArrayList(); //List<SegmentReader> readers = 
			var dir = writer.getDirectory();
			var segmentInfos = infos.clone();
			var infosUpto = 0;
			for (var i = 0; i < numSegments; i++) {
				var prior = null; //IOException
				var success = false;
				try {
					var info = infos.info(i); //SegmentInfoPerCommit
					assert(info.info.dir == dir);
					var rld = writer.readerPool.get(info, true); //ReadersAndLiveDocs
					try {
						var reader = rld.getReadOnlyClone(IOContext.READ);
						if (reader.numDocs() > 0 || writer.getKeepFullyDeletedSegments()) {
							// Steal the ref:
							readers.add(reader);
							infosUpto++;
						} else {
							reader.close();
							segmentInfos.remove(infosUpto);
						}
					} finally {
						writer.readerPool.release(rld);
					}
					success = true;
				} catch ( /* IOException */ ex) {
					prior = ex;
				} finally {
					if (!success) {
						IOUtils.closeWhileHandlingException(prior, readers);
					}
				}
			}
			return new StandardDirectoryReader(dir, readers.toArray(new Array(readers.size())), /* new SegmentReader[readers.size()] */
			writer, segmentInfos, writer.getConfig().getReaderTermsIndexDivisor(), applyAllDeletes);
		},
		/** This constructor is only used for {@link #doOpenIfChanged(SegmentInfos, IndexWriter)} */
		openWithDirectoryWriterInfos: function( /* Directory */ directory, /*  IndexWriter */ writer, /* SegmentInfos */ infos, 
											/* List<? extends AtomicReader> */ oldReaders, /* int */ termInfosIndexDivisor) {
			// we put the old SegmentReaders in a map, that allows us
			// to lookup a reader using its segment name
			var segmentReaders = new HashMap(); //final Map<String,Integer> 
			if (oldReaders != null) {
				// create a Map SegmentName->SegmentReader
				for (var i = 0, c = oldReaders.size(); i < c; i++) {
					var sr = oldReaders.get(i); //SegmentReader
					segmentReaders.put(sr.getSegmentName(), i);
				}
			}
			var newReaders = new Array(infos.size()); //SegmentReader[];
			// remember which readers are shared between the old and the re-opened
			// DirectoryReader - we have to incRef those readers
			var readerShared = new Array(infos.size()); //boolean[infos.size()];
			for (var i = infos.size() - 1; i >= 0; i--) {
				// find SegmentReader for this segment
				var oldReaderIndex = segmentReaders.get(infos.info(i).info.name);
				if (oldReaderIndex == null) {
					// this is a new segment, no old SegmentReader can be reused
					newReaders[i] = null;
				} else {
					// there is an old reader for this segment - we'll try to reopen it
					newReaders[i] = oldReaders.get(oldReaderIndex.intValue());
				}
				var success = false;
				var prior = null; //Throwable
				try {
					var newReader; //SegmentReader
					if (newReaders[i] == null || infos.info(i).info.getUseCompoundFile() != newReaders[i].getSegmentInfo().info.getUseCompoundFile()) {
						// this is a new reader; in case we hit an exception we can close it safely
						newReader = new SegmentReader(infos.info(i), termInfosIndexDivisor, IOContext.READ);
						readerShared[i] = false;
						newReaders[i] = newReader;
					} else {
						if (newReaders[i].getSegmentInfo().getDelGen() == infos.info(i).getDelGen()) {
							// No change; this reader will be shared between
							// the old and the new one, so we must incRef
							// it:
							readerShared[i] = true;
							newReaders[i].incRef();
						} else {
							readerShared[i] = false;
							// Steal the ref returned by SegmentReader ctor:
							assert(infos.info(i).info.dir == newReaders[i].getSegmentInfo().info.dir);
							assert(infos.info(i).hasDeletions());
							newReaders[i] = new SegmentReader(infos.info(i), newReaders[i].core, IOContext.READ);
						}
					}
					success = true;
				} catch ( /* Throwable */ ex) {
					prior = ex;
				} finally {
					if (!success) {
						for (i++; i < infos.size(); i++) {
							if (newReaders[i] != null) {
								try {
									if (!readerShared[i]) {
										// this is a new subReader that is not used by the old one,
										// we can close it
										newReaders[i].close();
									} else {
										// this subReader is also used by the old reader, so instead
										// closing we must decRef it
										newReaders[i].decRef();
									}
								} catch ( /* Throwable */ t) {
									if (prior == null) prior = t;
								}
							}
						}
					}
					// throw the first exception
					if (prior != null) {
						throw prior;
/*
          if (prior instanceof IOException) throw (IOException) prior;
          if (prior instanceof RuntimeException) throw (RuntimeException) prior;
          if (prior instanceof Error) throw (Error) prior;
          throw new RuntimeException(prior);
*/
					}
				}
			}
			return new StandardDirectoryReader(directory, newReaders, writer, infos, termInfosIndexDivisor, false);
		},
	},
	methods: {
		//@Override
		toString: function() {
			var buffer = new StringBuilder();
			buffer.append(this.getClass().getSimpleName());
			buffer.append('(');
			var segmentsFile = segmentInfos.getSegmentsFileName();
			if (segmentsFile != null) {
				buffer.append(segmentsFile).append(":").append(segmentInfos.getVersion());
			}
			if (writer != null) {
				buffer.append(":nrt");
			}
			for ( /* AtomicReader */
			var r in getSequentialSubReaders()) {
				buffer.append(' ');
				buffer.append(r);
			}
			buffer.append(')');
			return buffer.toString();
		},
		
		doOpenIfChangedWithInfosWriter : function(/* SegmentInfos */ infos, /* IndexWriter */ writer)  {
			return StandardDirectoryReader.openWithDirectoryWriterInfos(this.directory, writer, infos, this.getSequentialSubReaders(), this.termInfosIndexDivisor);
		}, 
  
		//@Override
		doOpenIfChanged: function() {
			return this.doOpenIfChangedWithCommit(null);
		},
		//@Override
		doOpenIfChangedWithCommit: function( /* IndexCommit */ commit) {
			this.ensureOpen();
			// If we were obtained by writer.getReader(), re-ask the
			// writer to get a new reader.
			if (this.writer != null) {
				return this.doOpenFromWriter(commit);
			} else {
				return this.doOpenNoWriter(commit);
			}
		},
		// @Override
		doOpenIfChangedWithWriter: function( /* IndexWriter */ writer, /* boolean */ applyAllDeletes) {
			this.ensureOpen();
			if (writer === this.writer && applyAllDeletes == this.applyAllDeletes) {
				return this.doOpenFromWriter(null);
			} else {
				return writer.getReader(applyAllDeletes);
			}
		},
		doOpenFromWriter: function( /* IndexCommit */ commit) {
			if (commit != null) {
				throw new IllegalArgumentException("a reader obtained from IndexWriter.getReader() cannot currently accept a commit");
			}
			if (this.writer.nrtIsCurrent(this.segmentInfos)) {
				return null;
			}
			var reader = writer.getReader(this.applyAllDeletes);
			// If in fact no changes took place, return null:
			if (reader.getVersion() == this.segmentInfos.getVersion()) {
				reader.decRef();
				return null;
			}
			return reader;
		},
		doOpenNoWriter: function( /* IndexCommit */ commit) {
			var self = this;
			if (commit == null) {
				if (this.isCurrent()) {
					return null;
				}
			} else {
				if (this.directory != commit.getDirectory()) {
					throw new IOException("the specified commit does not match the specified Directory");
				}
				if (this.segmentInfos != null && commit.getSegmentsFileName().equals(this.segmentInfos.getSegmentsFileName())) {
					return null;
				}
			}
			var fsf = new SegmentInfos.FindSegmentsFile(this.directory);
			fsf.doBody = function(segmentFileName) {
				var infos = new SegmentInfos();
				infos.read(self.directory, segmentFileName);
				return self.doOpenIfChanged(infos, null);
			};
			return fsf.run(commit);
		},
		
		//@Override
		getVersion : function() {
			this.ensureOpen();
			return this.segmentInfos.getVersion();
		},

		//@Override
		isCurrent : function(){
			this.ensureOpen();
			if (this.writer == null || this.writer.isClosed()) {
			  // Fully read the segments file: this ensures that it's
			  // completely written so that if
			  // IndexWriter.prepareCommit has been called (but not
			  // yet commit), then the reader will still see itself as
			  // current:
			  var sis = new SegmentInfos();
			  sis.read(this.directory);
			
			  // we loaded SegmentInfos from the directory
			  return sis.getVersion() == this.segmentInfos.getVersion();
			} else {
			  return this.writer.nrtIsCurrent(this.segmentInfos);
			}
		},
		
		//@Override
		doClose : function(){
			var firstExc = null; //Throwable
			for (/* AtomicReader */var r in this.getSequentialSubReaders()) {
			  // try to close each reader, even if an exception is thrown
			  try {
			    r.decRef();
			  } catch (/* Throwable */ t) {
			    if (firstExc == null) firstExc = t;
			  }
			}
			
			if (this.writer != null) {
			  // Since we just closed, writer may now be able to
			  // delete unused files:
			  this.writer.deletePendingFiles();
			}
			
			// throw the first exception
			if (firstExc != null) {
/*
			  if (firstExc instanceof IOException) throw (IOException) firstExc;
			  if (firstExc instanceof RuntimeException) throw (RuntimeException) firstExc;
			  if (firstExc instanceof Error) throw (Error) firstExc;
			  throw new RuntimeException(firstExc);
*/
				throw firstExc;
			}
		}, 
		
		//@Override
		getIndexCommit : function()  {
			this.ensureOpen();
			return new ReaderCommit(this.segmentInfos, this.directory);
		}		
				
	}
});


var ReaderCommit = defineClass({
	name : "ReaderCommit",
	extend : IndexCommit, 
	variables : {
	
		segmentsFileName : null, //String
	    files : null,    //Collection<String> 
	    dir : null, //Directory 
	    generation : -1, // long
	    userData : null, //Map<String,String>
	    segmentCount : 0, //int
		
	},
	
	construct : function(/* SegmentInfos */ infos, /* Directory */ dir){
		
      this.segmentsFileName = infos.getSegmentsFileName();
      this.dir = dir;
      this.userData = infos.getUserData();
      this.files = Collections.unmodifiableCollection(infos.files(dir, true));
      this.generation = infos.getGeneration();
      this.segmentCount = infos.size();
      		
	},
	
	methods : {

	    //@Override
	     toString : function() {
	      return "DirectoryReader.ReaderCommit(" + this.segmentsFileName + ")";
	    },
	
	    //@Override
	    getSegmentCount : function() {
	      return this.segmentCount;
	    },
	
	    //@Override
	    getSegmentsFileName : function() {
	      return this.segmentsFileName;
	    },
	
	    //@Override
	    getFileNames : function() {
	      return this.files;
	    },
	
	    //@Override
	    getDirectory : function() {
	      return this.dir;
	    },
	
	    //@Override
	    getGeneration : function() {
	      return this.generation;
	    },
	
	    //@Override
	    isDeleted : function() {
	      return false;
	    },
	
	    //@Override
	    getUserData : function() {
	      return this.userData;
	    },
	
/*
	    //@Override
	    public void delete() {
	      throw new UnsupportedOperationException("This IndexCommit does not support deletions");
	    }
*/
    
		
	}
});

  
StandardDirectoryReader.ReaderCommit = ReaderCommit;
module.exports = exports = StandardDirectoryReader;