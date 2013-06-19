var util = require('util');
var assert = require('assert');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
/** This class emulates the new Java 7 "Try-With-Resources" statement.
 * Remove once Lucene is on Java 7.
 * @lucene.internal
 */
var IOUtils = defineClass({
	name: "IOUtils",
	statics: {
		/**
		 * UTF-8 charset string
		 * @see Charset#forName(String)
		 */
		UTF_8: "UTF-8",
		/**
		 * UTF-8 {@link Charset} instance to prevent repeated
		 * {@link Charset#forName(String)} lookups
		 */
		//CHARSET_UTF_8 :    
		/**
		 * <p>Closes all given <tt>Closeable</tt>s, suppressing all thrown exceptions. Some of the <tt>Closeable</tt>s
		 * may be null, they are ignored. After everything is closed, method either throws <tt>priorException</tt>,
		 * if one is supplied, or the first of suppressed exceptions, or completes normally.</p>
		 * <p>Sample usage:<br/>
		 * <pre class="prettyprint">
		 * Closeable resource1 = null, resource2 = null, resource3 = null;
		 * ExpectedException priorE = null;
		 * try {
		 *   resource1 = ...; resource2 = ...; resource3 = ...; // Acquisition may throw ExpectedException
		 *   ..do..stuff.. // May throw ExpectedException
		 * } catch (ExpectedException e) {
		 *   priorE = e;
		 * } finally {
		 *   closeWhileHandlingException(priorE, resource1, resource2, resource3);
		 * }
		 * </pre>
		 * </p>
		 * @param priorException  <tt>null</tt> or an exception that will be rethrown after method completion
		 * @param objects         objects to call <tt>close()</tt> on
		 */
		//public static <E extends Exception> void closeWhileHandlingException(E priorException, Closeable... objects){
		closeWhileHandlingException: function(priorException, objects) {
			var th = null; //Throwable
			for (var idx in objects) {
				var object = objects[idx];
				try {
					if (object != null) {
						object.close();
					}
				} catch (t) {
					//this.addSuppressed((priorException == null) ? th : priorException, t);
					if (th == null) {
						th = t;
					}
				}
			}
			if (priorException != null) {
				throw priorException;
			} else if (th != null) {
				throw th;
			}
		}, 
		/**
		 * Closes all given <tt>Closeable</tt>s.  Some of the
		 * <tt>Closeable</tt>s may be null; they are
		 * ignored.  After everything is closed, the method either
		 * throws the first exception it hit while closing, or
		 * completes normally if there were no exceptions.
		 *
		 * @param objects
		 *          objects to call <tt>close()</tt> on
		 */
		closeWithObjects: function(objects) {
			assert(objects instanceof Array);
			var th = null;
			for (var i in objects) {
				var object = objects[i];
				try {
					if (object != null) {
						object.close();
					}
				} catch (t) {
					//addSuppressed(th, t);
					if (th == null) {
						th = t;
					}
				}
			}
			if (th != null) {
				console.log("IOUTILS CLOSE ERROR: " + th.toString());
				throw new RuntimeException(th);
			}
		},
	},
});
module.exports = exports = IOUtils;