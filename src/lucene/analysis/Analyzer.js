var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
var ImplNotSupportedException = require('library/lucene/util/ImplNotSupportedException.js');
var IllegalArgumentException = require('library/lucene/util/IllegalArgumentException.js');
var NullPointerException = require('library/lucene/util/NullPointerException.js');
var AlreadyClosedException = require('library/lucene/store/AlreadyClosedException.js');
var Closeable = require('library/lucene/util/Closeable.js');
var CloseableThreadLocal = require('library/lucene/util/CloseableThreadLocal.js');
/**
 * An Analyzer builds TokenStreams, which analyze text.  It thus represents a
 * policy for extracting index terms from text.
 */
var Analyzer = defineClass({
	name: "Analyzer",
	construct: function() {
		/**
		 * Expert: create a new Analyzer with a custom {@link ReuseStrategy}.
		 * <p>
		 * NOTE: if you just want to reuse on a per-field basis, its easier to
		 * use a subclass of {@link AnalyzerWrapper} such as
		 * <a href="{@docRoot}/../analyzers-common/org/apache/lucene/analysis/miscellaneous/PerFieldAnalyzerWrapper.html">
		 * PerFieldAnalyerWrapper</a> instead.
		 */
		if (arguments.length == 1) {
			this.reuseStrategy = arguments[0];
			if(!Class.isInstanceOfClass(arguments[0], "ReuseStrategy")) throw new IllegalArgumentException("reusestrategy invalid");
		}
		/**
		 * Create a new Analyzer, reusing the same set of components per-thread
		 * across calls to {@link #tokenStream(String, Reader)}.
		 */
		else if (arguments.length == 1) {
			this.reuseStrategy = new GlobalReuseStrategy();
		}
	},
	variables: {
		reuseStrategy: null,
	},
	methods: {
		/**
		 * Creates a new {@link TokenStreamComponents} instance for this analyzer.
		 *
		 * @param fieldName
		 *          the name of the fields content passed to the
		 *          {@link TokenStreamComponents} sink as a reader
		 * @param reader
		 *          the reader passed to the {@link Tokenizer} constructor
		 * @return the {@link TokenStreamComponents} for this analyzer.
		 */
		createComponents$abstract: function(fieldName, reader) {},
		/**
		 * Returns a TokenStream suitable for <code>fieldName</code>, tokenizing
		 * the contents of <code>reader</code>.
		 * <p>
		 * This method uses {@link #createComponents(String, Reader)} to obtain an
		 * instance of {@link TokenStreamComponents}. It returns the sink of the
		 * components and stores the components internally. Subsequent calls to this
		 * method will reuse the previously stored components after resetting them
		 * through {@link TokenStreamComponents#setReader(Reader)}.
		 * <p>
		 * <b>NOTE:</b> After calling this method, the consumer must follow the
		 * workflow described in {@link TokenStream} to properly consume its contents.
		 * See the {@link org.apache.lucene.analysis Analysis package documentation} for
		 * some examples demonstrating this.
		 *
		 * @param fieldName the name of the field the created TokenStream is used for
		 * @param reader the reader the streams source reads from
		 * @return TokenStream for iterating the analyzed content of <code>reader</code>
		 * @throws AlreadyClosedException if the Analyzer is closed.
		 * @throws IOException if an i/o error occurs.
		 */
		tokenStream: function(fieldName, reader) {
			var components = this.reuseStrategy.getReusableComponents(fieldName);
			var r = this.initReader(fieldName, reader);
			if (components == null) {
				components = this.createComponents(fieldName, r);
				this.reuseStrategy.setReusableComponents(fieldName, components);
			} else {
				components.setReader(r);
			}
			return components.getTokenStream();
		},
		/**
		 * Override this if you want to add a CharFilter chain.
		 * <p>
		 * The default implementation returns <code>reader</code>
		 * unchanged.
		 *
		 * @param fieldName IndexableField name being indexed
		 * @param reader original Reader
		 * @return reader, optionally decorated with CharFilter(s)
		 */
		initReader: function(fieldName, reader) {
			return reader;
		},
		/**
		 * Invoked before indexing a IndexableField instance if
		 * terms have already been added to that field.  This allows custom
		 * analyzers to place an automatic position increment gap between
		 * IndexbleField instances using the same field name.  The default value
		 * position increment gap is 0.  With a 0 position increment gap and
		 * the typical default token position increment of 1, all terms in a field,
		 * including across IndexableField instances, are in successive positions, allowing
		 * exact PhraseQuery matches, for instance, across IndexableField instance boundaries.
		 *
		 * @param fieldName IndexableField name being indexed.
		 * @return position increment gap, added to the next token emitted from {@link #tokenStream(String,Reader)}.
		 *         This value must be {@code >= 0}.
		 */
		getPositionIncrementGap: function(fieldName) {
			return 0;
		},
		/**
		 * Just like {@link #getPositionIncrementGap}, except for
		 * Token offsets instead.  By default this returns 1.
		 * This method is only called if the field
		 * produced at least one token for indexing.
		 *
		 * @param fieldName the field just indexed
		 * @return offset gap, added to the next token emitted from {@link #tokenStream(String,Reader)}.
		 *         This value must be {@code >= 0}.
		 */
		getOffsetGap: function(fieldName) {
			return 1;
		},
		/** Frees persistent resources used by this Analyzer */
		//@Override
		close: function() {
			this.reuseStrategy.close();
		},
	}
});
/**
 * This class encapsulates the outer components of a token stream. It provides
 * access to the source ({@link Tokenizer}) and the outer end (sink), an
 * instance of {@link TokenFilter} which also serves as the
 * {@link TokenStream} returned by
 * {@link Analyzer#tokenStream(String, Reader)}.
 */
