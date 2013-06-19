#!/usr/bin/env node
process.chdir("../../");
console.log("switching to directory " + process.cwd());
var util = require('util');
var assert = require('assert');
var nodeunit = require('nodeunit');
var clc = require('cli-color');
var logger = require('winston');


var IOException = require('library/lucene/util/IOException.js');
var Throwable = require('library/lucene/util/Throwable.js');

var exp = new Throwable("hello world from denny");
console.log(exp.toString());

