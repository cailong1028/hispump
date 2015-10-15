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
//安瓶盘点
var returnBottleProto = {
	init: function(){},
	//查询最新的时间
	getLastClearTime: function(queryOptions){
		var dtd = new $def.Deferred();
		var values = [];
		var sql = "select  ifnull(LastClearTime, now() - 365) as LastClearTime, " +
			"       IFNULL(CurrentClearTime, now()) as CurrentClearTime " +
			"  from DrugBoxClear " +
			" where Operate = '0' " +
			"   and CartCode = ? " +
			" order by ID desc limit 1 ";
		values.push(queryOptions.cartCode);

		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			dtd.resolve(result);
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	},
	getReturnBottleListSummary: function(queryOptions){
		var dtd = new $def.Deferred();
		var values = [];
		var sql = "select aa.*,cc.Vendor,cc.DrugName,cc.DrugSpec,cc.SuitType from (select b.DrugID,SUM(a.ReturnCount_Fact) as ReturnCount_Fact,sum(a.ReturnCount)as ReturnCount  from( select Reduce_code,Return_Indicator,ReturnCount_Fact,ReturnCount,ReturnDate  from ReturnBottle  where IsReturnDrug = 0 and ReturnDate is null  Union all  select Reduce_code,Return_Indicator,ReturnCount_Fact,ReturnCount,ReturnDate from ReturnBottle  where IsReturnDrug = 0   ) a  inner join DrugReduce b on a.Reduce_code = b.Reduce_Code   " ;

		if(queryOptions.cartCode && queryOptions.cartCode != '0'){
			sql += " where b.CartCode = ? ";
			values.push(queryOptions.cartCode);
		}
		sql += " group by b.DrugID ";
		sql += " ) aa  left join DrugInfo cc on aa.DrugID = cc.DrugID";

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

var ReturnBottleBiz = extend(returnBottleProto, Biz);

module.exports = ReturnBottleBiz;