var TokenStreamComponents = defineClass({
	name: "TokenStreamComponents",
	variables: {
		/**
		 * Original source of the tokens.
		 */
		source: null,
		/**
		 * Sink tokenstream, such as the outer tokenfilter decorating
		 * the chain. This can be the source if there are no filters.
		 */
		sink: null,
	},
	/**
	 * Creates a new {@link TokenStreamComponents} instance.
	 *
	 * @param source
	 *          the analyzer's tokenizer
	 * @param result
	 *          the analyzer's resulting token stream
	 */
	//public TokenStreamComponents(final Tokenizer source, TokenStream result
	// public TokenStreamComponents(final Tokenizer source)
	construct: function() {
		if (arguments.length >= 1) {
			if(!Class.isInstanceOfClass(arguments[0], "Tokenizer")) return new IllegalArgumentException("TokenStreamComponents constructor params");
			this.source = arguments[0];
			if (arguments.length >= 2 && arguments[1] != null) {
				if(!Class.isInstanceOfClass(arguments[1], "TokenStream")) return new IllegalArgumentException("TokenStreamComponents construct params");
				this.sink = arguments[1];
			}
		}
	},
	methods: {
		/**
		 * Resets the encapsulated components with the given reader. If the components
		 * cannot be reset, an Exception should be thrown.
		 *
		 * @param reader
		 *          a reader to reset the source component
		 * @throws IOException
		 *           if the component's reset method throws an {@link IOException}
		 */
		setReader: function(reader) {
			assert(Class.isInstanceOfClass(reader, "Reader"));
			this.source.setReader(reader);
		},
		/**
		 * Returns the sink {@link TokenStream}
		 *
		 * @return the sink {@link TokenStream}
		 */
		getTokenStream: function() {
			return this.sink;
		},
		/**
		 * Returns the component's {@link Tokenizer}
		 *
		 * @return Component's {@link Tokenizer}
		 */
		getTokenizer: function() {
			return this.source;
		}
	}
});
/**
 * Strategy defining how TokenStreamComponents are reused per call to
 * {@link Analyzer#tokenStream(String, java.io.Reader)}.
 */
