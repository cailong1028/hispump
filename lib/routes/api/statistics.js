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
var DrugReturnBiz =  require('../../biz/DrugReturnBiz');
var DrugAppendBiz = require('../../biz/DrugAppendBiz');
var AppendSheetBiz = require('../../biz/AppendSheetBiz');
var statistics = function () {
	this.get('/statistics/drug-supplement-detail', function (req, res, next) {
		var mock = {
			"content": [{
				"id": "C6C2819154E000012FC8EF00140E1A3F",
				"drugname": "cl2",
				"specifications": "3d4f2bf07dc1be38b20cd6e46949a1071f9d0e3d",
				"unit": "88",
				"stocksize": "2015-09-12T02:38:54.000Z",
				"drugsupplementnumber": "11",
				"periodofvalidity": "111",
				"operator": "1"
			}], "page": {"size": 10, "number": 0, "totalElements": 12, "totalPages": 2}
		};
		res.json(mock);
	});

	//效期告警
	this.get('/statistics/drug-period-expire', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.beginTime ? _.extend(queryOptions, {beginTime: query.beginTime}) : void 0;
		query.endTime ? _.extend(queryOptions, {endTime: query.endTime}) : void 0;
		query.cartCode ? _.extend(queryOptions, {cartCode: query.cartCode}) : void 0;
		query.devType ? _.extend(queryOptions, {devType: query.devType}) : void 0;
		query.drugid ? _.extend(queryOptions, {drugid: query.drugid}) : void 0;
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
		query.devType ? _.extend(queryOptions, {devType: query.devType}) : void 0;
		query.drugid ? _.extend(queryOptions, {drugid: query.drugid}) : void 0;
		query.deptid ? _.extend(queryOptions, {deptid: query.deptid}) : void 0;
		var biz = new StockWarnBiz();
		biz.loadStockWarnList(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});

	//生成所有补药清单
	this.get('/statistics/generate-all-append-sheet', function(req, res, next){
		var biz = new StockWarnBiz();
		biz.generateAllAppendSheet(req.session.profile.userInfo.id).done(function(ret){
			res.status(200);
			res.json({statusCode: 200});
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, errMsg: err});
		});
	});

	//生成根据条件查询出来的所有补药清单
	this.get('/statistics/generate-append-sheet-by-query', function(req, res, next){
		var query = hrpp(req).query;
		var queryOptions = {};
		query.beginTime ? _.extend(queryOptions, {beginTime: query.beginTime}) : void 0;
		query.endTime ? _.extend(queryOptions, {endTime: query.endTime}) : void 0;
		query.cartCode ? _.extend(queryOptions, {cartCode: query.cartCode}) : void 0;
		query.devType ? _.extend(queryOptions, {devType: query.devType}) : void 0;
		query.drugid ? _.extend(queryOptions, {drugid: query.drugid}) : void 0;
		query.deptid ? _.extend(queryOptions, {deptid: query.deptid}) : void 0;
		var biz = new StockWarnBiz();
		biz.generateAppendSheetByQuery(req.session.profile.userInfo.id, queryOptions).done(function(ret){
			res.status(200);
			res.json({statusCode: 200});
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, errMsg: err});
		});
	});

	//生成选中的库存告警的补药清单(前面的两个生成补药清单是get方式，此处是post方式的原因是传输的数据量可能很大)
	this.post('/statistics/generate-append-sheet-by-check', function(req, res, next){
		var warnList = hrpp(req).body.checkedWarnList;
		var biz = new StockWarnBiz();
		biz.generateAppendSheetByCheck(req.session.profile.userInfo.id, warnList).done(function(ret){
			res.status(200);
			res.json({statusCode: 200});
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, errMsg: err});
		});
	});

	//不再根据库存告警，而是选择设备后生成指定设备的补药清单
	this.post('/statistics/generate-append-sheet', function(req, res, next){
		var cartcodeList = hrpp(req).body.cartcodeList;
		var biz = new AppendSheetBiz();
		biz.generateAppendSheet(req.session.profile.userInfo.id, cartcodeList).done(function(ret){
			res.status(200);
			res.json({statusCode: 200});
		}).fail(function(err){
			res.status(500);
			res.json({statusCode: 500, errMsg: err});
		});
	});

	//查询补药清单列表, 分页查询
	this.get('/statistics/append-sheet', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.beginTime ? _.extend(queryOptions, {beginTime: query.beginTime}) : void 0;
		query.endTime ? _.extend(queryOptions, {endTime: query.endTime}) : void 0;
		query.cartCode ? _.extend(queryOptions, {cartCode: query.cartCode}) : void 0;
		query.devType ? _.extend(queryOptions, {devType: query.devType}) : void 0;
		query.drugid ? _.extend(queryOptions, {drugid: query.drugid}) : void 0;
		query.sheetstatus ? _.extend(queryOptions, {sheetstatus: query.sheetstatus}) : void 0;
		//pagenation
		query.size ? _.extend(queryOptions, {size: query.size}) : void 0;
		query.page ? _.extend(queryOptions, {page: query.page}) : void 0;
		query.orderBy ? _.extend(queryOptions, {orderBy: query.orderBy}) : void 0;
		query.sort ? _.extend(queryOptions, {sort: query.sort}) : void 0;
		var biz = new AppendSheetBiz();
		biz.getAppendSheetList(queryOptions).done(function(ret){
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


	//补药记录
	this.get('/statistics/drug-append', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.beginTime ? _.extend(queryOptions, {beginTime: query.beginTime}) : void 0;
		query.endTime ? _.extend(queryOptions, {endTime: query.endTime}) : void 0;
		query.cartCode ? _.extend(queryOptions, {cartCode: query.cartCode}) : void 0;
		query.devType ? _.extend(queryOptions, {devType: query.devType}) : void 0;
		query.drugid ? _.extend(queryOptions, {drugid: query.drugid}) : void 0;
		//pagenation
		query.size ? _.extend(queryOptions, {size: query.size}) : void 0;
		query.page ? _.extend(queryOptions, {page: query.page}) : void 0;
		query.orderBy ? _.extend(queryOptions, {orderBy: query.orderBy}) : void 0;
		query.sort ? _.extend(queryOptions, {sort: query.sort}) : void 0;
		var biz = new DrugAppendBiz();
		biz.getDrugAppend(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});

	//取药记录
	this.get('/statistics/drug-return-summary-8', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.drugReduceWhere ? _.extend(queryOptions, {drugReduceWhere: query.drugReduceWhere}) : void 0;
		query.userInfowhere  ? _.extend(queryOptions, {userInfowhere: query.userInfowhere}) : void 0;
		query.drugInfowhere  ? _.extend(queryOptions, {drugInfowhere: query.drugInfowhere}) : void 0;

		var biz = new DrugReturnBiz();
		biz.getDrugReturnSummary8(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});

	//取药记录
	this.get('/statistics/drug-return-summary-9', function(req, res, next) {
		var query = hrpp(req).query;
		var queryOptions = {};
		query.where ? _.extend(queryOptions, {where: query.where}) : void 0;
		var biz = new DrugReturnBiz();
		biz.getDrugReturnSummary9(queryOptions).done(function(ret){
			res.status(200);
			res.json(ret);
		}).fail(function(err){
			res.status(500);
			res.json(err);
		});
	});
};

module.exports = statistics;
