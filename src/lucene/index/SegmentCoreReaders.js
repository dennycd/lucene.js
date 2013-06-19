var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var defineInterface = require('library/class/defineInterface.js');
var Class = require('library/class/Class.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');

var CompoundFileDirectory = require('library/lucene/store/CompoundFileDirectory.js');
var IOContext = require('library/lucene/store/IOContext.js');

var IndexFileNames = require('./IndexFileNames.js');
var SegmentReadState = require('./SegmentReadState.js');
var DocValuesType = require('./FieldInfo.js').DocValuesType;
var CloseableThreadLocal = require('library/lucene/util/CloseableThreadLocal.js');
var IOUtils = require('library/lucene/util/IOUtils.js');
var synchronized = require('library/thread').Synchronized;


console.log("SegmentCoreReaders MODULE");


/** Holds core readers that are shared (unchanged) when
 * SegmentReader is cloned or reopened */
var SegmentCoreReaders = defineClass({
	name : "SegmentCoreReaders",
	variables : {

  // Counts how many other reader share the core objects
  // (freqStream, proxStream, tis, etc.) of this reader;
  // when coreRef drops to 0, these core objects may be
  // closed.  A given instance of SegmentReader may be
  // closed, even those it shares core objects with other
  // SegmentReaders:
   ref : 1,  //new AtomicInteger(1), //AtomicInteger
  
   fieldInfos : null, //FieldInfos
   fields : null, //FieldsProducer
   dvProducer : null, //DocValuesProducer
   normsProducer : null, //DocValuesProducer
   termsIndexDivisor : null, //int
   owner : null, //SegmentReader
  
   fieldsReaderOrig : null, //StoredFieldsReader
   termVectorsReaderOrig : null, //TermVectorsReader
   cfsReader : null, //CompoundFileDirectory
   

  // TODO: make a single thread local w/ a
  // Thingy class holding fieldsReader, termVectorsReader,
  // normsProducer, dvProducer

  fieldsReaderLocal : null, 
  termVectorsLocal : null, 
  docValuesLocal : null, 
  normsLocal : null, 
  
/*
  final CloseableThreadLocal<StoredFieldsReader> fieldsReaderLocal = new CloseableThreadLocal<StoredFieldsReader>() {
    @Override
    protected StoredFieldsReader initialValue() {
      return fieldsReaderOrig.clone();
    }
  };
  
  final CloseableThreadLocal<TermVectorsReader> termVectorsLocal = new CloseableThreadLocal<TermVectorsReader>() {
    @Override
    protected TermVectorsReader initialValue() {
      return (termVectorsReaderOrig == null) ? null : termVectorsReaderOrig.clone();
    }
  };

  final CloseableThreadLocal<Map<String,Object>> docValuesLocal = new CloseableThreadLocal<Map<String,Object>>() {
    @Override
    protected Map<String,Object> initialValue() {
      return new HashMap<String,Object>();
    }
  };

  final CloseableThreadLocal<Map<String,Object>> normsLocal = new CloseableThreadLocal<Map<String,Object>>() {
    @Override
    protected Map<String,Object> initialValue() {
      return new HashMap<String,Object>();
    }
  };
*/


	coreClosedListeners : []

/*
  private final Set<CoreClosedListener> coreClosedListeners = 
      Collections.synchronizedSet(new LinkedHashSet<CoreClosedListener>());
*/
  		
	}, 
	
	construct : function(/* SegmentReader */ owner, /* Directory */ dir, /* SegmentInfoPerCommit */ si, /* IOContext */ context, /* int */ termsIndexDivisor){
			console.log("SegmentCoreReaders::construct");
		
			
		    if (termsIndexDivisor == 0) {
		      throw new IllegalArgumentException("indexDivisor must be < 0 (don't load terms index) or greater than 0 (got 0)");
		    }
		    
		    var codec = si.info.getCodec(); //Codec
		    var cfsDir = null; // Directory// confusing name: if (cfs) its the cfsdir, otherwise its the segment's directory.
		
		    var success = false;
		    
		    try {
		      if (si.info.getUseCompoundFile()) {
		        cfsDir = cfsReader = new CompoundFileDirectory(dir, IndexFileNames.segmentFileName(si.info.name, "", IndexFileNames.COMPOUND_FILE_EXTENSION), context, false);
		      } else {
		        cfsReader = null;
		        cfsDir = dir;
		      }
		      
		      
		      this.fieldInfos = codec.fieldInfosFormat().getFieldInfosReader().read(cfsDir, si.info.name, IOContext.READONCE);
		
		      this.termsIndexDivisor = termsIndexDivisor;
		      var format = codec.postingsFormat(); //PostingsFormat
		      
		      
		     
		      var segmentReadState = new SegmentReadState(cfsDir, si.info, this.fieldInfos, context, termsIndexDivisor);
		      
		       debugger;
		      
		      // Ask codec for its Fields
		      this.fields = format.fieldsProducer(segmentReadState);
		      assert(fields != null);
		      // ask codec for its Norms: 
		      // TODO: since we don't write any norms file if there are no norms,
		      // kinda jaky to assume the codec handles the case of no norms file at all gracefully?!
		
		      if (this.fieldInfos.hasDocValues()) {
		        this.dvProducer = codec.docValuesFormat().fieldsProducer(segmentReadState);
		        assert(this.dvProducer != null);
		      } else {
		        this.dvProducer = null;
		      }
		
		      if (this.fieldInfos.hasNorms()) {
		        this.normsProducer = codec.normsFormat().normsProducer(segmentReadState);
		        assert(this.normsProducer != null);
		      } else {
		        this.normsProducer = null;
		      }
		  
		      this.fieldsReaderOrig = si.info.getCodec().storedFieldsFormat().fieldsReader(cfsDir, si.info, this.fieldInfos, context);
		
		      if (this.fieldInfos.hasVectors()) { // open term vector files only as needed
		        this.termVectorsReaderOrig = si.info.getCodec().termVectorsFormat().vectorsReader(cfsDir, si.info, this.fieldInfos, context);
		      } else {
		        this.termVectorsReaderOrig = null;
		      }
		
		      success = true;
		    } 
		    catch(e){
		    	console.log(e.toString());
		    }
		    finally {
		      if (!success) {
		        this.decRef();
		      }
		    }
		    
		    // Must assign this at the end -- if we hit an
		    // exception above core, we don't want to attempt to
		    // purge the FieldCache (will hit NPE because core is
		    // not assigned yet).
		    this.owner = owner;

			console.log("SegmentCoreReaders::construct done");
	},
	

	methods : {


		   incRef : function() {
		     this.ref.incrementAndGet();
		  },
		
		  //NumericDocValues
		   getNumericDocValues : function(/* String */ field)  {
		    var fi = fieldInfos.fieldInfo(field); //FieldInfo
		    if (fi == null) {
		      // Field does not exist
		      return null;
		    }
		    if (fi.getDocValuesType() == null) {
		      // Field was not indexed with doc values
		      return null;
		    }
		    if (fi.getDocValuesType() != DocValuesType.NUMERIC) {
		      // DocValues were not numeric
		      return null;
		    }
		
		    assert(this.dvProducer != null);
		
		    var dvFields = this.docValuesLocal.get(); ///* Map<String,Object> */
		
		    var dvs = /* (NumericDocValues)  */ dvFields.get(field); //NumericDocValues
		    if (dvs == null) {
		      dvs = this.dvProducer.getNumeric(fi);
		      dvFields.put(field, dvs);
		    }
		
		    return dvs;
		  },
		
		
		  //@return BinaryDocValues
		  getBinaryDocValues : function(/* String */ field)  {
		    var fi = this.fieldInfos.fieldInfo(field); //FieldInfo
		    if (fi == null) {
		      // Field does not exist
		      return null;
		    }
		    
		    if (fi.getDocValuesType() == null) {
		      // Field was not indexed with doc values
		      return null;
		    }
		    if (fi.getDocValuesType() != DocValuesType.BINARY) {
		      // DocValues were not binary
		      return null;
		    }
		
		    assert(this.dvProducer != null);
		
		    var dvFields = this.docValuesLocal.get(); //Map<String,Object> 
		
		    var dvs = /* (BinaryDocValues) */ dvFields.get(field); //BinaryDocValues
		    if (dvs == null) {
		      dvs = this.dvProducer.getBinary(fi);
		      dvFields.put(field, dvs);
		    }
		
		    return dvs;
		  },
		
		   getSortedDocValues : function(/* String */ field)  { //SortedDocValues
		    var fi = fieldInfos.fieldInfo(field); //FieldInfo
		    if (fi == null) {
		      // Field does not exist
		      return null;
		    }
		    if (fi.getDocValuesType() == null) {
		      // Field was not indexed with doc values
		      return null;
		    }
		    if (fi.getDocValuesType() != DocValuesType.SORTED) {
		      // DocValues were not sorted
		      return null;
		    }
		
		    assert(this.dvProducer != null);
		
		    var dvFields = this.docValuesLocal.get(); //Map<String,Object> 
		
		    var dvs = dvFields.get(field); //SortedDocValues
		    if (dvs == null) {
		      dvs = this.dvProducer.getSorted(fi);
		      dvFields.put(field, dvs);
		    }
		
		    return dvs;
		  }, 
		  
		  //@return SortedSetDocValues
		   getSortedSetDocValues : function(/* String */ field)  { 
		    var fi = fieldInfos.fieldInfo(field); //FieldInfo
		    if (fi == null) {
		      // Field does not exist
		      return null;
		    }
		    if (fi.getDocValuesType() == null) {
		      // Field was not indexed with doc values
		      return null;
		    }
		    if (fi.getDocValuesType() != DocValuesType.SORTED_SET) {
		      // DocValues were not sorted
		      return null;
		    }
		
		    assert(this.dvProducer != null);
		
		    var dvFields = docValuesLocal.get(); // Map<String,Object>
		
		    var dvs = /* (SortedSetDocValues) */ dvFields.get(field); //SortedSetDocValues
		    if (dvs == null) {
		      dvs = this.dvProducer.getSortedSet(fi);
		      dvFields.put(field, dvs);
		    }
		
		    return dvs;
		  },
		
		   //@return NumericDocValues
		   getNormValues : function(/* String */ field)  {
		    var fi = fieldInfos.fieldInfo(field); //FieldInfo
		    if (fi == null) {
		      // Field does not exist
		      return null;
		    }
		    if (!fi.hasNorms()) {
		      return null;
		    }
		   
		    assert(this.normsProducer != null);
		
		    var normFields = normsLocal.get(); //Map<String,Object> 
		
		    var norms = /* (NumericDocValues) */ normFields.get(field); //NumericDocValues
		    if (norms == null) {
		      norms = this.normsProducer.getNumeric(fi);
		      normFields.put(field, norms);
		    }
		
		    return norms;
		  }, 
		
		  decRef : function()  {
		    if (this.ref.decrementAndGet() == 0) {
		      
		      IOUtils.close(this.termVectorsLocal, this.fieldsReaderLocal, this.docValuesLocal, this.normsLocal, this.fields, this.dvProducer,
		                    this.termVectorsReaderOrig, this.fieldsReaderOrig, this.cfsReader, this.normsProducer);
		                    
		      this.notifyCoreClosedListeners();
		    
		    }
		  },
		  
		   notifyCoreClosedListeners : function() {
		   	var self = this;
		    synchronized(this.coreClosedListeners, function(){
		      for (/* CoreClosedListener */var listener in self.coreClosedListeners) {
		        listener.onClose(self.owner);
		      }
		    });
		  },
		
		   addCoreClosedListener : function(/* CoreClosedListener */ listener) {
		    this.coreClosedListeners.add(listener);
		  },
		  
		   removeCoreClosedListener : function(/* CoreClosedListener */ listener) {
		    this.coreClosedListeners.remove(listener);
		  }, 
		
		  //@Override
		  toString : function() {
		    return "SegmentCoreReader(owner=" + this.owner + ")";
		  }
		  


	}	
});

console.log("SegmentCoreReaders MODULE DONE");

module.exports = exports = SegmentCoreReaders;

