/**
 * Created by cailong on 2015/9/10.
 */
/*global require, module*/
'use strict';

var base = require('../base');
var $def = require('jquery-deferred');
var hismpc = base.hismpc;
var log = base.log;
var _ = require('underscore');

var authorityBizProto = {
	getAuthResByUserid: function(userid){
		var dtd = new $def.Deferred();
		var sql = 'select a.id, a.name, a.code, a.url, a.memo from resource a, authority b where a.id = b.resourceid and b.userid = ?';
		var values = [userid];
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(res);
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	},
	//resouceids must be a array which contains resourceid
	resetUserAuth: function(userid, resouceids){
		//trans delete first then add
		var dtd = new $def.Deferred();
		hismpc.getTrans().done(function(trans){
			var commitDone = function(err){
				if(err){
					return dtd.reject(err);
				}
				dtd.resolve();
			};
			var sqlDel = 'delete from authority where userid = ?';
			var valuesDel = [userid];
			trans.query(sqlDel, valuesDel);
			_.each(resouceids, function(resourceid){
				var sqlInsert = 'insert into authority set ?';
				var valuesInsert = [{id: new base.UUID(), userid: userid, resourceid: resourceid}];
				trans.query(sqlInsert, valuesInsert);
			});
			trans.commit(commitDone);
		}).fail(function(err){
			return dtd.reject(err);
		});
		return dtd.promise();
	}
};

var AuthorityBiz = base.extend(authorityBizProto, base.Biz);

module.exports = AuthorityBiz;