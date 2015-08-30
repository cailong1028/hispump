/**
 * Created by cailong on 2015/8/27.
 */
/*global require, moduele*/
'use strict';
var _ = require('underscore');
var log = require('./log');
//Events
var Events = {};
var eventsStripper = /\s*,\s*|\s+/;

Events.on = function(name, callback, context){
	var args = arguments;
	if(args.length < 1){
		return log('arguments of Events:on are {name, callback, [context]}');
	}
	if(typeof args[0] !== 'string'){
		return log('');
	}
	if(args.length < 2){
		return log('Events:on need callback');
	}
	if(typeof args[1] !== 'function'){
		return log('callback of Events:on should be function');
	}

	if(eventsStripper.test(name)){
		var names = name.split(eventsStripper);
		for(var i = 0; i < names.length; i++){
			this.registeEvents(this, names[i], callback, context);
		}
	}else{
		this.registeEvents(this, name, callback, context);
	}
};

Events.registeEvents = function(ctx, eventName, callback, context){
	var event, _events = ctx._events = ctx._events || {};
	event = _events[eventName] = _events[eventName] || [];
	event.push({
		callback: callback,
		context: context,
		ctx: ctx
	});
};

Events.trigger = function(eventName){
	var args = arguments, eventNames;
	if(args.length < 1){
		return log('arguments of Events:trigger are {name, [argument1, argument2...]}');
	}
	var event, _events = this._events, event_args = Array.prototype.slice.call(arguments, 1);
	if(!_events) return;
	eventNames = eventName.split(eventsStripper);
	for(var i = 0; i < eventNames.length; i++){
		event = _events[eventNames[i]];
		if(!event) continue;
		for(var j = 0; j < event.length; j++){
			var eventChild = event[j];
			eventChild.callback.apply(eventChild.context || eventChild.ctx, event_args);
		}
	}
};

Events.extend = function(options){
	var EventsSubClass = function(){

	};
	_.extend(EventsSubClass.prototype, Events, options || {});
	return EventsSubClass;
};

module.exports = Events;