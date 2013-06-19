var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var Collections = require('library/java/util/Collections.js');
var ArrayList = require('library/java/util/ArrayList.js');
var Character = require('library/java/lang/Character.js');
var IndexFileNames = require('library/lucene/index/IndexFileNames.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var IOContext = require('library/lucene/store/IOContext.js');
var CodecUtil = require('library/lucene/codecs/CodecUtil.js');
var CorruptIndexException = require('./CorruptIndexException.js');
var SegmentInfoPerCommit = require('./SegmentInfoPerCommit.js');
var HashSet = require('library/lucene/util/HashSet.js');
var ChecksumIndexOutput = require('library/lucene/store/ChecksumIndexOutput.js');
var StringHelper = require('library/lucene/util/StringHelper.js');
var Lucene3xSegmentInfoFormat = require('library/lucene/codecs/lucene3x/Lucene3xSegmentInfoFormat.js');
var SegmentInfo = require('./SegmentInfo.js');
var HashMap = require('library/java/util/HashMap.js');
var RuntimeException = require('library/lucene/util/RuntimeException.js');
var Thread = require('library/thread').Thread;
var IOException = require('library/lucene/util/IOException.js');
var IndexFormatTooNewException = require('./IndexFormatTooNewException.js');
var IndexNotFoundException = require('./IndexNotFoundException.js');
var Arrays = require('library/java/util/Arrays.js');
var IllegalStateException = require('library/lucene/util/IllegalStateException.js');
var StringBuilder = require('library/lucene/util/StringBuilder.js');
var MergePolicy = require('./MergePolicy.js');
var ChecksumIndexInput = require('library/lucene/store/ChecksumIndexInput.js');
var IOUtils = require('library/lucene/util/IOUtils.js');
var clc = require('cli-color');
var Codec = require('library/lucene/codecs/Codec.js');

/**
 * A collection of segmentInfo objects with methods for operating on
 * those segments in relation to the file system.
 **/
var SegmentInfos = defineClass({
	name: "SegmentInfos",
	//statics 
	/** Sole constructor. Typically you call this and then
	 *  use {@link #read(Directory) or
	 *  #read(Directory,String)} to populate each {@link
	 *  SegmentInfoPerCommit}.  Alternatively, you can add/remove your
	 *  own {@link SegmentInfoPerCommit}s. */
	construct: function() {},
	variables: { 
		counter: null,  //NameCounter is used to generate names for new segment files. //int  
		
		version: null,//counts how often the index has been changed by adding or deleting documents. //long
		// longDesc
		generation: null,
		// generation of the "segments_N" for the next commit
		lastGeneration: null,
		// generation of the "segments_N" file we last successfully read
		// or wrote; this is normally the same as generation except if
		// there was an IOException that had interrupted a commit
		/** Opaque Map&lt;String, String&gt; that user can specify during IndexWriter.commit */
		userData: null, //Collections.emptyMap(),
		//public Map<String,String> 
		segments: [],  //new ArrayList(),
		//List<SegmentInfoPerCommit> 
		// Only non-null after prepareCommit has been called and
		// before finishCommit is called
		pendingSegnOutput: null,
		//ChecksumIndexOutput
	},
	statics: {
		/**
		 * The file format version for the segments_N codec header
		 */
		VERSION_40: 0,
		/** Used for the segments.gen file only!
		 * Whenever you add a new format, make it 1 smaller (negative version logic)! */
		FORMAT_SEGMENTS_GEN_CURRENT: -2,
		/**
		 * If non-null, information about loading segments_N files
		 * will be printed here.  @see #setInfoStream.
		 */
		infoStream: null,
		//PrintStream
		SEGMENT_INFO_UPGRADE_CODEC: "SegmentInfo3xUpgrade",
		SEGMENT_INFO_UPGRADE_VERSION: 0,
/* Advanced configuration of retry logic in loading
     segments_N file */
		defaultGenLookaheadCount: 10,
		/**
		 * Parse the generation off the segments file name and
		 * return it.
		 */
		generationFromSegmentsFileName: function( /* String */ fileName) {
			if (fileName == IndexFileNames.SEGMENTS) {
				return 0;
			} else if (fileName.indexOf(IndexFileNames.SEGMENTS) == 0) {
				var sub = fileName.substr(1 + IndexFileNames.SEGMENTS.length);
				var g = parseInt(sub, Character.MAX_RADIX);
				return g;
			} else {
				throw new IllegalArgumentException("fileName \"" + fileName + "\" is not a segments file");
			}
		},
		/**
		 * Get the generation of the most recent commit to the
		 * list of index files (N in the segments_N file).
		 *
		 * @param files -- array of file names to check
		 */
		getLastCommitGenerationWithFiles: function( /* String[] */ files) {
			if (files == null) {
				return -1;
			}
			var max = -1;
			
			for(var i=0;i<files.length;i++){
				var file = files[i];
				if (file.indexOf(IndexFileNames.SEGMENTS) == 0 && file != IndexFileNames.SEGMENTS_GEN) {
					var gen = SegmentInfos.generationFromSegmentsFileName(file);
					if (gen > max) {
						max = gen;
					}
				}				
			}


			return max;
		},
		/**
		 * Get the generation of the most recent commit to the
		 * index in this directory (N in the segments_N file).
		 *
		 * @param directory -- directory to search for the latest segments_N file
		 */
		getLastCommitGenerationWithDirectory: function( /* Directory */ directory) {
			try {
				return SegmentInfos.getLastCommitGenerationWithFiles(directory.listAll());
			} catch ( /* NoSuchDirectoryException */ nsde) {
				return -1;
			}
		},
		/**
		 * Get the filename of the segments_N file for the most
		 * recent commit in the list of index files.
		 *
		 * @param files -- array of file names to check
		 */
		getLastCommitSegmentsFileNameWithFiles: function( /* String[] */ files) {
			return IndexFileNames.fileNameFromGeneration(IndexFileNames.SEGMENTS, "", SegmentInfos.getLastCommitGenerationWithFiles(files));
		},
		/**
		 * Get the filename of the segments_N file for the most
		 * recent commit to the index in this Directory.
		 *
		 * @param directory -- directory to search for the latest segments_N file
		 */
		getLastCommitSegmentsFileNameWithDirectory: function( /* Directory */ directory) {
			return IndexFileNames.fileNameFromGeneration(IndexFileNames.SEGMENTS, "", SegmentInfos.getLastCommitGenerationWithDirectory(directory));
		},
		segmentWasUpgraded: function( /* Directory */ directory, /* SegmentInfo */ si) {
			// Check marker file:
			var markerFileName = IndexFileNames.segmentFileName(si.name, "upgraded", Lucene3xSegmentInfoFormat.UPGRADED_SI_EXTENSION);
			var _in = null; //IndexInput
			try {
				_in = directory.openInput(markerFileName, IOContext.READONCE);
				if (CodecUtil.checkHeader(_in, SegmentInfos.SEGMENT_INFO_UPGRADE_CODEC, SegmentInfos / SEGMENT_INFO_UPGRADE_VERSION, SegmentInfos.SEGMENT_INFO_UPGRADE_VERSION) == 0) {
					return true;
				}
			} catch ( /* IOException */ ioe) {
				// Ignore: if something is wrong w/ the marker file,
				// we will just upgrade again
			} finally {
				if (_in != null) {
					IOUtils.closeWhileHandlingException(_in);
				}
			}
			return false;
		},
		//@Deprecated
		write3xInfo: function( /* Directory */ dir, /* SegmentInfo */ si, /* IOContext */ context) {
			// NOTE: this is NOT how 3.x is really written...
			var fileName = IndexFileNames.segmentFileName(si.name, "", Lucene3xSegmentInfoFormat.UPGRADED_SI_EXTENSION);
			si.addFile(fileName);
			//System.out.println("UPGRADE write " + fileName);
			var success = false;
			var output = dir.createOutput(fileName, context); //IndexOutPut
			try {
				// we are about to write this SI in 3.x format, dropping all codec information, etc.
				// so it had better be a 3.x segment or you will get very confusing errors later.
				assert(Class.isInstanceOfClass(si.getCodec(), "Lucene3xCodec"), "broken test, trying to mix preflex with other codecs");
				CodecUtil.writeHeader(output, Lucene3xSegmentInfoFormat.UPGRADED_SI_CODEC_NAME, Lucene3xSegmentInfoFormat.UPGRADED_SI_VERSION_CURRENT);
				// Write the Lucene version that created this segment, since 3.1
				output.writeString(si.getVersion());
				output.writeInt(si.getDocCount());
				output.writeStringStringMap(si.attributes());
				output.writeByte((si.getUseCompoundFile() ? SegmentInfo.YES : SegmentInfo.NO));
				output.writeStringStringMap(si.getDiagnostics());
				output.writeStringSet(si.files());
				output.close();
				success = true;
			} finally {
				if (!success) {
					IOUtils.closeWhileHandlingException(output);
					try {
						si.dir.deleteFile(fileName);
					} catch ( /* Throwable */ t) {
						// Suppress so we keep throwing the original exception
					}
				}
			}
			return fileName;
		},
		/** If non-null, information about retries when loading
		 * the segments file will be printed to this.
		 */
		setInfoStream: function( /* PrintStream */ infoStream) {
			SegmentInfos.infoStream = infoStream;
		},
		/**
		 * Advanced: set how many times to try incrementing the
		 * gen when loading the segments file.  This only runs if
		 * the primary (listing directory) and secondary (opening
		 * segments.gen file) methods fail to find the segments
		 * file.
		 *
		 * @lucene.experimental
		 */
		setDefaultGenLookaheadCount: function( /* int */ count) {
			SegmentInfos.defaultGenLookaheadCount = count;
		},
		/**
		 * Returns the {@code defaultGenLookaheadCount}.
		 *
		 * @see #setDefaultGenLookaheadCount
		 *
		 * @lucene.experimental
		 */
		getDefaultGenLookahedCount: function() {
			return SegmentInfos.defaultGenLookaheadCount;
		},
		/**
		 * Returns {@code infoStream}.
		 *
		 * @see #setInfoStream
		 */
		getInfoStream: function() {
			return SegmentInfos.infoStream;
		},
		/**
		 * Prints the given message to the infoStream. Note, this method does not
		 * check for null infoStream. It assumes this check has been performed by the
		 * caller, which is recommended to avoid the (usually) expensive message
		 * creation.
		 */
		message: function( /* String */ message) {
			SegmentInfos.infoStream.println("SIS [" + Thread.currentThread().getName() + "]: " + message);
		}
	},

	methods: {
/*  Returns {@link SegmentInfoPerCommit} at the provided index. 
			  @return SegmentInfoPerCommit
		    */
		info: function( /* int */ i) {
			return this.segments[i];
		},
		/**
		 * Get the segments_N filename in use by this segment infos.
		 */
		getSegmentsFileName: function() {
			return IndexFileNames.fileNameFromGeneration(IndexFileNames.SEGMENTS, "", this.lastGeneration);
		},
		/**
		 * Get the next segments_N filename that will be written.
		 */
		getNextSegmentFileName: function() {
			var nextGeneration;
			if (this.generation == -1) {
				nextGeneration = 1;
			} else {
				nextGeneration = generation + 1;
			}
			return IndexFileNames.fileNameFromGeneration(IndexFileNames.SEGMENTS, "", nextGeneration);
		},
		/**
		 * Read a particular segmentFileName.  Note that this may
		 * throw an IOException if a commit is in process.
		 *
		 * @param directory -- directory containing the segments file
		 * @param segmentFileName -- segment file to load
		 * @throws CorruptIndexException if the index is corrupt
		 * @throws IOException if there is a low-level IO error
		 */
		readWithDirectorySegmentFileName: function( /* Directory */ directory, /* String */ segmentFileName) {
			console.log("SegmentInfos::readWithDirectorySegmentFileName segmentFileName="+segmentFileName);
			var success = false;
			
			// Clear any previous segments:
			this.clear();
			this.generation = SegmentInfos.generationFromSegmentsFileName(segmentFileName);
			this.lastGeneration = this.generation; 
			
			//reading the lastest generation segment info file !!!   segments_N 
			var input = new ChecksumIndexInput(directory.openInput(segmentFileName, IOContext.READ));
			
			try {
			
				var format = input.readInt();  console.log("format="+format);
				if (format == CodecUtil.CODEC_MAGIC) {
					console.log("4.0+ format");
					// 4.0+
					
					CodecUtil.checkHeaderNoMagic(input, "segments", this.VERSION_40, this.VERSION_40);

					this.version = input.readLong(); console.log("version="+this.version);
					this.counter = input.readInt(); console.log("counter="+this.counter); 
					var numSegments = input.readInt(); console.log("numSegments="+numSegments);  //number of segments (sub index) in this index
					if (numSegments < 0) {
						throw new CorruptIndexException("invalid segment count: " + numSegments + " (resource: " + input + ")");
					}
					
					//load each segment's infos file   _0.si
					for (var seg = 0; seg < numSegments; seg++) {
					
						//is the name of the segment, and is used as the file name prefix for all of the files that compose the segment's index. e.g. _0
						var segName = input.readString();  console.log("segName="+segName);
						//is the name of the Codec that encoded this segment.  e.g. Lucene42
						var codecName = input.readString();  console.log("codecName="+codecName);
						
						//returned a codecs utility instance for the corresponding codec of this segment 
						var codec = Codec.forName(codecName);
						
						
						//obtain a segmentInfo object
						var info = codec.segmentInfoFormat().getSegmentInfoReader().read(directory, segName, IOContext.READ);
						info.setCodec(codec);						
						
						var delGen = input.readLong(); console.log("delGen="+delGen);
						var delCount = input.readInt(); console.log("delCount="+delCount);
						
						
						if (delCount < 0 || delCount > info.getDocCount()) {
							throw new CorruptIndexException("invalid deletion count: " + delCount + " (resource: " + input + ")");
						}
						
						
						this.add(new SegmentInfoPerCommit(info, delCount, delGen));
					}
					
					userData = input.readStringStringMap(); //console.log("userData="+util.inspect(userData));

					
				} else {
					Lucene3xSegmentInfoReader.readLegacyInfos(this, directory, input, format);
					var codec = Codec.forName("Lucene3x");
					for ( /* SegmentInfoPerCommit */
					var info in this) {
						info.info.setCodec(codec);
					}
				}
				
				var checksumNow = input.getChecksum(); console.log("checksumNow="+checksumNow);
				var checksumThen = input.readLong();  console.log("checksumThen="+checksumThen);
				if (checksumNow != checksumThen) {
					throw new CorruptIndexException("checksum mismatch in segments file (resource: " + input + ")");
				}
				
				success = true;
			}
			catch(e){
				console.log(clc.red(e.toString()));
			}
			 finally {
				if (!success) {
					// Clear any segment infos we had loaded so we
					// have a clean slate on retry:
					this.clear();
					IOUtils.closeWhileHandlingException(input);
				} else {
					input.close();
				}
			}
		},
		
		
		/** Find the latest commit ({@code segments_N file}) and
		 *  load all {@link SegmentInfoPerCommit}s. */
		readWithDirectory: function( /* Directory */ directory) {
			var self = this;
			this.generation = this.lastGeneration = -1;
			var fsf = new FindSegmentsFile(directory);
			fsf.doBody = function(segmentFileName) {
				self.read(directory, segmentFileName);
				return null;
			};
			fsf.run();
		},
		write: function( /* Directory */ directory) {
			var segmentsFileName = this.getNextSegmentFileName();
			// Always advance the generation on write:
			if (this.generation == -1) {
				this.generation = 1;
			} else {
				this.generation++;
			}
			var segnOutput = null; /* ChecksumIndexOutput */
			var success = false;
			var upgradedSIFiles = new HashSet();
			try {
				segnOutput = new ChecksumIndexOutput(directory.createOutput(segmentsFileName, IOContext.DEFAULT));
				CodecUtil.writeHeader(segnOutput, "segments", SegmentInfos.VERSION_40);
				segnOutput.writeLong(version);
				segnOutput.writeInt(counter); // write counter
				segnOutput.writeInt(size()); // write infos
				for ( /* SegmentInfoPerCommit */
				var siPerCommit in this) { /* SegmentInfo */
					var si = siPerCommit.info;
					segnOutput.writeString(si.name);
					segnOutput.writeString(si.getCodec().getName());
					segnOutput.writeLong(siPerCommit.getDelGen());
					segnOutput.writeInt(siPerCommit.getDelCount());
					assert(si.dir == directory);
					assert(siPerCommit.getDelCount() <= si.getDocCount());
					// If this segment is pre-4.x, perform a one-time
					// "ugprade" to write the .si file for it:
					var version = si.getVersion();
					if (version == null || StringHelper.getVersionComparator().compare(version, "4.0") < 0) {
						if (!this.segmentWasUpgraded(directory, si)) {
							var markerFileName = IndexFileNames.segmentFileName(si.name, "upgraded", Lucene3xSegmentInfoFormat.UPGRADED_SI_EXTENSION);
							si.addFile(markerFileName);
							var segmentFileName = this.write3xInfo(directory, si, IOContext.DEFAULT);
							upgradedSIFiles.add(segmentFileName);
							directory.sync(Collections.singletonList(segmentFileName));
							// Write separate marker file indicating upgrade
							// is completed.  This way, if there is a JVM
							// kill/crash, OS crash, power loss, etc. while
							// writing the upgraded file, the marker file
							// will be missing:
							si.addFile(markerFileName);
							var out = directory.createOutput(markerFileName, IOContext.DEFAULT); //IndexOut
							try {
								CodecUtil.writeHeader(out, SegmentInfos.SEGMENT_INFO_UPGRADE_CODEC, SegmentInfos.SEGMENT_INFO_UPGRADE_VERSION);
							} finally {
								out.close();
							}
							upgradedSIFiles.add(markerFileName);
							directory.sync(Collections.singletonList(markerFileName));
						}
					}
				}
				segnOutput.writeStringStringMap(userData);
				this.pendingSegnOutput = segnOutput;
				success = true;
			} finally {
				if (!success) {
					// We hit an exception above; try to close the file
					// but suppress any exception:
					IOUtils.closeWhileHandlingException(segnOutput);
					for (var fileName in upgradedSIFiles) {
						try {
							directory.deleteFile(fileName);
						} catch ( /* Throwable */ t) {
							// Suppress so we keep throwing the original exception
						}
					}
					try {
						// Try not to leave a truncated segments_N file in
						// the index:
						directory.deleteFile(segmentsFileName);
					} catch ( /* Throwable */ t) {
						// Suppress so we keep throwing the original exception
					}
				}
			} //finally
		},
		/**
		 * Returns a copy of this instance, also copying each
		 * SegmentInfo.
		 */
		//@Override
		clone: function() {
			try {
				//final SegmentInfos sis = (SegmentInfos) super.clone();
				// deep clone, first recreate all collections:
				var sis = new SegmentInfos();
				sis.segments = new ArrayList(this.size());
				for (var idx in this.segments) { ///* SegmentInfoPerCommit */
					var info = this.segments[idx];
					assert(info.info.getCodec() != null);
					// dont directly access segments, use add method!!!
					sis.add(info.clone());
				}
				sis.userData = new HashMap(this.userData);
				return sis;
			} catch ( /* CloneNotSupportedException */ e) {
				throw new RuntimeException("should not happen", e);
			}
		},
		/**
		 * version number when this SegmentInfos was generated.
		 */
		getVersion: function() {
			return this.version;
		},
		/** Returns current generation. */
		getGeneration: function() {
			return this.generation;
		},
		/** Returns last succesfully read or written generation. */
		getLastGeneration: function() {
			return this.lastGeneration;
		},
		// Carry over generation numbers from another SegmentInfos
		updateGeneration: function( /* SegmentInfos */ other) {
			this.lastGeneration = other.lastGeneration;
			this.generation = other.generation;
		},
		rollbackCommit: function( /* Directory */ dir) {
			if (this.pendingSegnOutput != null) {
				// Suppress so we keep throwing the original exception
				// in our caller
				IOUtils.closeWhileHandlingException(this.pendingSegnOutput);
				this.pendingSegnOutput = null;
				// Must carefully compute fileName from "generation"
				// since lastGeneration isn't incremented:
				var segmentFileName = IndexFileNames.fileNameFromGeneration(IndexFileNames.SEGMENTS, "", this.generation);
				// Suppress so we keep throwing the original exception
				// in our caller
				IOUtils.deleteFilesIgnoringExceptions(dir, this.segmentFileName);
			}
		},
		/** Call this to start a commit.  This writes the new
		 *  segments file, but writes an invalid checksum at the
		 *  end, so that it is not visible to readers.  Once this
		 *  is called you must call {@link #finishCommit} to complete
		 *  the commit or {@link #rollbackCommit} to abort it.
		 *  <p>
		 *  Note: {@link #changed()} should be called prior to this
		 *  method if changes have been made to this {@link SegmentInfos} instance
		 *  </p>
		 **/
		prepareCommit: function( /* Directory */ dir) {
			if (this.pendingSegnOutput != null) {
				throw new IllegalStateException("prepareCommit was already called");
			}
			this.write(dir);
		},
		/** Returns all file names referenced by SegmentInfo
		 *  instances matching the provided Directory (ie files
		 *  associated with any "external" segments are skipped).
		 *  The returned collection is recomputed on each
		 *  invocation.  */
		/* public Collection<String> */
		files: function( /* Directory */ dir, /* boolean */ includeSegmentsFile) {
			//HashSet<String> files = new HashSet<String>();
			var files = new HashSet();
			if (includeSegmentsFile) {
				var segmentFileName = this.getSegmentsFileName();
				if (segmentFileName != null) {
					/*
					 * TODO: if lastGen == -1 we get might get null here it seems wrong to
					 * add null to the files set
					 */
					files.add(segmentFileName);
				}
			}
			var size = this.size();
			for (var i = 0; i < size; i++) {
				var info = this.info(i); //SegmentInfoPerCommit
				assert(info.info.dir == dir);
				if (info.info.dir == dir) {
					files.addAll(info.files());
				}
			}
			return files;
		},
		finishCommit: function( /* Directory */ dir) {
			if (this.pendingSegnOutput == null) {
				throw new IllegalStateException("prepareCommit was not called");
			}
			var success = false;
			try {
				this.pendingSegnOutput.finishCommit();
				success = true;
			} finally {
				if (!success) {
					// Closes pendingSegnOutput & deletes partial segments_N:
					this.rollbackCommit(dir);
				} else {
					success = false;
					try {
						this.pendingSegnOutput.close();
						success = true;
					} finally {
						if (!success) {
							// Closes pendingSegnOutput & deletes partial segments_N:
							this.rollbackCommit(dir);
						} else {
							this.pendingSegnOutput = null;
						}
					}
				}
			}
			// NOTE: if we crash here, we have left a segments_N
			// file in the directory in a possibly corrupt state (if
			// some bytes made it to stable storage and others
			// didn't).  But, the segments_N file includes checksum
			// at the end, which should catch this case.  So when a
			// reader tries to read it, it will throw a
			// CorruptIndexException, which should cause the retry
			// logic in SegmentInfos to kick in and load the last
			// good (previous) segments_N-1 file.
			var fileName = IndexFileNames.fileNameFromGeneration(IndexFileNames.SEGMENTS, "", this.generation);
			success = false;
			try {
				dir.sync(Collections.singleton(fileName));
				success = true;
			} finally {
				if (!success) {
					try {
						dir.deleteFile(fileName);
					} catch ( /* Throwable */ t) {
						// Suppress so we keep throwing the original exception
					}
				}
			}
			this.lastGeneration = this.generation;
			try {
				var genOutput = dir.createOutput(IndexFileNames.SEGMENTS_GEN, IOContext.READONCE); //IndexOutput
				try {
					genOutput.writeInt(SegmentInfos.FORMAT_SEGMENTS_GEN_CURRENT);
					genOutput.writeLong(generation);
					genOutput.writeLong(generation);
				} finally {
					genOutput.close();
					dir.sync(Collections.singleton(IndexFileNames.SEGMENTS_GEN));
				}
			} catch ( /* Throwable */ t) {
				// It's OK if we fail to write this file since it's
				// used only as one of the retry fallbacks.
				try {
					dir.deleteFile(IndexFileNames.SEGMENTS_GEN);
				} catch ( /* Throwable */ t2) {
					// Ignore; this file is only used in a retry
					// fallback on init.
				}
			}
		},
		/** Writes & syncs to the Directory dir, taking care to
		 *  remove the segments file on exception
		 *  <p>
		 *  Note: {@link #changed()} should be called prior to this
		 *  method if changes have been made to this {@link SegmentInfos} instance
		 *  </p>
		 **/
		commit: function( /* Directory */ dir) {
			this.prepareCommit(dir);
			this.finishCommit(dir);
		},
		/** Returns readable description of this segment. */
		toString: function( /* Directory */ directory) {
			var buffer = new StringBuilder();
			buffer.append(this.getSegmentsFileName()).append(": ");
			var count = size();
			for (var i = 0; i < count; i++) {
				if (i > 0) {
					buffer.append(' ');
				}
				var info = this.info(i); //SegmentInfoPerCommit
				buffer.append(info.toString(directory, 0));
			}
			return buffer.toString();
		},
		/** Return {@code userData} saved with this commit.
		 *
		 * @see IndexWriter#commit()
		 */
		getUserData: function() {
			return this.userData;
		},
		setUserData: function( /* Map<String,String> */ data) {
			if (data == null) {
				this.userData = Collections.emptyMap();
			} else {
				this.userData = data;
			}
		},
		/** Replaces all segments in this instance, but keeps
		 *  generation, version, counter so that future commits
		 *  remain write once.
		 */
		replace: function( /* SegmentInfos */ other) {
			this.rollbackSegmentInfos(other.asList());
			this.lastGeneration = other.lastGeneration;
		},
		/** Returns sum of all segment's docCounts.  Note that
		 *  this does not include deletions */
		totalDocCount: function() {
			var count = 0;
			for ( /* SegmentInfoPerCommit */
			var idx in this.segments) {
				var info = this.segments[idx];
				count += info.info.getDocCount();
			}
			return count;
		},
		/** Call this before committing if changes have been made to the
		 *  segments. */
		changed: function() {
			this.version++;
		},
		/** applies all changes caused by committing a merge to this SegmentInfos */
		applyMergeChanges: function( /* MergePolicy.OneMerge */ merge, /* boolean */ dropSegment) {
			var mergedAway = new HashSet(merge.segments);
			var inserted = false;
			var newSegIdx = 0;
			for (var segIdx = 0, cnt = this.segments.size(); segIdx < cnt; segIdx++) {
				assert(segIdx >= newSegIdx);
				var info = this.segments.get(segIdx); //SegmentInfoPerCommit
				if (mergedAway.contains(info)) {
					if (!inserted && !dropSegment) {
						this.segments.set(segIdx, merge.info);
						inserted = true;
						newSegIdx++;
					}
				} else {
					this.segments.set(newSegIdx, info);
					newSegIdx++;
				}
			}
			// the rest of the segments in list are duplicates, so don't remove from map, only list!
			this.segments.subList(newSegIdx, this.segments.size()).clear();
			// Either we found place to insert segment, or, we did
			// not, but only because all segments we merged becamee
			// deleted while we are merging, in which case it should
			// be the case that the new segment is also all deleted,
			// we insert it at the beginning if it should not be dropped:
			if (!inserted && !dropSegment) {
				this.segments.add(0, merge.info);
			}
		},
		createBackupSegmentInfos: function() {
			var list = new ArrayList(this.size());
			for (var idx in this.segments) {
				var info = this.segments[i];
				assert(info.info.getCodec() != null);
				list.add(info.clone());
			}
			return list;
		},
		rollbackSegmentInfos: function( /* List<SegmentInfoPerCommit> */ infos) {
			this.clear();
			this.addAll(infos);
		},
		/** Returns an <b>unmodifiable</b> {@link Iterator} of contained segments in order. */
		// @Override (comment out until Java 6)
		//@Override
/*
  public Iterator<SegmentInfoPerCommit> iterator() {
    return asList().iterator();
  }
*/
		/** Returns all contained segments as an <b>unmodifiable</b> {@link List} view. */
		/* List<SegmentInfoPerCommit> */
		asList: function() {
			return Collections.unmodifiableList(this.segments);
		},
		/** Returns number of {@link SegmentInfoPerCommit}s. */
		size: function() {
			return this.segments.length;
		},
		/** Appends the provided {@link SegmentInfoPerCommit}. */
		add: function( /* SegmentInfoPerCommit */ si) {
			this.segments.push(si);
		},
		/** Appends the provided {@link SegmentInfoPerCommit}s. */
		addAll: function( /* Iterable<SegmentInfoPerCommit> */ sis) {
			assert(sis instanceof Array);
			this.segments.concat(sis);
		},
		/** Clear all {@link SegmentInfoPerCommit}s. */
		clear: function() {
			this.segments = []; //this.segments.clear();
		},
		/** Remove the provided {@link SegmentInfoPerCommit}.
		 *
		 * <p><b>WARNING</b>: O(N) cost */
		remove: function( /* SegmentInfoPerCommit */ si) {
			var idx = this.segments.indexOf(si);
			assert(idx!=-1);
			this.segments.splice(idx,1);
		},
		/** Remove the {@link SegmentInfoPerCommit} at the
		 * provided index.
		 *
		 * <p><b>WARNING</b>: O(N) cost */
		remove: function( /* int */ index) {
			assert(index>=0 && index < this.segments.length);
			this.segments.splice(index,1);
		},
		/** Return true if the provided {@link
		 *  SegmentInfoPerCommit} is contained.
		 *
		 * <p><b>WARNING</b>: O(N) cost */
		contains: function( /* SegmentInfoPerCommit */ si) {
			return this.segments.indexOf(si)!=-1;
		},
		/** Returns index of the provided {@link
		 *  SegmentInfoPerCommit}.
		 *
		 * <p><b>WARNING</b>: O(N) cost */
		indexOf: function( /* SegmentInfoPerCommit */ si) {
			return this.segments.indexOf(si);
		}
	} //methods
});
/**
 * Utility class for executing code that needs to do
 * something with the current segments file.  This is
 * necessary with lock-less commits because from the time
 * you locate the current segments file name, until you
 * actually open it, read its contents, or check modified
 * time, etc., it could have been deleted due to a writer
 * commit finishing.
 */
var FindSegmentsFile = defineClass({
	name: "FindSegmentsFile",
	variables: {
		directory: null,
		//Direcotry
	},
	construct: function(directory) {
		console.log("FindSegmentsFile::construct");
		assert(directory && Class.isInstanceOfClass(directory, "Directory"));
		this.directory = directory;
	},
	methods: {
		/** Locate the most recent {@code segments} file and
		 *  run {@link #doBody} on it. */
		/** Run {@link #doBody} on the provided commit. */
		run: function( /* IndexCommit */ commit) {
			console.log("FindSegmentsFile::run");
			if (commit != null) {
				if (this.directory !== commit.getDirectory()) //WARNING - check this object comparison 
				throw new IOException("the specified commit does not match the specified Directory");
				return this.doBody(commit.getSegmentsFileName());
			}
			var segmentFileName = null;
			var lastGen = -1;
			var gen = 0;
			var genLookaheadCount = 0;
			var exc = null; //IOException
			var retryCount = 0;
			var useFirstMethod = true;
			// Loop until we succeed in calling doBody() without
			// hitting an IOException.  An IOException most likely
			// means a commit was in process and has finished, in
			// the time it took us to load the now-old infos files
			// (and segments files).  It's also possible it's a
			// true error (corrupt index).  To distinguish these,
			// on each retry we must see "forward progress" on
			// which generation we are trying to load.  If we
			// don't, then the original error is real and we throw
			// it.
			// We have three methods for determining the current
			// generation.  We try the first two in parallel (when
			// useFirstMethod is true), and fall back to the third
			// when necessary.
			while (true) {
				if (useFirstMethod) {
					// List the directory and use the highest
					// segments_N file.  This method works well as long
					// as there is no stale caching on the directory
					// contents (NOTE: NFS clients often have such stale
					// caching):
					var genA = -1;
					var files = this.directory.listAll();
					if (files != null) {
						genA = SegmentInfos.getLastCommitGenerationWithFiles(files);
						console.log("genA="+genA);
					}
					if (SegmentInfos.infoStream != null) {
						SegmentInfos.message("directory listing genA=" + genA);
					}
					// Also open segments.gen and read its
					// contents.  Then we take the larger of the two
					// gens.  This way, if either approach is hitting
					// a stale cache (NFS) we have a better chance of
					// getting the right generation.
					var genB = -1;
					var genInput = null; //IndexInput
					try {
						genInput = this.directory.openInput(IndexFileNames.SEGMENTS_GEN, IOContext.READONCE);
					} catch (e) {
						console.log(e.toString());
						if (SegmentInfos.infoStream != null) {
							SegmentInfos.message("segments.gen error " + e);
						}
					}
					if (genInput != null) {
						try {
							console.log("start reading segment infos ");
							var version = genInput.readInt(); console.log("version="+version);
							if (version == SegmentInfos.FORMAT_SEGMENTS_GEN_CURRENT) {
								var gen0 = genInput.readLong(); 
								var gen1 = genInput.readLong();  console.log("fallback check: " + gen0 + "; " + gen1);
								if (SegmentInfos.infoStream != null) {
									SegmentInfos.message("fallback check: " + gen0 + "; " + gen1);
								}
								if (gen0 == gen1) {
									// The file is consistent.
									genB = gen0;
									console.log("genB="+genB);
								}
							} else {
								throw new IndexFormatTooNewException(genInput, version, SegmentInfos.FORMAT_SEGMENTS_GEN_CURRENT, SegmentInfos.FORMAT_SEGMENTS_GEN_CURRENT);
							}
						} catch ( /* IOException */ err2) {
							// rethrow any format exception
							throw err2;
							//if (err2 instanceof CorruptIndexException) throw err2;
						} finally {
							genInput.close();
						}
					}
					
					
					if (SegmentInfos.infoStream != null) {
						SegmentInfos.message(IndexFileNames.SEGMENTS_GEN + " check: genB=" + genB);
					}
					
					console.log("done checking gen file");
					
					// Pick the larger of the two gen's:
					gen = Math.max(genA, genB);
					if (gen == -1) {
						// Neither approach found a generation
						throw new IndexNotFoundException("no segments* file found in " + this.directory + ": files: " + Arrays.toString(files));
					}
				}
				if (useFirstMethod && lastGen == gen && retryCount >= 2) {
					// Give up on first method -- this is 3rd cycle on
					// listing directory and checking gen file to
					// attempt to locate the segments file.
					useFirstMethod = false;
				}
				
				
				// Second method: since both directory cache and
				// file contents cache seem to be stale, just
				// advance the generation.
				if (!useFirstMethod) {
					if (genLookaheadCount < SegmentInfos.defaultGenLookaheadCount) {
						gen++;
						genLookaheadCount++;
						if (SegmentInfos.infoStream != null) {
							SegmentInfos.message("look ahead increment gen to " + gen);
						}
					} else {
						// All attempts have failed -- throw first exc:
						throw exc;
					}
				} else if (lastGen == gen) {
					// This means we're about to try the same
					// segments_N last tried.
					retryCount++;
				} else {
					// Segment file has advanced since our last loop
					// (we made "progress"), so reset retryCount:
					retryCount = 0;
				}
				
				
				lastGen = gen;
				
				console.log("lastGen = " + lastGen);
				segmentFileName = IndexFileNames.fileNameFromGeneration(IndexFileNames.SEGMENTS, "", gen);
				console.log("segmentFileName = " + segmentFileName);
				
				try {
					var v = this.doBody(segmentFileName);
					if (SegmentInfos.infoStream != null) {
						SegmentInfos.message("success on " + segmentFileName);
					}
					return v;
				} catch ( /* IOException */ err) {
					// Save the original root cause:
					if (exc == null) {
						exc = err;
					}
					if (SegmentInfos.infoStream != null) {
						SegmentInfos.message("primary Exception on '" + segmentFileName + "': " + err + "'; will retry: retryCount=" + retryCount + "; gen = " + gen);
					}
					if (gen > 1 && useFirstMethod && retryCount == 1) {
						// This is our second time trying this same segments
						// file (because retryCount is 1), and, there is
						// possibly a segments_(N-1) (because gen > 1).
						// So, check if the segments_(N-1) exists and
						// try it if so:
						var prevSegmentFileName = IndexFileNames.fileNameFromGeneration(IndexFileNames.SEGMENTS, "", gen - 1);
						var prevExists;
						prevExists = this.directory.fileExists(prevSegmentFileName);
						if (prevExists) {
							if (SegmentInfos.infoStream != null) {
								SegmentInfos.message("fallback to prior segment file '" + prevSegmentFileName + "'");
							}
							try {
								var v = this.doBody(prevSegmentFileName);
								if (SegmentInfos.infoStream != null) {
									SegmentInfos.message("success on fallback " + prevSegmentFileName);
								}
								return v;
							} catch ( /* IOException */ err2) {
								if (SegmentInfos.infoStream != null) {
									SegmentInfos.message("secondary Exception on '" + prevSegmentFileName + "': " + err2 + "'; will retry");
								}
							}
						}
					} //if
				} //catch
			} //while
		},
		//run()
		/**
		 * Subclass must implement this.  The assumption is an
		 * IOException will be thrown if something goes wrong
		 * during the processing that could have been caused by
		 * a writer committing.
		 */
		doBody: function( /* String */ segmentFileName) {}
	} //methods
});
SegmentInfos.FindSegmentsFile = FindSegmentsFile;
module.exports = exports = SegmentInfos;