/**
 * Created by cailong on 2015/10/8.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../../base');
var hrpp = base.hrpp;
var ExpiredWarnBiz = require('../../biz/ExpiredWarnBiz');
var StockWarnBiz = require('../../biz/StockWarnBiz');
var DrugListBiz = require('../../biz/DrugListBiz');
var DrugCartBiz = require('../../biz/DrugCartBiz');
var ReturnBottleBiz = require('../../biz/ReturnBottleBiz');
var statistics = function () {
	this.get('/statistics/drug-supplement-detail', function (req, res, next) {
		var moke = {
			"content": [{
				"id": "C6C2819154E000012FC8EF00140E1A3F",
				"drugname": "cl2",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "88",
				"stocksize": "2015-09-12T02:38:54.000Z",
				"drugsupplementnumber": "11",
				"periodofvalidity": "111",
				"operator": "1"
			}, {
				"id": "C6C1A899E6200001B04A73A81A9A3300",
				"drugname": "6",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "6",
				"stocksize": "2015-09-09T11:27:08.000Z",
				"drugsupplementnumber": "",
				"periodofvalidity": "6",
				"operator": "6"
			}, {
				"id": "C6C1A89714900001C0EA1C004C802EF0",
				"drugname": "5",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "5",
				"stocksize": "2015-09-09T11:26:56.000Z",
				"drugsupplementnumber": null,
				"periodofvalidity": null,
				"operator": null
			}, {
				"id": "C6C1A89408C00001EC711FF016F0120D",
				"drugname": "4",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "4",
				"stocksize": "2015-09-09T11:26:44.000Z",
				"drugsupplementnumber": null,
				"periodofvalidity": null,
				"operator": null
			}, {
				"id": "C6C1A87191A000018D3B1FC013901436",
				"drugname": "3",
				"specifications": "0e03c6205ea671d7d41a0e3aabfc9d15d97e5ed3",
				"unit": "3",
				"stocksize": "2015-09-09T11:24:23.000Z",
				"drugsupplementnumber": "3",
				"periodofvalidity": "3",
				"operator": "3"
			}, {
				"id": "C6C1A8657EA00001AAEDD56EC856AF50",
				"drugname": "2",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "2",
				"stocksize": "2015-09-09T11:23:33.000Z",
				"drugsupplementnumber": null,
				"periodofvalidity": null,
				"operator": null
			}, {
				"id": "C6C1A8308770000144C2E37010809D50",
				"drugname": "1",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "1",
				"stocksize": "2015-09-09T11:19:56.000Z",
				"drugsupplementnumber": null,
				"periodofvalidity": null,
				"operator": null
			}, {
				"id": "C6C1A81D7C100001B6A0790019CDD610",
				"drugname": "ceshi",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "1",
				"stocksize": "2015-09-09T11:18:38.000Z",
				"drugsupplementnumber": null,
				"periodofvalidity": null,
				"operator": null
			}, {
				"id": "C6C1994B96800001161D51801D907090",
				"drugname": "cailong",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "蔡龙2",
				"stocksize": "2015-09-09T06:59:38.000Z",
				"drugsupplementnumber": "111",
				"periodofvalidity": "巍峨",
				"operator": "1"
			}, {
				"id": "2",
				"drugname": "xjl",
				"specifications": "356a192b7913b04c54574d18c28d46e6395428ab",
				"unit": "徐佳磊",
				"stocksize": "2015-09-08T16:12:04.000Z",
				"drugsupplementnumber": "88888888",
				"periodofvalidity": "开发人员",
				"operator": "2"
			}], "page": {"size": 10, "number": 0, "totalElements": 12, "totalPages": 2}
		};
		var query = hrpp(req).query;
		res.json(moke);
	});

	//效期告警
	this.get('/statistics/drug-period-expire', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.beginTime ? _.extend(queryOptions, {beginTime: query.beginTime}) : void 0;
		query.endTime ? _.extend(queryOptions, {endTime: query.endTime}) : void 0;
		query.cartCode ? _.extend(queryOptions, {cartCode: query.cartCode}) : void 0;
		query.drugType ? _.extend(queryOptions, {drugType: query.drugType}) : void 0;
		query.drugList ? _.extend(queryOptions, {drugList: query.drugList}) : void 0;
		query.suitList ? _.extend(queryOptions, {suitList: query.suitList}) : void 0;
		query.drugName ? _.extend(queryOptions, {drugName: query.drugName}) : void 0;
		var biz = new ExpiredWarnBiz();
		biz.loadExpiredWarnList(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});

	//库存告警
	this.get('/statistics/drug-stock-amount', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.beginTime ? _.extend(queryOptions, {beginTime: query.beginTime}) : void 0;
		query.endTime ? _.extend(queryOptions, {endTime: query.endTime}) : void 0;
		query.cartCode ? _.extend(queryOptions, {cartCode: query.cartCode}) : void 0;
		query.drugType ? _.extend(queryOptions, {drugType: query.drugType}) : void 0;
		query.drugList ? _.extend(queryOptions, {drugList: query.drugList}) : void 0;
		query.suitList ? _.extend(queryOptions, {suitList: query.suitList}) : void 0;
		query.drugName ? _.extend(queryOptions, {drugName: query.drugName}) : void 0;
		var biz = new StockWarnBiz();
		biz.loadStockWarnList(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});

	//滞留药品
	this.get('/statistics/drug-retention', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.where ? _.extend(queryOptions, {where: query.where}) : void 0;
		var biz = new DrugListBiz();
		biz.getDrugReduce(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});

	//库存盘点
	this.get('/statistics/drug-cart', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.beginTime ? _.extend(queryOptions, {beginTime: query.beginTime}) : void 0;
		query.endTime ? _.extend(queryOptions, {endTime: query.endTime}) : void 0;
		query.cartCode ? _.extend(queryOptions, {cartCode: query.cartCode}) : void 0;
		query.drugType ? _.extend(queryOptions, {drugType: query.drugType}) : void 0;
		query.drugList ? _.extend(queryOptions, {drugList: query.drugList}) : void 0;
		query.suitList ? _.extend(queryOptions, {suitList: query.suitList}) : void 0;
		query.drugName ? _.extend(queryOptions, {drugName: query.drugName}) : void 0;
		var biz = new DrugCartBiz();
		biz.loadDrugCartByCartCode(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});

	//安瓶盘点
	this.get('/statistics/return-bottle', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.cartCode ? _.extend(queryOptions, {cartCode: query.cartCode}) : void 0;
		var biz = new ReturnBottleBiz();
		biz.getReturnBottleListSummary(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});
};

module.exports = statistics;
