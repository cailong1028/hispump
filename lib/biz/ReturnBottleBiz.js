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

	getReturnBottleListSummary: function(queryOptions){
		var dtd = new $def.Deferred();
		var values = [];
		var sql = "select aa.*,cc.Vendor,cc.DrugName,cc.DrugSpec,cc.SuitType from (select b.DrugID,SUM(a.ReturnCount_Fact) as ReturnCount_Fact,sum(a.ReturnCount)as ReturnCount  from( select Reduce_code,Return_Indicator,ReturnCount_Fact,ReturnCount,ReturnDate  from ReturnBottle  where IsReturnDrug = 0 and ReturnDate is null  Union all  select Reduce_code,Return_Indicator,ReturnCount_Fact,ReturnCount,ReturnDate from ReturnBottle  where IsReturnDrug = 0           " ;

		var sqlTime =  "select  IFNULL(LastClearTime, now() - 365) as LastClearTime, " +
			"       IFNULL(CurrentClearTime, now()) as CurrentClearTime " +
			"  from DrugBoxClear " +
			" where Operate = '0' " +
			"   and CartCode = ? " +
			" order by ID desc limit 1 ";
		var valuesTime = [];
		if(queryOptions.cartCode && queryOptions.cartCode != '0'){
			valuesTime.push(queryOptions.cartCode);
			var queryTimeDone = function(err, result){
				if(err){
					dtd.reject(500);
					return;
				}
				if(result.length > 0) {
					sql += " and (ReturnDate BETWEEN ? AND ?)  ";
					values.push(result[0].LastClearTime);
					values.push(result[0].CurrentClearTime);
				}
				sql += " ) a  inner join DrugReduce b on a.Reduce_code = b.Reduce_Code  ";

				sql += " where b.CartCode = ? ";
				values.push(queryOptions.cartCode);

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
			};
			hismpc.query(sqlTime, valuesTime, queryTimeDone);
		} else {
			sql += " ) a  inner join DrugReduce b on a.Reduce_code = b.Reduce_Code  ";
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
		}
		return dtd.promise();
	}
};

var ReturnBottleBiz = extend(returnBottleProto, Biz);

module.exports = ReturnBottleBiz;
