/**
 * Created by cailong on 2015/11/3.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../../base');
var hrpp = base.hrpp;
var hismpc = base.hismpc;
var DevdrugBiz = require('../../biz/DevdrugBiz');

var devDrugRouter = function () {

	//add
	this.post('/devdrug', function (req, res, next) {
		var body = hrpp(req).body;
		var devdrug = {};
		//body.id ? _.extend(devDrug, {id: body.id}) : void 0;
		body.cartid ? _.extend(devdrug, {cartcode: body.cartid}) : void 0;
		body.drugid ? _.extend(devdrug, {drugid: body.drugid}) : void 0;
		body.drugwarning ? _.extend(devdrug, {drugwarning: body.drugwarning}) : void 0;
		body.drugoverflow ? _.extend(devdrug, {drugoverflow: body.drugoverflow}) : void 0;

		var devDrugBiz = new DevdrugBiz();
		devDrugBiz.addDevdrug(devdrug).done(function (resDevDrug) {
			res.status(200);
			//返回dev, 当数据库读写分离的时候, 能避免, 主从数据同步之前的数据差异问题
			res.json(resDevDrug);
		}).fail(function (err) {
			if (err == 0) {
				//conflict
				res.status(409);
				return res.json({statusCode: 409, type: 'DevdrugAlreadyExists', message: 'devdrug already exists'});
			}
			res.status(500);
			res.json({statusCode: 500, message: 'fail to add devdrug'});
		});
	});

	//get list by params
	this.get('/devdrug/list', function (req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.deptid ? _.extend(queryOptions, {deptid: query.deptid}) : void 0;
		query.cartid ? _.extend(queryOptions, {cartid: query.cartid}) : void 0;
		query.drugid ? _.extend(queryOptions, {drugid: query.drugid}) : void 0;
		query.drugwarning ? _.extend(queryOptions, {drugwarning: parseInt(query.drugwarning)}) : void 0;
		query.drugoverflow ? _.extend(queryOptions, {drugoverflow: parseInt(query.drugoverflow)}) : void 0;
		//pagenation
		query.size ? _.extend(queryOptions, {size: query.size}) : void 0;
		query.page ? _.extend(queryOptions, {page: query.page}) : void 0;
		query.orderBy ? _.extend(queryOptions, {orderBy: query.orderBy}) : void 0;
		query.sort ? _.extend(queryOptions, {sort: query.sort}) : void 0;

		var devDrugBiz = new DevdrugBiz();
		devDrugBiz.getDevdrugList(queryOptions).done(function (ret) {
			res.status(200);
			res.json(ret);
		}).fail(function (err) {
			res.status(500);
			res.json({statusCode: 500, message: 'fail to get devDrug list'});
		});
	});
//put modify
	this.put('/devdrug/:id', function (req, res, next) {
		var body = hrpp(req).body;
		var id = req.params.id;
		var devdrugBiz = new DevdrugBiz();
		body.type = parseInt(body.type);
		devdrugBiz.modifyDevdrug(id, body).done(function (dev) {
			res.status(200);
			res.json(dev);
		}).fail(function () {
			res.status(500);
			res.json({statusCode: 500, message: 'fail to modify devdrug'});
		});
	});
	this.delete('/devdrug/:id', function (req, res, next) {
		var id = req.params.id;
		var devdrugBiz = new DevdrugBiz();
		devdrugBiz.deleteDevdrug(id).done(function (devdrug) {
			res.status(200);
			res.json({statusCode: 200, message: 'success to delete devdrug'});
		}).fail(function () {
			res.status(500);
			res.json({statusCode: 500, message: 'fail to delete devdrug'});
		});
	});
};

module.exports = devDrugRouter;
