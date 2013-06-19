var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');


var Collections = require('library/java/util/Collections.js');
var ArrayList = require('library/java/util/ArrayList.js');

var SegmentInfos = require('./SegmentInfos.js');
var IndexFileNames = require('./IndexFileNames.js');
var BaseCompositeReader = require('./BaseCompositeReader.js');


var DirectoryReader = defineClass({
	name : "DirectoryReader",
	extend : BaseCompositeReader, 
	statics : {
		/** Default termInfosIndexDivisor. */
  		DEFAULT_TERMS_INDEX_DIVISOR : 1,

  		open : function(){
  			console.log("DirectoryReader::open");
  			
  			var StandardDirectoryReader = require('./StandardDirectoryReader.js');

	  		if(arguments.length==1){
		  		if(Class.isInstanceOfClass(arguments[0], "Directory")){
		  			return StandardDirectoryReader.openWithDirectoryCommit(arguments[0], null, DirectoryReader.DEFAULT_TERMS_INDEX_DIVISOR);
		  		}
		  		else if(Class.isInstanceOfClass(arguments[0], "IndexCommit"))
		  			return StandardDirectoryReader.open(arguments[0].getDirectory(), arguments[0], DirectoryReader.DEFAULT_TERMS_INDEX_DIVISOR);
		  		else 
		  			throw new IllegalArgumentException("illegal args");
	  		}
	  		else if(arguments.length == 2){
		  		if(Class.isInstanceOfClass(arguments[0], "Directory")){  //directory 
			  		if(typeof(arguments[1])!="number") throw new IllegalArgumentException("illegal args");  //int termInfosIndexDivisor
			  		return StandardDirectoryReader.open(arguments[0], null, arguments[1]);
		  		}
		  		else if(Class.isInstanceOfClass(arguments[0], "IndexWriter")){
			  		if(typeof(arguments[1])!="boolean") throw new IllegalArgumentException("illegal args");  //bool applyAllDeletes
			  		return arguments[0].getReader(arguments[1]);
		  		} 
		  		else if(Class.isInstanceOfClass(arguments[0], "IndexCommit")){
		  			if(typeof(arguments[1])!="number") throw new IllegalArgumentException("illegal args");  //int termInfosIndexDivisor
		  			return StandardDirectoryReader.open(arguments[0].getDirectory(), arguments[0], arguments[1]);
		  		}
		  		else throw new IllegalArgumentException("illegal args");
	  		}
	  		else throw new IllegalArgumentException("illegal args");
  		},
  
  
  		
  		openIfChanged : function(){
	  		if(arguments.length >= 1){
	  			if(Class.isInstanceOfClass(arguments[0],"DirectoryReader")) throw new IllegalArgumentException("illegal args");  //bool applyAllDeletes

	  			if(arguments.length==1){
		  			var newReader = arguments[0].doOpenIfChanged();
		  		    assert(newReader != arguments[0]);
	  				return newReader;
	  			}
	  			else{
		  			if(Class.isInstanceOfClass(arguments[1],"IndexCommit")){
			  			var newReader = arguments[0].doOpenIfChanged(arguments[1]);
			  			assert(newReader != arguments[0]);
			  			return newReader;
		  			}
		  			else if(Class.isInstanceOfClass(arguments[1], "IndexWriter")){
		  				if(typeof(arguments[2])!="boolean") throw new IllegalArgumentException("illegal args");
					    var newReader = arguments[0].doOpenIfChanged(arguments[1], arguments[2]);
					    assert( newReader != arguments[0]);
					    return newReader;			  			
		  			}
		  			else throw new IllegalArgumentException("illegal args");
	  			}
	  		}
  		},
  	
		/** Returns all commit points that exist in the Directory.
		*  Normally, because the default is {@link
		*  KeepOnlyLastCommitDeletionPolicy}, there would be only
		*  one commit point.  But if you're using a custom {@link
		*  IndexDeletionPolicy} then there could be many commits.
		*  Once you have a given commit, you can open a reader on
		*  it by calling {@link DirectoryReader#open(IndexCommit)}
		*  There must be at least one commit in
		*  the Directory, else this method throws {@link
		*  IndexNotFoundException}.  Note that if a commit is in
		*  progress while this method is running, that commit
		*  may or may not be returned.
		*  
		*  @return a sorted list of {@link IndexCommit}s, from oldest 
		*  to latest. */
		listCommits : function(/* Directory */ dir){
		
			var StandardDirectoryReader = require('./StandardDirectoryReader.js');
			
			var files = dir.listAll();
			
			var commits = new ArrayList(); //new ArrayList<IndexCommit>();
			
			var latest = new SegmentInfos();
			latest.read(dir);
			var currentGen = latest.getGeneration();
			
			commits.add(new StandardDirectoryReader.ReaderCommit(latest, dir));
			
			for(var i=0;i<files.length;i++) {
			
			  var fileName = files[i];
			
			  if (fileName.startsWith(IndexFileNames.SEGMENTS) &&
			      !fileName.equals(IndexFileNames.SEGMENTS_GEN) &&
			      SegmentInfos.generationFromSegmentsFileName(fileName) < currentGen) {
			
			    var sis = new SegmentInfos();
			    try {
			      // IOException allowed to throw there, in case
			      // segments_N is corrupt
			      sis.read(dir, fileName);
			    } 
			    catch (/* FileNotFoundException */ fnfe) {
			      // LUCENE-948: on NFS (and maybe others), if
			      // you have writers switching back and forth
			      // between machines, it's very likely that the
			      // dir listing will be stale and will claim a
			      // file segments_X exists when in fact it
			      // doesn't.  So, we catch this and handle it
			      // as if the file does not exist
			      sis = null;
			    }
			
			    if (sis != null)
			      commits.add(new StandardDirectoryReader.ReaderCommit(sis, dir));
			  }
			}
			
			// Ensure that the commit points are sorted in ascending order.
			Collections.sort(commits);
			
			return commits;
		}, 

		/**
		* Returns <code>true</code> if an index exists at the specified directory.
		* @param  directory the directory to check for an index
		* @return <code>true</code> if an index exists; <code>false</code> otherwise
		*/
		indexExists : function(/* Directory */ directory) {
			try {
			  new SegmentInfos().read(directory);
			  return true;
			} 
			catch (/* IOException */ ioe) {
			  return false;
			}
		},
		
		/** Returns the directory this index resides in. */
		 directory : function() {
			// Don't ensureOpen here -- in certain cases, when a
			// cloned/reopened reader needs to commit, it may call
			// this method on the closed original reader
			return this.directory;
		},
		

		doOpenIfChanged$overload : function(){},
		doOpenIfChanged$overload : function(/* IndexCommit */ commit){},
		doOpenIfChanged$overload : function(/* IndexWriter */ writer, /* boolean */ applyAllDeletes){},
		getVersion$abstract : function(){},
		isCurrent$abstract : function(){},
		getIndexCommit$abstract : function(){}
		
  
  
	},
	variables : {
  
		/** The index directory. */
		directory : null
  
	},


  /**
   * Expert: Constructs a {@code DirectoryReader} on the given subReaders.
   * @param segmentReaders the wrapped atomic index segment readers. This array is
   * returned by {@link #getSequentialSubReaders} and used to resolve the correct
   * subreader for docID-based methods. <b>Please note:</b> This array is <b>not</b>
   * cloned and not protected for modification outside of this reader.
   * Subclasses of {@code DirectoryReader} should take care to not allow
   * modification of this internal array, e.g. {@link #doOpenIfChanged()}.
   */
	construct : function(/* Directory */ directory, /* AtomicReader[] */ segmentReaders){
		BaseCompositeReader.call(this, segmentReaders);
		this.directory = directory;
	},
	methods : {
		
	}
});
module.exports = exports = DirectoryReader;