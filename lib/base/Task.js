/**
 * Created by cailong on 2015/8/29.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var $def = require('jquery-deferred');
var extend = require('./extend');
var Events = require('./Events');
var log = require('./log');

//Just a interface for tasks
var Task = function(){
	//1: died, 2: running, 3: starting, 4: stopping, 5: unknown
	//默认不以时间判断其是否die, 如果detectDieByTimeout为true, 需要在task子类中init方法中
	//设置this.detectDieTimeout 和 this.lastestExecuteTime
	this.detectDieByTimeout = false;
	this.init.apply(this, Array.prototype.slice.call(arguments));
	this.status = 'died';
	this.on('error', this.stop, this);
	this.name = 'Task-'+ (this.name ? this.name+'-' : '')+new Date().getTime();

};

_.extend(Task.prototype, Events, {
	init: function(){
	},
	whenRun: function(){
		//this is a interface, no function body here
		//must implement method , and must be a dtd function
	},
	run: function(){
		var dtd = new $def.Deferred();
		var currTask = this;
		this.status = 'starting';
		if(!_.isArray(this.whenRun)){
			this.whenRun = [this.whenRun];
		}
		var defs = [];
		_.each(this.whenRun, function(one){
			defs.push(one.call(currTask));
		});
		$def.when.apply($def, defs).done(function(){
			currTask.status = 'running';
			dtd.resolve();
			log.info('run task ['+currTask.name+'] success');
		}).fail(function(err){
			currTask.stop();
			dtd.reject(err);
			log.error('run task ['+currTask.name+'] error: '+err);
		});
		return dtd.promise();
	},
	whenStop: function(){
		//this is a interface, no function body here
		//must implement method , and must be a dtd function
	},
	stop: function(){
		var dtd = new $def.Deferred();
		var currTask = this;
		this.status = 'stopping';
		if(!_.isArray(this.whenStop)){
			this.whenStop = [this.whenStop];
		}
		var defs = [];
		_.each(this.whenStop, function(one){
			defs.push(one.call(currTask));
		});
		$def.when.apply($def, defs).done(function(){
			dtd.resolve();
			currTask.status = 'died';
			log.info('stop task ['+currTask.name+'] success');
		}).fail(function(err){
			//can do nothing here
			dtd.reject(err);
			currTask.status = 'unknown';
			log.error('stop task ['+currTask.name+'] error: '+err);
		});
	}
});

module.exports = Task;
