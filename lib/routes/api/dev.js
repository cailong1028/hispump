/**
 * Created by cailong on 2015/9/13.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var _s = require('underscore.string');
var base = require('../../base');
var hrpp = base.hrpp;
var hismpc = base.hismpc;
var DevBiz = require('../../biz/DevBiz');

var devRouter = function(){
	//列表api, 包含于服务器连接状态
	//status 必须为 1: 在线, 2: 离线, 否则报404
	this.get('/dev/list/status', function(req, res, next){
		var query = hrpp(req).query;
		var queryOptions = {};
		if(!query.status || !(query.status == '1' || query.status == '2')){
			res.status(404);
			return res.json({statusCode: 404, message: 'bad request'});
		}
		_.extend(queryOptions, {status: query.status});
		query.type ? _.extend(queryOptions, {type: query.type}) : void 0;
		query.size ? _.extend(queryOptions, {size: query.size}) : void 0;
		query.page ? _.extend(queryOptions, {page: query.page}) : void 0;
		query.orderBy ? _.extend(queryOptions, {orderBy: query.orderBy}) : void 0;
		query.sort ? _.extend(queryOptions, {sort: query.sort}) : void 0;
		query.dept_code ? _.extend(queryOptions, {dept_code: query.dept_code}) : void 0;
		var devBiz = new DevBiz();
		devBiz.getStatusDevList(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dev list'});
		});
	});
	this.get('/dev/status/info', function(req, res, next){
		var devBiz = new DevBiz();
		devBiz.getStatusDevInfo().done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dev status info'});
		});
	});

	//列表suggest
	this.get('/dev/list/suggest', function(req, res, next){

		var query = hrpp(req).query;
		var queryOptions = {};

		if(!query.term || _s.trim(query.term) === ''){
			res.status = 500;
			return res.json({statusCode: 500});
		}

		_.extend(queryOptions, {term: query.term});
		_.extend(queryOptions, {size: 10});
		_.extend(queryOptions, {page: 0});

		var devBiz = new DevBiz();
		devBiz.suggestDevList(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dev list'});
		});
	});

	//列表api
	this.get('/dev/list', function(req, res, next){
		var query = hrpp(req).query;
		var queryOptions = {};
		query.term ? _.extend(queryOptions, {term: query.term}) : void 0;
		query.type ? _.extend(queryOptions, {type: query.type}) : void 0;
		query.size ? _.extend(queryOptions, {size: query.size}) : void 0;
		query.page ? _.extend(queryOptions, {page: query.page}) : void 0;
		query.orderBy ? _.extend(queryOptions, {orderBy: query.orderBy}) : void 0;
		query.sort ? _.extend(queryOptions, {sort: query.sort}) : void 0;
		query.dept_code ? _.extend(queryOptions, {dept_code: query.dept_code}) : void 0;
		var devBiz = new DevBiz();
		devBiz.getDevList(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dev list'});
		});
	});

	//未分配科室的设备列表
	this.get('/dev/unassign/list', function(req, res, next){
		var query = hrpp(req).query;
		var queryOptions = {};
		query.type ? _.extend(queryOptions, {type: query.type}) : void 0;
		var devBiz = new DevBiz();
		devBiz.getUnassignDevList(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dev list'});
		});
	});
	this.post('/dev/assign', function(req, res, next){
		var body = hrpp(req).body;
		var devBiz = new DevBiz();
		devBiz.assingDev(body.devids, body.dept_code).done(function(ret){
			res.status(200);
			res.json({});
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to assign dev to dept'});
		});
	});
	this.put('/dev/unAssingDev/:id', function(req, res, next){
		var id = req.params.id;
		var devBiz = new DevBiz();
		devBiz.unAssingDev(id).done(function(ret){
			res.status(200);
			res.json({});
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to unassign dev'});
		});
	});
	this.get('/dev/:id', function(req, res, next){
		var id = req.params.id;
		var devBiz = new DevBiz();
		devBiz.getDev(id).done(function(dev){
			res.status(200);
			res.json(dev);
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dev'});
		});
	});
	this.post('/dev', function(req, res, next){
		var body = hrpp(req).body;
		var dev = {};
		body.id ? _.extend(dev, {id: body.id}) : void 0;
		body.name ? _.extend(dev, {cartname: body.name}) : void 0;
		body.type ? _.extend(dev, {type: parseInt(body.type, 10)}) : void 0;
		body.dept_code ? _.extend(dev, {dept_code: body.dept_code}) : void 0;

		var devBiz = new DevBiz();
		devBiz.addDev(dev).done(function(resDev){
			res.status(200);
			//返回dev, 当数据库读写分离的时候, 能避免, 主从数据同步之前的数据差异问题
			res.json(resDev);
		}).fail(function(err){
			if(err == 0){
				//conflict
				res.status(409);
				return res.json({statusCode: 409, type: 'DevAlreadyExists', message: 'dev already exists'});
			}
			res.status(500);
			res.json({statusCode: 500, message: 'fail to add dev'});
		});
	});
	this.put('/dev/:id', function(req, res, next){
		var body = hrpp(req).body;
		var id = req.params.id;
		var devBiz = new DevBiz();
		body.type = parseInt(body.type);
		devBiz.modifyDev(id, body).done(function(dev){
			res.status(200);
			res.json(dev);
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to modify dev'});
		});
	});
	this.delete('/dev/:id', function(req, res, next){
		var id = req.params.id;
		var devBiz = new DevBiz();
		devBiz.deleteDev(id).done(function(dev){
			res.status(200);
			res.json({statusCode: 200, message: 'success to delete dev'});
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to delete dev'});
		});
	});

	//设备类型
	this.get('/dev-type', function(req, res, next){
		var devBiz = new DevBiz();
		devBiz.getDevType().done(function(devType){
			res.status(200);
			res.json(devType);
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dev type'});
		});
	});
};

module.exports = devRouter;