/**
 * Created by cailong on 2015/11/14.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var moment = require('moment');
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
	},

	generateAppendSheet: function(userid, cartcodeList){
		var dtd = new $def.Deferred();
		if(!cartcodeList || cartcodeList.length === 0){
			_.delay(function(){
				dtd.resolve();
			}, 0);
			return dtd.promise();
		}

		//判定cartcode在appendsheet中是否存在状态非6的记录，存在从list中移除
		var defs = [];
		var initLength = cartcodeList.length;
		_.each(cartcodeList, function(one, i){
			defs.push((function(one, i){
				var dtd2 = new $def.Deferred;
				var checkSql = 'select * from appendsheet where cartcode = ? and sheetstatus != "6"';
				var checkValues = [one];
				var checkDone = function(err, ret){
					if(err){
						log.error(err);
						return dtd2.reject(500);
					}
					if(ret.length > 0){
						cartcodeList.splice(i - (initLength - cartcodeList.length), 1);
					}
					dtd2.resolve(200);
				};
				hismpc.query(checkSql, checkValues, checkDone);
				return dtd2.promise();
			})(one, i));
		});

		$def.when.apply($def, defs).done(function(){
			if(!cartcodeList || cartcodeList.length === 0){
				return dtd.resolve(200);
			}
			var sheetid = 'S'.concat(moment().format('YYYYMMDDHHmmSS'));

			var deletePreAppendSheetSql = "delete from Pre_AppendSheet where 1 = 1 ";
			var deletePreAppendSheetValues = [];
			var insertPreAppendSheetSql = 'INSERT Pre_AppendSheet (id, CartCode, BoxID, DrugID, DrugBase, DrugStock, AppendCount, smartcode, syncsn)' +
				' SELECT replace(uuid(), "-", "") as id, CartCode, BoxID, DrugID, DrugBase, DrugStock, DrugBase - DrugStock AS AppendCount, (select id FROM medcart where cartcode = cartcode), "hispump"' +
				' FROM drugbox' +
				' WHERE DrugMin > DrugStock AND StorageFlag IN ("0", "1") AND isdeleted = "0"';

			var insertPreAppendSheetValues = [];
			var insertAppendSheetSql =
				'insert appendsheet (id, SheetID, CartCode, DrugID, DrugBase, DrugStock, DrugCount, FactCount, sheetstatus, UserID, smartcode, syncsn)'+
				' SELECT replace(uuid(), "-", "") as id, ' +
					//'CONCAT("S", DATE_FORMAT(now(), "%y%m%d%h%i%s")) as SheetID,'+
				' ? as SheetID,'+
				' CartCode, drugID, sum(drugbase) AS drugbase,'+
				' sum(drugstock) AS drugstock, (sum(drugbase) - sum(drugstock)) AS DrugCount, 0, "0", ?, (select id FROM medcart where cartcode = cartcode), "hispump"'+
				' FROM drugbox'+
				' WHERE DrugMin > DrugStock AND StorageFlag IN ("0", "1") AND isdeleted = "0"';
			var groupBy = ' GROUP BY CartCode, drugID';
			var insertAppendSheetValues = [sheetid, userid];

			var listStr = cartcodeList.join(',');
			var and =  ' and cartcode in ('+listStr.replace(/[^,]+/g,'?')+ ') ';
			deletePreAppendSheetSql += and;
			insertPreAppendSheetSql += and;
			insertAppendSheetSql += and;
			_.each(cartcodeList, function(one){
				deletePreAppendSheetValues.push(one);
				insertPreAppendSheetValues.push(one);
				insertAppendSheetValues.push(one);
			});
			insertAppendSheetSql += groupBy;
			var commitDone = function(err){
				if(err){
					log.error(err);
					return dtd.reject();
				}
				dtd.resolve(200);
			};

			hismpc.getTrans().done(function(trans){
				trans.query(deletePreAppendSheetSql, deletePreAppendSheetValues)
					.query(insertPreAppendSheetSql, insertPreAppendSheetValues)
					.query(insertAppendSheetSql, insertAppendSheetValues);
				trans.commit(commitDone);
			}).fail(function(err){
				log.error(err);
				dtd.resolve(500);
			});
		}).fail();
		return dtd.promise();
	}
};

var AppendSheetBiz = extend(appendSheetProto, Biz);

module.exports = AppendSheetBiz;