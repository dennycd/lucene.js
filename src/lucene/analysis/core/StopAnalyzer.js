var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var StopwordAnalyzerBase = require('library/lucene/analysis/StopwordAnalyzerBase.js');
var TokenStreamComponents = require('library/lucene/analysis/Analyzer.js').TokenStreamComponents;

var LowerCaseTokenizer = require('library/lucene/analysis/core/LowerCaseTokenizer.js');
var StopFilter = require('library/lucene/analysis/core/StopFilter.js');

var Version = require('library/lucene/util/Version.js');

var CharArraySet = require('library/lucene/util/CharArraySet.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');


var List = require('library/lucene/util/List.js');

/** Filters {@link LetterTokenizer} with {@link LowerCaseFilter} and {@link StopFilter}.
 *
 * <a name="version"/>
 * <p>You must specify the required {@link Version}
 * compatibility when creating StopAnalyzer:
 * <ul>
 *    <li> As of 3.1, StopFilter correctly handles Unicode 4.0
 *         supplementary characters in stopwords
 *   <li> As of 2.9, position increments are preserved
 * </ul>
*/
var StopAnalyzer = defineClass({
	name : "StopAnalyzer",
	extend : StopwordAnalyzerBase,
	statics : {
		/** An unmodifiable set containing some common English words that are not usually useful for searching.*/
		ENGLISH_STOP_WORDS_SET : null
	},
	
	/**
	  
	  @param version - Version obj
	  
	**/
	construct : function(){
		if(arguments.length == 0){
			
		}
		else if(arguments.length == 1){
			if(!Class.isInstanceOfClass(arguments[0], "Version")) throw new IllegalArgumentException("version obj invalid");
			StopwordAnalyzerBase.call(this,arguments[0], StopAnalyzer.ENGLISH_STOP_WORDS_SET);
		}
		else if(arguments.length == 2){
			if(!Class.isInstanceOfClass(arguments[1], "Version")) throw new IllegalArgumentException("version obj invalid");
			
			if(Class.isInstanceOfClass(arguments[1], "CharArraySet") || Class.isInstanceOfClass(arguments[1], "File") || 
				Class.isInstanceOfClass(arguments[1], "Reader"))
				StopwordAnalyzerBase.call(this, arguments[0], arguments[1]);
			else throw new IllegalArgumentException("param invalid in StopAnalyzer"); 
		}
	},
	methods : {

		/**
		* Creates
		* {@link org.apache.lucene.analysis.Analyzer.TokenStreamComponents}
		* used to tokenize all the text in the provided {@link Reader}.
		* 
		* @return {@link org.apache.lucene.analysis.Analyzer.TokenStreamComponents}
		*         built from a {@link LowerCaseTokenizer} filtered with
		*         {@link StopFilter}
		*/
		//@Override
		createComponents : function(fieldName,reader) {
			var source = new LowerCaseTokenizer(matchVersion, reader);
			return new TokenStreamComponents(source, new StopFilter(matchVersion, source, stopwords));
		}  
	}
});



var stopWords = new List(
  "a", "an", "and", "are", "as", "at", "be", "but", "by",
  "for", "if", "in", "into", "is", "it",
  "no", "not", "of", "on", "or", "such",
  "that", "the", "their", "then", "there", "these",
  "they", "this", "to", "was", "will", "with"
);

var stopSet = new CharArraySet(Version.LUCENE_CURRENT, stopWords, false);
StopAnalyzer.ENGLISH_STOP_WORDS_SET = stopSet; //CharArraySet.unmodifiableSet(stopSet); 


module.exports = exports = StopAnalyzer;