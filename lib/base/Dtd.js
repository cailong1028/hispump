/**
 * Created by cailong on 2015/8/27.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var Events = require('./Events');
//Dtd
var Dtd = function(){
	//fireChain是function数组
	this.fireChain = [];
};

_.extend(Dtd.prototype, Events, {
	//定义resolve方法触发done内执行的fireChain的 ctx 为arguments的最后一个参数,如果arguments.length为0或1,则默认ctx为this
	resolve: function(){
		var argLen = arguments.length;
		var ctx = this,
			args = arguments;
		/*if(argLen === 1) {
		 args = arguments[0];
		 }else */
		if(argLen > 1){
			ctx = arguments[argLen-1];
			args = Array.prototype.slice.apply(arguments, [0, argLen-1]);
		}
		for(var i = 0; i< this.fireChain.length; i++){
			this.fireChain[i].apply(ctx, args);
		}
	},
	reject: function(){
		//TODO
	},
	done: function(doneFunc){
		if(_.isFunction(doneFunc)){
			this.fireChain.push(doneFunc);
		}else if(_.isArray(doneFunc)){
			this.fireChain = this.fireChain.concat(doneFunc);
		}
		return this;
	},
	promise: function(){
		//TODO
		return this;
	}
});

module.exports = Dtd;