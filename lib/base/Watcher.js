/**
 * Created by cailong on 2015/8/21.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var log = require('./log');
var debug = require('../../conf/task').debug;

var Watcher = function(){
	this.init.apply(this, Array.prototype.slice.call(arguments));
};

_.extend(Watcher.prototype, {
	constructor: Watcher,
	intervalTime: 10000,
	init: function(options){
		this.scanTimes = 0;
		var watcher = this;
		this.options = options;
		// registered tasks
		this.registerTasks = {};
		setInterval(function(){
			watcher.scanTask();
		}, this.intervalTime);
	},
	addTask: function(task){
		this.registerTasks[task.name] =  {
			task: task,
			constructor: task.constructor
		};
	},
	scanTask: function(){
		var keys = _.keys(this.registerTasks);
		if(debug){
			log.info('Watch tasks ['+(++this.scanTimes)+'] times, '+ 'there are ['+keys.length+'] tasks in watching');
		}
		var watcher = this;
		_.each(keys, function(oneTaskName){
			var taskObj = watcher.registerTasks[oneTaskName];
			var oneTask = taskObj.task;
			//系统未知原因造成oneTask被删除的情况下
			if(!oneTask){
				return this.restartTaskByConstructor(oneTaskName, taskObj.constructor);
			}
			if(oneTask.status === 'died' || oneTask.status === 'unknown'){
				log.warn('task ' + oneTask.name + ' had died, now restarting it, and will add it to watcher task list auto!');
				watcher.restartTask();
				return;
			}
			var now = new Date().getTime();
			if(oneTask.detectDieByTimeout && (now - oneTask.lastestExecuteTime) > oneTask.detectDieTimeout){
				if(oneTask.debug) {
					log.warn('task ' + oneTask.name + ' may died, now restarting it, and will add it to watcher task list auto!');
				}
				watcher.restartTask(oneTask);
			}
		});
	},
	restartTask: function(task){
		//remove before task
		//restart task
		//add new task to watcher
		var newTask = new task.constructor();
		delete this.registerTasks[task.name];
		task.stop();
		newTask.run();
		this.addTask(newTask);
	},
	restartTaskByConstructor: function(oneTaskName, constructor){
		//remove before task
		//restart task
		//add new task to watcher
		var newTask = new constructor();
		delete this.registerTasks[oneTaskName];
		newTask.run();
		this.addTask(newTask);
	}
});

module.exports = Watcher;