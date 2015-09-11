/**
 * Created by cailong on 2015/9/10.
 */
/*global require, module*/
'use strict';
var ResourceBiz = require('../../biz/ResourceBiz');
var resource = function(){
	this.get('/resource/list', function(req, res, next){
		var resourceBiz = new ResourceBiz();
		resourceBiz.getAll().done(function(result){
			res.status(200);
			res.json(result);
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get resources'});
		});
	});
};

module.exports = resource;
