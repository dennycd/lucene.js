var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');

var StopwordAnalyzerBase = require('library/lucene/analysis/StopwordAnalyzerBase.js');
var StopAnalyzer = require('library/lucene/analysis/core/StopAnalyzer.js');

var StandardTokenizer = require('library/lucene/analysis/standard/StandardTokenizer.js');
var TokenStream = require('library/lucene/analysis/TokenStream.js');


var LowerCaseFilter = require('library/lucene/analysis/core/LowerCaseFilter.js');
var StopFilter = require('library/lucene/analysis/core/StopFilter.js');
var StandardFilter = require('library/lucene/analysis/standard/StandardFilter.js');

var TokenStreamComponents = require('library/lucene/analysis/Analyzer.js').TokenStreamComponents;
/**
 * Filters {@link StandardTokenizer} with {@link StandardFilter}, {@link
 * LowerCaseFilter} and {@link StopFilter}, using a list of
 * English stop words.
 *
 * <a name="version"/>
 * <p>You must specify the required {@link Version}
 * compatibility when creating StandardAnalyzer:
 * <ul>
 *   <li> As of 3.4, Hiragana and Han characters are no longer wrongly split
 *        from their combining characters. If you use a previous version number,
 *        you get the exact broken behavior for backwards compatibility.
 *   <li> As of 3.1, StandardTokenizer implements Unicode text segmentation,
 *        and StopFilter correctly handles Unicode 4.0 supplementary characters
 *        in stopwords.  {@link ClassicTokenizer} and {@link ClassicAnalyzer}
 *        are the pre-3.1 implementations of StandardTokenizer and
 *        StandardAnalyzer.
 *   <li> As of 2.9, StopFilter preserves position increments
 *   <li> As of 2.4, Tokens incorrectly identified as acronyms
 *        are corrected (see <a href="https://issues.apache.org/jira/browse/LUCENE-1068">LUCENE-1068</a>)
 * </ul>
 */
var StandardAnalyzer = defineClass({
	name: "StandardAnalyzer",
	extend: StopwordAnalyzerBase,
	statics: { /** Default maximum allowed token length */
		DEFAULT_MAX_TOKEN_LENGTH: 255,
		/** An unmodifiable set containing some common English words that are usually not useful for searching. */
		STOP_WORDS_SET: StopAnalyzer.ENGLISH_STOP_WORDS_SET,
	},
	variables: {
		maxTokenLength: 0
	},
	/** Builds an analyzer with the given stop words.
	 * @param matchVersion Lucene version to match See {@link <a href="#version">above</a>}
	 * @param stopWords stop words
	 */
	construct: function() {
		if (arguments.length == 1) {
			StopwordAnalyzerBase.call(this, arguments[0], StandardAnalyzer.STOP_WORDS_SET);
		} else if (arguments.length == 2) {
			if (!arguments[1].getClass()) throw new IllegalArgumentException("stopwords argument illegal");
			if(Class.isInstanceOfClass(arguments[1], "CharArraySet")) StopwordAnalyzerBase.call(this, arguments[0], arguments[1]);
			else if(Class.isInstanceOfClass(arguments[1], "Reader")) StopwordAnalyzerBase.call(this, arguments[0], StopwordAnalyzerBase.loadStopwordSet(arguments[1]));
			else throw new IllegalArgumentException("StandardAnalyzer constructor argument illegal");
		}
		this.maxTokenLength = StandardAnalyzer.DEFAULT_MAX_TOKEN_LENGTH;
	},
	methods: {
		/**
		 * Set maximum allowed token length.  If a token is seen
		 * that exceeds this length then it is discarded.  This
		 * setting only takes effect the next time tokenStream or
		 * tokenStream is called.
		 */
		setMaxTokenLength: function(length) {
			this.maxTokenLength = length;
		},
		//@Override
		createComponents: function(fieldName, reader) {
			var src = new StandardTokenizer(this.matchVersion, reader);
			src.setMaxTokenLength(this.maxTokenLength);
			var tok = new StandardFilter(matchVersion, src);
			tok = new LowerCaseFilter(matchVersion, tok);
			tok = new StopFilter(matchVersion, tok, stopwords);
			
			
			var self = this;
			var MyTokenStreamComponents = defineClass({
				name : "MyTokenStreamComponents",
				extend : TokenStreamComponents,
				methods : {
					setReader : function(rLowerCaseFiltereader){
				        src.setMaxTokenLength(StandardAnalyzer.self.maxTokenLength);
				        TokenStreamComponents.prototype.setReader.call(this,reader);				
					}
				}
			});
			return new MyTokenStreamComponents(src,tok);
		}
	}
});
module.exports = exports = StandardAnalyzer;