/**
 * Created by cailong on 2015/8/29.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var extend = require('./extend');

//Just a interface for tasks
var Task = function(){
	this.init.apply(this, Array.prototype.slice.call(arguments));
};

_.extend(Task.prototype, {
	init: function(){},
	run: function(){}
});

Task.extend = extend;

module.exports = Task;
