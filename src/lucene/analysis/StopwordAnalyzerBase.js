var util = require('util');
var assert = require('assert');

var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var IOException = require('library/lucene/util/IOException.js');
var File = require('library/lucene/util/File.js');
var Reader = require('library/lucene/util/Reader.js');
var IOUtils = require('library/lucene/util/IOUtils.js');
var WordlistLoader = require('library/lucene/analysis/WordlistLoader.js');
var Version = require('library/lucene/util/Version');
var Analyzer = require('library/lucene/analysis/Analyzer.js');

var CharArraySet = require('library/lucene/util/CharArraySet.js');

/**
 * Base class for Analyzers that need to make use of stopword sets.
 *
 */
var StopwordAnalyzerBase = defineClass({
	name: "StopwordAnalyzerBase",
	extend: Analyzer,
	variables: {
		/**
		 * An immutable stopword set
		 */
		stopwords: null,
		matchVersion: null
	},
	statics: {
		/**
		 * Creates a CharArraySet from a file resource associated with a class. (See
		 * {@link Class#getResourceAsStream(String)}).
		 *
		 * @param ignoreCase
		 *          <code>true</code> if the set should ignore the case of the
		 *          stopwords, otherwise <code>false</code>
		 * @param aClass
		 *          a class that is associated with the given stopwordResource
		 * @param resource
		 *          name of the resource file associated with the given class
		 * @param comment
		 *          comment string to ignore in the stopword file
		 * @return a CharArraySet containing the distinct stopwords from the given
		 *         file
		 * @throws IOException
		 *           if loading the stopwords throws an {@link IOException}
		 */
		//protected static CharArraySet loadStopwordSet(final boolean ignoreCase, final Class<? extends Analyzer> aClass, final String resource, final String comment) throws IOException
		loadStopwordSet$overload$1: function(ignoreCase, aClass, resource, comment) {
			var reader = null;
			try {
				reader = IOUtils.getDecodingReader(aClass.getResourceAsStream(resource), IOUtils.CHARSET_UTF_8);
				return WordlistLoader.getWordSet(reader, comment, new CharArraySet(Version.LUCENE_31, 16, ignoreCase));
			} finally {
				IOUtils.close(reader);
			}
		},
		/**
		 * Creates a CharArraySet from a file.
		 *
		 * @param stopwords
		 *          the stopwords file to load
		 *
		 * @param matchVersion
		 *          the Lucene version for cross version compatibility
		 * @return a CharArraySet containing the distinct stopwords from the given
		 *         file
		 * @throws IOException
		 *           if loading the stopwords throws an {@link IOException}
		 */
		//protected static CharArraySet loadStopwordSet(File stopwords, Version matchVersion) throws IOException {
		loadStopwordSet$overload$2: function(stopwords, matchVersion) {
		
			if(Class.isInstanceOfClass(stopwords, "File")){
				var reader = null;
				try {
					reader = IOUtils.getDecodingReader(stopwords, IOUtils.CHARSET_UTF_8);
					return WordlistLoader.getWordSet(reader, matchVersion);
				} finally {
					IOUtils.close(reader);
				}				
			}
			else if(Class.isInstanceOfClass(stopwords, "Reader")){
				try {
					return WordlistLoader.getWordSet(stopwords, matchVersion);
				} finally {
				 	IOUtils.close(stopwords);
				}				
			}		
		}
  
	},
	/**
	 * Creates a new instance initialized with the given stopword set
	 *
	 * @param version
	 *          the Lucene version for cross version compatibility
	 * @param stopwords
	 *          the analyzer's stopword set
	 */
	construct: function() {
		Analyzer.call(this);
		
		if (arguments.length >= 1) {
			if(!Class.isInstanceOfClass(arguments[0], "Version")) throw new IllegalArgumentException("invalid version obj");
			this.matchVersion = arguments[0];
			//// analyzers should use char array set for stopwords!
			if (arguments.length >= 2) {
				if(!Class.isInstanceOfClass(arguments[1], "CharArraySet")) throw new IllegalArgumentException("invalid CharArraySet obj: " + util.inspect(arguments[1]));
				var newset = CharArraySet.copy(arguments[0], arguments[1]);
				this.stopwords = CharArraySet.unmodifiableSet(newset);		
			} else this.stopwords = CharArraySet.EMPTY_SET;
		}
	},
	methods: {
		/**
		 * Returns the analyzer's stopword set or an empty set if the analyzer has no
		 * stopwords
		 *
		 * @return the analyzer's stopword set or an empty set if the analyzer has no
		 *         stopwords
		 */
		getStopwordSet: function() {
			return this.stopwords;
		},
	}
});
module.exports = exports = StopwordAnalyzerBase;