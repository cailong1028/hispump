/**
 * Created by cailong on 2015/8/21.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');

var Watcher = function(){
	this.init.apply(this, Array.prototype.slice.call(arguments));
};

_.extend(Watcher.prototype, {
	constructor: Watcher,
	init: function(options){
		this.options = options;
		// registered tasks
		this.registerTasks = {

		};
	},
	registerTask: function(task){
		//TODO
	}
});

module.exports = Watcher;