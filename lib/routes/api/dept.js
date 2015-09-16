/**
 * Created by cailong on 2015/9/14.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../../base');
var hrpp = base.hrpp;
var hismpc = base.hismpc;
var DeptBiz = require('../../biz/DeptBiz');

var deptRouter = function(){
	//列表api
	this.get('/dept/list', function(req, res, next){
		var query = hrpp(req).query;
		var queryOptions = {};
		query.size ? _.extend(queryOptions, {size: query.size}) : void 0;
		query.page ? _.extend(queryOptions, {page: query.page}) : void 0;
		query.orderBy ? _.extend(queryOptions, {orderBy: query.orderBy}) : void 0;
		query.sort ? _.extend(queryOptions, {sort: query.sort}) : void 0;
		var deptBiz = new DeptBiz();
		deptBiz.getDeptList(queryOptions).done(function(ret){
			res.json(ret);
		}).fail(function(err){
			res.json(err);
		});
	});
	this.get('/dept/:id', function(req, res, next){
		var id = req.params.id;
		var deptBiz = new DeptBiz();
		deptBiz.getDept(id).done(function(dept){
			res.status(200);
			res.json(dept);
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get dept'});
		});
	});
	this.post('/dept', function(req, res, next){
		var body = hrpp(req).body;
		var dept = {};
		body.name ? _.extend(dept, {name: body.name}) : void 0;

		var deptBiz = new DeptBiz();
		deptBiz.addDept(dept).done(function(resDept){
			res.status(200);
			res.json(resDept);
		}).fail(function(err){
			if(err == 0){
				//conflict
				res.status(409);
				return res.json({statusCode: 409, type: 'DeptAlreadyExists', message: 'dept already exists'});
			}
			res.status(500);
			res.json({statusCode: 500, message: 'fail to add dept'});
		});
	});
	this.put('/dept/:id', function(req, res, next){
		var body = hrpp(req).body;
		var id = req.params.id;
		var deptBiz = new DeptBiz();
		deptBiz.modifyDept(id, body).done(function(dept){
			res.status(200);
			res.json(dept);
		}).fail(function(err){
			if(err == 0){
				//conflict
				res.status(409);
				return res.json({statusCode: 409, type: 'DeptAlreadyExists', message: 'dept already exists'});
			}
			res.status(500);
			res.json({statusCode: 500, message: 'fail to modify dept'});
		});
	});
	this.delete('/dept/:id', function(req, res, next){
		var id = req.params.id;
		var deptBiz = new DeptBiz();
		deptBiz.deleteDept(id).done(function(){
			res.status(200);
			res.json({statusCode: 200, message: 'success to delete dept'});
		}).fail(function(){
			res.status(500);
			res.json({statusCode: 500, message: 'fail to delete dept'});
		});
	});
};

module.exports = deptRouter;