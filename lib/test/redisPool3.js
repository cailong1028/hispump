/**
 * Created by cailong on 2015/9/6.
 */
/*global require, moduel*/
'use strict';
var base = require('../base');
var hisrp = base.hisrp();

//redis get, set, expire test
var set = hisrp.set('test', {id: '1'}).done(function(res){
	console.log('set done res is -->'+res);
	get();
	hisrp.expire('test', 2).done(function(res){
		console.log('expire done res is -->'+res);
		setTimeout(function(){
			get();
		}, 2000)
	});

}).fail(function(err){
	console.log(err);
});

var get = function(){
	var session = hisrp.get('test').done(function(res){
		console.log('res is --> '+res);
	}).fail(function(err){
		console.log(err);
	});
};
