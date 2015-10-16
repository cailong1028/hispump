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
var drugReturnProto = {
	init: function(){},
	//取药记录汇总
	getDrugReturnSummary9: function(queryOptions){
		var dtd = new $def.Deferred();
		var values = [];
		var sql = "SELECT " +
			"	c.DrugID, " +
			"	b.DrugName, " +
			"	b.DrugSpec, " +
			"	c.ReturnCount, " +
			"	b.SuitType, " +
			"	b.Vendor " +
			"FROM " +
			"	( " +
			"		SELECT " +
			"			DrugID, " +
			"			sum(ReturnCount) AS ReturnCount " +
			"		FROM " +
			"			DrugReturn a  ";

		if(queryOptions.where && queryOptions.where != '0') {
			sql += queryOptions.where;
		}
		sql += "		GROUP BY " +
			"			a.DrugID " +
			"	) AS c " +
			"LEFT JOIN DrugInfo b ON c.DrugID = b.DrugID ";

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
    //取药记录汇总
    getDrugReturnSummary8: function(queryOptions){
        var dtd = new $def.Deferred();
        var values = [];
        var sql = "SELECT " +
            "	c.DrugID, " +
            "	b.DrugName, " +
            "	b.DrugSpec, " +
            "	c.DrugCount, " +
            "	b.SuitType, " +
            "	b.Vendor " +
            "FROM " +
            "	( " +
            "		SELECT " +
            "			DrugID, " +
            "			sum(DrugCount) AS DrugCount " +
            "		FROM " +
            "			DrugReduce";
        if(queryOptions.drugReduceWhere && queryOptions.drugReduceWhere != '0') {
            sql += queryOptions.drugReduceWhere;
        } else {
            sql += " where 1 = 1 ";
        }
        sql +=  "		 AND UserID IN (SELECT UserID FROM UserInfo  ";
        if(queryOptions.userInfowhere && queryOptions.userInfowhere != '0') {
            sql += queryOptions.userInfowhere;
        }
        sql +=  ") " +
            "		GROUP BY " +
            "			DrugID " +
            "	) AS c " +
            "INNER JOIN (SELECT * FROM DrugInfo ";
        if(queryOptions.drugInfowhere && queryOptions.drugInfowhere != '0') {
            sql += queryOptions.drugInfowhere;
        }
        sql += ") b ON c.DrugID = b.DrugID ";

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

var DrugReturnBiz = extend(drugReturnProto, Biz);

module.exports = DrugReturnBiz;
