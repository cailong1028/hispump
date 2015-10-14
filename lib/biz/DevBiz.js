/**
 * Created by cailong on 2015/9/13.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var _s = require('underscore.string');
var base = require('../base');
var log = base.log;
var Biz = base.Biz;
var extend = base.extend;
var hisrp = base.hisrp;
var hismpc = base.hismpc;
var $def = require('jquery-deferred');
var redis_conf = require('../../conf/redis-conf');
var heartbeatPrefix = redis_conf['heartbeat-prefix'];

var devProto = {
	init: function(){},
	//dev list
	getDevList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = 'select a.id, a.deptid, b.name as deptname, a.type, c.name as typename, b.name, a.name, a.createtime, a.lastestmodifytime ';
		var from =	' from dev a left join dept b on a.deptid = b.id , devtype as c';
		var where = ' where a.type = c.id ';

		var values = [];
		var valuesCnt = [];
		if(queryOptions.type && queryOptions.type != '0'){
			where += ' and a.type = ? ';
			values.push(queryOptions.type);
			valuesCnt.push(queryOptions.type);
		}
		if(queryOptions.deptid && queryOptions.deptid != '0'){
			where += ' and a.deptid = ?';
			values.push(queryOptions.deptid);
			valuesCnt.push(queryOptions.deptid);
		}
		if(queryOptions.term){
			where += ' and a.id like ? ';
			values.push('%'+queryOptions.term.toUpperCase()+'%');
			valuesCnt.push('%'+queryOptions.term.toUpperCase()+'%');
		}

		sql += from;
		sql += where;
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
	getStatusDevList: function(queryOptions){
		var dtd = new $def.Deferred();
		var onlineDevIds = [];
		var sql = 'select a.id, a.deptid, b.name as deptname, a.type, c.name as typename, b.name, a.name, a.createtime, a.lastestmodifytime ';
		var sqlTotal = 'select count(*) as cnt ';

		var from =	' from dev a left join dept b on a.deptid = b.id , devtype as c';
		var where = ' where a.type = c.id ';

		var values = [];
		var valuesCnt = [];
		if(queryOptions.type && queryOptions.type != '0'){
			where += ' and a.type = ? ';
			values.push(queryOptions.type);
			valuesCnt.push(queryOptions.type);
		}
		if(queryOptions.deptid && queryOptions.deptid != '0'){
			where += ' and a.deptid = ? ';
			values.push(queryOptions.deptid);
			valuesCnt.push(queryOptions.deptid);
		}

		sql += from;
		sqlTotal += from;

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
			if(onlineDevIds.length > 0 && (queryOptions.status || queryOptions.status != '0')){
				where += ' and a.id '+(queryOptions.status == '2' ? 'not' : '')+' in (';
				for(var i = 0; i < onlineDevIds.length; i++){
					where += '\''+ onlineDevIds[i].toString().toUpperCase() + '\'' + (i < onlineDevIds.length - 1 ? ', ' : '');
					values.push(onlineDevIds[i].toString().toUpperCase());
					valuesCnt.push(onlineDevIds[i].toString().toUpperCase());
				}
				where += ')';
			}
			sql += where;
			sqlTotal += where;
			hismpc.query(sqlTotal, valuesCnt, queryTotalDone);
		};
		//先查询redis中所有保持在线状态的dev的设备id
		hisrp.keys(heartbeatPrefix+'*').done(function(res){
			onlineDevIds = res.map(function(oneRes){
				var retStr = 'unknowMac';
				var oneKey = oneRes.substring(heartbeatPrefix.length, oneRes.length);
				retStr = _s.trim(oneKey) === '' ? void(0) : oneKey;
				return retStr;
			});
			hismpc.queryPage(sql, values, queryOptions, queryDone);
		}).fail(function(){
			dtd.reject(500);
		});
		return dtd.promise();
	},
	//因为有些设备调用了心跳检测, 但是并没有添加到设备列表中, 所以sql查询采用not in redis中记录的设备的结果为未离线设备
	//然后total - 离线 = 在线
	getStatusDevInfo: function(){
		var dtd = new $def.Deferred();
		var onlineDevIds = [];
		var sql = 'select count(*) as cnt from dev';
		var sqlNotin = 'select count(*) as cnt from dev';
		var where = ' where 1 = 1 ';
		var values = [];

		var retJSON = [], total = 0;

		var queryNotinDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			retJSON.push({status: '离线', count: result[0].cnt});
			retJSON.push({status: '在线', count: total - result[0].cnt});
			dtd.resolve(retJSON);
		};
		var queryDone = function(err, result){
			if(err){
				dtd.reject(500);
				return;
			}
			//retJSON.push({status: '在线', count: result[0].cnt});
			total = result[0].cnt;
			if(onlineDevIds.length == 0){
				retJSON.push({status: '离线', count: total});
				retJSON.push({status: '在线', count: 0});
				return dtd.resolve(retJSON);
			}else if(onlineDevIds.length > 0){
				where += ' and id not in (';
				for(var i = 0; i < onlineDevIds.length; i++){
					where += '\''+ onlineDevIds[i].toString().toUpperCase() + '\'' + (i < onlineDevIds.length - 1 ? ', ' : '');
					values.push(onlineDevIds[i].toString().toUpperCase());
				}
				where += ')';
			}
			sqlNotin += where;
			hismpc.query(sqlNotin, values, queryNotinDone);
		};
		//先查询redis中所有保持在线状态的dev的设备id
		hisrp.keys(heartbeatPrefix+'*').done(function(res){
			onlineDevIds = res.map(function(oneRes){
				var retStr = 'unknowMac';
				var oneKey = oneRes.substring(heartbeatPrefix.length, oneRes.length);
				retStr = _s.trim(oneKey) === '' ? void(0) : oneKey;
				return retStr;
			});

			hismpc.query(sql, [], queryDone);
		}).fail(function(err){
			dtd.reject(500);
		});
		return dtd.promise();
	},
	getUnassignDevList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = 'select a.id, a.deptid, b.name as deptname, a.type, c.name as typename, b.name, a.name, a.createtime, a.lastestmodifytime ';
		var from =	' from dev a left join dept b on a.deptid = b.id , devtype as c';
		var where = ' where a.type = c.id and (a.deptid = \'0\' or a.deptid is null)';

		var values = [];
		if(queryOptions.type && queryOptions.type != '0'){
			where += ' and a.type = ? ';
			values.push(queryOptions.type);
		}

		sql += from;
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
	},
	addDev: function(dev){
		//
		var dtd = new $def.Deferred();
		//var uuid = new base.UUID();
		var createtime = new Date();
		var lastestmodifytime = createtime;
		_.extend(dev, {createtime: createtime, lastestmodifytime: lastestmodifytime});

		//check dev exists
		var sqlCheckDev = 'select * from dev where id = ?';
		var sqlCheckDevValues = [dev.id];
		var checkDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			if(res.length > 0){
				return dtd.reject(0);
			}

			var sql = 'insert into dev set ?';
			var values = [dev];
			var commitDone = function(err){
				if(err){
					return dtd.reject(err);
				}
				dtd.resolve(dev);
			};
			hismpc.getTrans().done(function(trans){
				trans.query(sql, values);
				trans.commit(commitDone);
			}).fail(function(err){
				dtd.reject(err);
			});
		};
		hismpc.query(sqlCheckDev, sqlCheckDevValues, checkDone);

		return dtd.promise();
	},
	modifyDev: function(id, body){
		var self = this;
		var dtd = new $def.Deferred();
		var sql = 'update dev set ? where id = ?';
		var lastestmodifytime = new Date();
		var values = [_.extend(body, {lastestmodifytime: lastestmodifytime}), id];
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			self.getDev(id).done(function(dev){
				dtd.resolve(dev);
			}).fail(function(){
				//已经更新成功, 只是查询失败了, 所以是resolve而不是reject
				dtd.resolve({});
			});
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	},
	getDev: function(id){
		var dtd = new $def.Deferred();
		var sql = 'select a.id, a.deptid, b.name as deptname, a.type, c.name as typename, b.name, a.name, a.createtime, a.lastestmodifytime ' +
			'from dev a left join dept b on a.deptid = b.id , devtype as c' +
			' where a.id = ? and a.type = c.id ';
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(res[0]);
		};
		hismpc.query(sql, [id], queryDone);
		return dtd.promise();
	},
	deleteDev: function(devid){
		var dtd = new $def.Deferred();
		var sqlDev = 'delete from dev where id = ?';
		var valuesDev = [devid];
		var commitDone = function(err){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve();
		};
		hismpc.getTrans().done(function(trans){
			trans.query(sqlDev, valuesDev);
			trans.commit(commitDone);
		}).fail(function(err){
			dtd.reject(err);
		});
		return dtd.promise();
	},
	getDevType: function(){
		var dtd = new $def.Deferred();
		var sql = 'select id, name from devtype';
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(res);
		};
		hismpc.query(sql, queryDone);
		return dtd.promise();
	},
	assingDev: function(devids, deptid){
		var dtd = new $def.Deferred();

		devids = devids || [];
		if(devids.length == 0){
			_.delay(function(){
				dtd.resolve('no devid choose');
			}, 0);
			return dtd.promise();
		}

		_.each(devids, function(one, key){
			devids[key] = '\''+one+'\'';
		});

		var now = new Date();

		var sql = 'update dev set deptid = ?, lastestmodifytime = ? where id in ('+devids.join(',')+')';
		var values = [deptid, now];
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(res);
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	},
	unAssingDev: function(devid){
		var dtd = new $def.Deferred();
		var now = new Date();

		var sql = 'update dev set deptid = ?, lastestmodifytime = ? where id = ? ';
		var values = ['0', now, devid];
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(res);
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	}
};

var DevBiz = extend(devProto, Biz);

module.exports = DevBiz;
