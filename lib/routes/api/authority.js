/**
 * Created by cailong on 2015/9/10.
 */
/*global require, module*/
'use strict';
var base = require('../../base');
var hrpp = base.hrpp;
var AuthorityBiz = require('../../biz/AuthorityBiz');
var authority = function(){
	this.get('/authority/user/:id', function(req, res, next){
		var userid = req.params.id;
		var authorityBiz = new AuthorityBiz();
		authorityBiz.getAuthResByUserid(userid).done(function(result){
			res.status(200);
			res.json(result);
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get user~s authority'});
		});
	});
	this.post('/authority/user/:id/reset', function(req, res, next){
		var userid = req.params.id;
		var resourceids = req.body.resourceids;
		var authorityBiz = new AuthorityBiz();
		authorityBiz.resetUserAuth(userid, resourceids).done(function(){
			res.status(200);
			res.json({statusCode: 200, message: 'success to reset user~s authority'});
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to reset user~s authority'});
		});
	});
};

module.exports = authority;
