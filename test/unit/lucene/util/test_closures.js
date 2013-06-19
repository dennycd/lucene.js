process.chdir("../../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var clc = require('cli-color');
var logger = require('winston');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');
console.log(clc.reset);


exports.testConstructorClosure = function(test){

	var Cls = defineClass({
		variables : {
			name : null,
			msg  : null
		}, 
			
		construct : function(){
			
			var c1 = function(msg){
				//c2("unknown", msg); 
				c2.call(this,"unknown",msg); // MUST pass this onto c2 for invocation 
			};
			
			var c2 = function(name,msg){
				this.name = name;
				this.msg = msg;
			}
			
			//c1(arguments[0]);
			
			if(arguments.length==1) c1.call(this,arguments[0]); // this gets passed inside c1, so that c1 has this access to the object !!!
			else if(arguments.length==2) c2.apply(this,arguments); 
		}
	})



	var obj = new Cls("dennycd", "hello world");
	test.ok(obj.name == "dennycd" && obj.msg == "hello world");


	var obj2 = new Cls("hello world");
	test.ok(obj2.name == "unknown" && obj2.msg == "hello world", "name="+obj2.name + ", msg="+obj2.msg);
	
	
	test.done();
}
