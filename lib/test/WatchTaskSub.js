/**
 * Created by cailong on 2015/9/2.
 */

/*global require*/
var _ = require('underscore');
var base = require('../base');
var Task = require('./../base/Task');
var extend = require('./../base/extend');
var $def = require('jquery-deferred');
var log = require('./../base/log');
var Watcher = base.Watcher;

var TaskSub = extend({
	init: function(){
		this.name = 'testsub';
	},
	whenRun: function(){
		var dtd = new $def.Deferred();
		_.delay(function(){
			dtd.resolve();
		}, 0);
		return dtd.promise();
	},
	whenStop: function(){
		var dtd = new $def.Deferred();
		_.delay(function(){
			dtd.resolve();
		}, 0);
		return dtd.promise();
	}
}, Task);

var sub = new TaskSub();

sub.run().done(function(){
	log.info(sub.name+' status is '+sub.status);
	_.delay(function(){
		sub.status = 'died';
		log.error('change sub status, and now is: '+sub.status);
	}, 1000);
});

var watcher = new Watcher();
watcher.addTask(sub);

module.exports = TaskSub;