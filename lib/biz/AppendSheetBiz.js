/**
 * Created by cailong on 2015/11/14.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../base');
var log = base.log;
var Biz = base.Biz;
var extend = base.extend;
var hismpc = base.hismpc();
var $def = require('jquery-deferred');
//补药清单查询
var appendSheetProto = {
	init: function(){},
	getAppendSheetList: function(queryOptions){
		var dtd = new $def.Deferred();

		var sql = ' SELECT a.id, a.sheetid, a.cartcode, b.cartname, a.drugid, c.drugname, a.sheetstatus, a.drugcount, a.factcount ';
		var from = ' FROM appendsheet a left join medcart b on a.CARTCODE = b.CARTCODE LEFT JOIN druginfo c on c.DRUGID = a.DRUGID ';
		var where = ' WHERE 1 = 1 ';

		var values = [];
		var valuesCnt = [];
		if(queryOptions.cartid){
			var cartids = queryOptions.cartid.split(',');
			where += ' and a.cartcode in (';
			where += queryOptions.cartid.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(cartids, function(one){
				values.push(one);
				valuesCnt.push(one);
			});
		}
		/*if(queryOptions.drugid){
			where += ' and a.drugid= ? ';
			values.push(queryOptions.drugid);
			valuesCnt.push(queryOptions.drugid);
		}*/
		if(queryOptions.sheetstatus){
			var sheetstatus = queryOptions.sheetstatus.split(',');
			where += ' and a.sheetstatus in (';
			where += queryOptions.sheetstatus.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(sheetstatus, function(one){
				values.push(one);
				valuesCnt.push(one);
			});
		}
		if(queryOptions.drugid){
			var drugids = queryOptions.drugid.split(',');
			where += ' and a.drugid in (';
			where += queryOptions.drugid.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(drugids, function(one){
				values.push(one);
				valuesCnt.push(one);
			});
		}
		if(queryOptions.devType){
			var devTypes = queryOptions.devType.split(',');
			where += ' and b.type in (';
			where += queryOptions.devType.replace(/[^,]+/g,'?');
			where += ') ';
			_.each(devTypes, function(one){
				values.push(one);
				valuesCnt.push(one);
			});
		}

		var whereSql = where + ' order BY a.SHEETID desc ';

		sql += from;
		sql += whereSql;
		var sqlTotal = 'select count(*) as cnt ';
		sqlTotal += from;
		sqlTotal += where;
		var returnJson = {content: [], page: {}};
		var queryTotalDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			returnJson.page.size = parseInt(queryOptions.size) || hismpc.defaultSize;
			returnJson.page.number = parseInt(queryOptions.page) || hismpc.defaultPage;
			returnJson.page.totalElements = result[0].cnt;
			returnJson.page.totalPages = parseInt(returnJson.page.totalElements / returnJson.page.size, 10) + 1;

			return dtd.resolve(returnJson);
		};
		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			returnJson.content = result;
			hismpc.query(sqlTotal, valuesCnt, queryTotalDone);
		};
		hismpc.queryPage(sql, values, queryOptions, queryDone);
		return dtd.promise();
	}
};

var AppendSheetBiz = extend(appendSheetProto, Biz);

module.exports = AppendSheetBiz;


var a = new AppendSheetBiz;
a.getAppendSheetList({});