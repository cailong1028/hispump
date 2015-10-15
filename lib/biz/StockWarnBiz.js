/**
 * Created by cailong on 2015/9/13.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../base');
var log = base.log;
var Biz = base.Biz;
var extend = base.extend;
var hismpc = base.hismpc;
var $def = require('jquery-deferred');
//库存告警
var stockWarnValueProto = {
	init: function(){},
	//查询全部告警列表
	loadAllStockWarnList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = "select M.CartName, " +
			"       I.DrugID, " +
			"       I.DrugName, " +
			"       I.Vendor, " +
			"       I.DrugSpec, " +
			"       I.SuitType, " +
			"       B.drugstock " +
			"  FROM DrugInfo I, " +
			"       (SELECT Dc.drugid, Dbb.DrugStock, Dc.CartCode " +
			"          FROM DrugCart Dc " +
			"          LEFT JOIN (SELECT CartCode, DrugID, SUM(DrugStock) DrugStock " +
			"                      from DrugBox " +
			"                     group by CartCode, DrugID) Dbb " +
			"            on Dc.DrugID = Dbb.DrugID " +
			"           and Dc.CartCode = Dbb.CartCode " +
			"         where DrugWarning >= Dbb.Drugstock " +
			"           AND Dc.isDeleted = 0) B, " +
			"       MedCart M " +
			" WHERE I.DRUGID = B.DRUGID " +
			"   and B.CartCode = M.CartCode ";

		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			dtd.resolve(result);
		};
		hismpc.query(sql, queryDone);
		return dtd.promise();
	},

	//根据条件查询告警列表
	loadStockWarnList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = "SELECT I.DrugID, " +
			"       I.DrugName, " +
			"       I.DrugSpec, " +
			"       I.SuitType, " +
			"       I.Vendor, " +
			"       B.drugstock, " +
			"       M.CartName " +
			"  FROM (SELECT Dc.drugid, Dbb.DrugStock, Dc.CartCode " +
			"          FROM (SELECT CartCode, DrugID, DrugStock, DrugWarning " +
			"                  FROM DrugCart " +
			"                 WHERE CartCode = ? " +
			"                   AND isDeleted = 0) Dc " +
			"          LEFT JOIN (SELECT DrugID, SUM(DrugStock) DrugStock " +
			"                      from DrugBox " +
			"                     group by DrugID) Dbb " +
			"            on Dc.DrugID = Dbb.DrugID " +
			"         WHERE Dc.DrugWarning >= Dbb.Drugstock) B " +
			"  LEFT JOIN DrugInfo I " +
			"    On B.DRUGID = I.DRUGID " +
			"  left join MedCart M " +
			"    On B.CartCode = M.CartCode ";

		var where = "  WHERE 1=1  ";

		var values = [];
		//cartCode为空时查询所有的,
		if(!queryOptions.cartCode || queryOptions.cartCode == '0') {
			return this.loadAllStockWarnList(queryOptions);
		} else {
			values.push(queryOptions.cartCode);
		}

		if(queryOptions.suitList && queryOptions.suitList != '0'){
			if(queryOptions.suitList == 'A') {
				where += "  AND I.SuitType IN('瓶','支') ";
			} else {
				where += "  AND I.SuitType NOT IN('瓶','支') ";
			}
		}
		if(queryOptions.drugName && queryOptions.drugName != '0' && queryOptions.drugName != '请输入药品简拼'){
			where += "  AND I.DrugName LIKE '%?%' ";
			values.push(queryOptions.drugName);
		}

		if(queryOptions.cartCode && queryOptions.cartCode != '0'){
			where += " and B.CartCode = ? ";
			values.push(queryOptions.cartCode);
		}

		if(queryOptions.beginTime && queryOptions.beginTime != '0'){
			where += " and B.EXPIREDDATE >= ? ";
			values.push(queryOptions.beginTime);
		}

		if(queryOptions.endTime && queryOptions.endTime != '0'){
			where += " and B.EXPIREDDATE <= ? ";
			values.push(queryOptions.endTime);
		}

		if(queryOptions.drugType && queryOptions.drugType != '0'){
			where += " and B.drugType = ? ";
			values.push(queryOptions.drugType);
		}

		//if(queryOptions.drugList && queryOptions.drugList != '0'){
		//	where += " and B.SUITTYPE = ? ";
		//	values.push(queryOptions.drugList);
		//}

		sql += where;
		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			dtd.resolve(result);
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	}
};

var StockWarnBiz = extend(stockWarnValueProto, Biz);

module.exports = StockWarnBiz;