var ReuseStrategy = defineClass({
	name: "ReuseStrategy",
	implement: Closeable,
	variables: {
		storedValue: new CloseableThreadLocal(),
	},
	/** Sole constructor. (For invocation by subclass constructors, typically implicit.) */
	construct: function() {},
	methods: {
		/**
		 * Gets the reusable TokenStreamComponents for the field with the given name
		 *
		 * @param fieldName Name of the field whose reusable TokenStreamComponents
		 *        are to be retrieved
		 * @return Reusable TokenStreamComponents for the field, or {@code null}
		 *         if there was no previous components for the field
		 */
		getReusableComponents$abstract: function(fieldName) {},
		/**
		 * Stores the given TokenStreamComponents as the reusable components for the
		 * field with the give name
		 *
		 * @param fieldName Name of the field whose TokenStreamComponents are being set
		 * @param components TokenStreamComponents which are to be reused for the field
		 */
		setReusableComponents$abstract: function(fieldName, components) {},
		/**
		 * Returns the currently stored value
		 *
		 * @return Currently stored value or {@code null} if no value is stored
		 * @throws AlreadyClosedException if the ReuseStrategy is closed.
		 */
		getStoredValue: function() {
			try {
				return this.storedValue.get();
			} catch (npe) {
				if (this.storedValue == null) {
					throw new AlreadyClosedException("this Analyzer is closed");
				} else {
					throw npe;
				}
			}
		},
		/**
		 * Sets the stored value
		 *
		 * @param storedValue Value to store
		 * @throws AlreadyClosedException if the ReuseStrategy is closed.
		 */
		setStoredValue: function(storedValue) {
			try {
				this.storedValue.set(storedValue);
			} catch (npe) {
				if (this.storedValue == null) {
					throw new AlreadyClosedException("this Analyzer is closed");
				} else {
					throw npe;
				}
			}
		},
		/**
		 * Closes the ReuseStrategy, freeing any resources
		 */
		//Override
		close: function() {
			if (this.storedValue != null) {
				this.storedValue.close();
				this.storedValue = null;
			}
		}
	}
});
	
/**
 * Implementation of {@link ReuseStrategy} that reuses the same components for
 * every field.
 */
var GlobalReuseStrategy = defineClass({
	name: "GlobalReuseStrategy",
	extend: ReuseStrategy,
	/** Creates a new instance, with empty per-thread values */
	construct: function() {},
	methods: {
		//override
		getReusableComponents: function(fieldName) {
			return this.getStoredValue();
		},
		//@Override
		setReusableComponents: function(fieldName, components) {
			this.setStoredValue(components);
		}
	}
});
/**
 * Implementation of {@link ReuseStrategy} that reuses components per-field by
 * maintaining a Map of TokenStreamComponent per field name.
 */
var PerFieldReuseStrategy = defineClass({
	name: "PerFieldReuseStrategy",
	extend: ReuseStrategy,
	/** Creates a new instance, with empty per-thread-per-field values */
	construct: function() {},
	methods: {
		//Override
		getReusableComponents: function(fieldName) {
			var componentsPerField = this.getStoredValue(); //(Map<String, TokenStreamComponents>) getStoredValue();
			return componentsPerField != null ? componentsPerField.get(fieldName) : null;
		},
		setReusableComponents: function(fieldName, components) {
			var componentsPerField = this.getStoredValue(); //(Map<String, TokenStreamComponents>) getStoredValue();
			if (componentsPerField == null) {
				componentsPerField = {}; //new HashMap<String, TokenStreamComponents>();
				this.setStoredValue(componentsPerField);
			}
			componentsPerField.put(fieldName, components);
		}
	}
});

Analyzer.TokenStreamComponents = TokenStreamComponents;
module.exports = exports = Analyzer;