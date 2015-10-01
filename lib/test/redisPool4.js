/**
 * Created by cailong on 2015/9/6.
 */
/*global require, moduel*/
'use strict';
var base = require('../base');
var hisrp = base.hisrp();
var get = function(){
	var session = hisrp.get('test2').done(function(res){
		console.log('res is --> '+res);
	}).fail(function(err){
		console.log(err);
	});
};
get();