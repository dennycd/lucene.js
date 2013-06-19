process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');
var defineClass = require('library/class/defineClass.js');
var Class = require('library/class/Class.js');

console.log(clc.reset);
//should do this before handle
module.exports = exports = {
	setUp: function(callback) {
		callback();
	},
	tearDown: function(callback) {
		callback();
	}
};


var BaseClass = defineClass({
	name : "BaseClass",
	construct : function(){
		console.log("BaseClass::construct");
	}, 
	methods : {
		
		foo : function(p1, p2){
			console.log("BaseClass::foo p1="+p1+",p2="+p2);
			return 2;
		},
		
		foo : function(p1){
			console.log("BaseClass::foo  p1="+p1);
			return 1;
		},
	}
});

var SubClass = defineClass({
	name : "SubClass",
	construct : function(){
		console.log("SubClass::construct");
	},
	methods : {
		foo : function(){
			console.log("SubClass::foo");
			return 0;
		}
	}
})


var OVERRIDE = function(funcName){
	return funcName + "_1";
}

exports.testFunc = function(test) {

	var obj = {
		eval('OVERRIDE("foo")') : function(){ console.log("this is a function");}
	};
	
	obj.foo_1();


/*
	var obj = new BaseClass();
	
	test.equal(obj.foo(), 0);
	test.equal(obj.foo("x"), 1);
	test.equal(obj.foo("x","y"),2);
*/

	test.done();
};