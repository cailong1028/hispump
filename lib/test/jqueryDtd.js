/**
 * Created by cailong on 2015/8/28.
 */
/*global require, module*/
'use strict';
//验证jquery deferred, 任意一个dtd.reject之后 都会进入fail, 并且在一个reject之后,后面的dtd不会执行
//resolve和reject的时候可以带参数
var $ = require('jquery-deferred');
var _ = require('underscore');
var i = 0;
var test = function(){
	var dtd = new $.Deferred();
	_.delay(function(){
		i++;
		dtd.resolve();
	}, 0);
	return dtd.promise();
};
var test2 = function(){
	var dtd = new $.Deferred();
	_.delay(function(){
		i++;
		dtd.reject({id: 1, msg: 'err msg'});
	}, 0);
	return dtd.promise();
};
var test3 = function(){
	var dtd = new $.Deferred();
	_.delay(function(){
		i++;
		dtd.resolve();
	}, 0);
	return dtd.promise();
};
var defs = [];
defs.push(test(), test2(), test3());
$.when.apply($, defs).done(function(res){
	console.log('success-->'+res);
	console.log('done-->'+i);
}).fail(function(err){
	console.log('err-->'+err.msg);
	console.log('fail-->'+i);
});

var test4 = function(){
	var dtd = new $.Deferred();
	_.delay(function(){
		i++;
		dtd.resolve(11);
	}, 0);
	return dtd.promise();
};
test4().done(function(err){
	console.log(err);
	console.log(i);
});
