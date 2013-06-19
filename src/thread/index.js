var Sleep = require('./lib/build/Release/sleep');
var Lockable = require('./Lockable.js');
var Synchronized = require('./Synchronized.js');
var Thread = require('./Thread.js');

module.exports.Lockable = Lockable;
module.exports.Synchronized = Synchronized;
module.exports.Sleep = Sleep;
module.exports.Thread = Thread;



//convinient functions conforming to java thread api

//sleep in miliseconds
module.exports.sleep = Sleep.msleep;
