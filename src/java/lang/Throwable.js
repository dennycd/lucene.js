var util = require('util');
var assert = require('assert');
var defineClass = require('simple-cls').defineClass;
var Class = require('simple-cls').Class;
var clc = require('cli-color');

var Throwable = defineClass({
	name : "Throwable",
	extend : Error,
	/**
		Constructs a new throwable with the specified detail message and cause.
		Note that the detail message associated with cause is not automatically incorporated in this throwable's detail message.
		
		@param message - the detail message (which is saved for later retrieval by the getMessage() method).
		@param cause - the cause (which is saved for later retrieval by the getCause() method). (A null value is permitted, and indicates that the cause is nonexistent or unknown.)
	**/
	construct : function(message, cause){
		this.message = message;
		this.cause = cause;
	},
	
	methods : {
	
		getMessage : function(){ return this.message; },
		
		/**
		 Initializes the cause of this throwable to the specified value. (The cause is the throwable that caused this throwable to get thrown.)
		 This method can be called at most once. It is generally called from within the constructor, or immediately after creating the throwable. 
		 If this throwable was created with Throwable(Throwable) or Throwable(String,Throwable), this method cannot be called even once.
		
		@param cause - the cause (which is saved for later retrieval by the getCause() method). (A null value is permitted, and indicates that the cause is nonexistent or unknown.)
		@return a reference to this Throwable instance.
		@throw
			IllegalArgumentException - if cause is this throwable. (A throwable cannot be its own cause.)
			IllegalStateException - if this throwable was created with Throwable(Throwable) or Throwable(String,Throwable), or this method has already been called on this throwable.
		**/
		initCause : function(cause){
			if(this === cause) throw new Error("cause cannot be the throwable that contains it");
			if(this.cause != null) throw new Error("cause can only be initialized once");
			this.cause = cause;
		},
		
		toString : function(){
			return "type="+ this.getClass().def.name +", message="+this.message + ", cause="+this.cause;
		}
	}
});

module.exports = exports = Throwable;