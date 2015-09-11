/**
 * Created by cailong on 2015/9/8.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../../base');
var hrpp = base.hrpp;
var hismpc = base.hismpc;
var UserBiz = require('../../biz/UserBiz');

var userRouter = function(){
	//用户列表api
	this.get('/user/list', function(req, res, next){
		var query = hrpp(req).query;
		var queryOptions = {};
		query.size ? _.extend(queryOptions, {size: query.size}) : void 0;
		query.page ? _.extend(queryOptions, {page: query.page}) : void 0;
		query.orderBy ? _.extend(queryOptions, {orderBy: query.orderBy}) : void 0;
		query.sort ? _.extend(queryOptions, {sort: query.sort}) : void 0;
		var userBiz = new UserBiz();
		userBiz.getUserList(queryOptions).done(function(ret){
			res.json(ret);
		}).fail(function(err){
			res.json(err);
		});
	});
	this.post('/user', function(req, res, next){
		var body = hrpp(req).body;
		var user = {};
		body.loginname ? _.extend(user, {loginname: body.loginname}) : void 0;
		body.password ? _.extend(user, {password: body.password}) : void 0;
		body.username ? _.extend(user, {username: body.username}) : void 0;
		body.memo ? _.extend(user, {memo: body.memo}) : void 0;
		body.mobile ? _.extend(user, {mobile: body.mobile}) : void 0;
		body.workNum ? _.extend(user, {worknum: body.workNum}) : void 0;

		var userBiz = new UserBiz();
		userBiz.addUser(user).done(function(user){
			res.status(200);
			//返回user, 当数据库读写分离的时候, 能避免, 主从数据同步之前的数据差异问题
			res.json(user);
		}).fail(function(err){
			if(err == 0){
				//conflict 用户名已存在
				res.status(409);
				return res.json({statusCode: 409, type: 'UserAlreadyExists', message: 'user already exists'});
			}
			res.status(500);
			res.json({statusCode: 500, message: 'fail to add user'});
		});
	});
	this.get('/user/:id', function(req, res, next){
		var id = req.params.id;
		var userBiz = new UserBiz();
		userBiz.getUser(id).done(function(user){
			res.status(200);
			res.json(user);
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get user'});
		});
	});
	//重置密码
	this.put('/user/:id/reset-password', function(req, res, next){
		var body = hrpp(req).body;
		var password = body.password;
		var id = req.params.id;
		var userBiz = new UserBiz();
		userBiz.resetPassword(id, password).done(function(user){
			res.status(200);
			res.json({statusCode: 200, message: 'success to reset password'});
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to delete user'});
		});
	});
	//更新密码
	this.put('/user/:id/update-password', function(req, res, next){
		var body = hrpp(req).body;
		var password = body.password;
		var newPassword = body.newPassword;
		var id = req.params.id;
		var userBiz = new UserBiz();
		userBiz.updatePassword(id, password, newPassword).done(function(user){
			res.status(200);
			res.json({statusCode: 200, message: 'success to update password'});
		}).fail(function(err){
			if(err === 0){
				res.status(400);
				return res.json({statusCode: 400, type: 'passwordNotMatch', message: 'password not match'});
			}
			res.status(500);
			res.json({statusCode: 500, message: 'fail to update password'});
		});
	});
	this.put('/user/:id', function(req, res, next){
		var body = hrpp(req).body;
		var id = req.params.id;
		var userBiz = new UserBiz();
		userBiz.modifyUser(id, body).done(function(user){
			res.status(200);
			res.json(user);
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to delete user'});
		});
	});
	this.delete('/user/:id', function(req, res, next){
		var id = req.params.id;
		var userBiz = new UserBiz();
		userBiz.deleteUser(id).done(function(user){
			res.status(200);
			res.json({statusCode: 200, message: 'success to delete user'});
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to delete user'});
		});
	});
};

module.exports = userRouter;