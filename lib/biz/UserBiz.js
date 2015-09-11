/**
 * Created by cailong on 2015/9/7.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var base = require('../base');
var log = base.log;
var Biz = base.Biz;
var extend = base.extend;
var hismpc = base.hismpc;
var UserDao = require('../dao/UserDao');
var $def = require('jquery-deferred');

var UserProto = {
	init: function(){},
	//login
	login: function(name, password){
		var dtd = new $def.Deferred();
		//the password was sha1 string to compare stored in DB
		var userProfile = {};
		//查询包含用户权限的组合信息, 用于客户端验证
		var sql = 'select id, loginname, password, username, createtime, mobile, memo, worknum from user where ?? = ?';
		var values = ['loginname', name];
		var queryAuthDone = function(err, res){
			var resourceAuths = [];
			var actionAuths = [];
			if(err){
				log.info('error when query user~s authority: '+err);
				return dtd.reject(-1);
			}
			_.each(res, function(oneAuth){
				if(oneAuth.type === 0){
					resourceAuths.push(oneAuth);
				}else if(oneAuth.type === 1){
					actionAuths.push(oneAuth);
				}
			});
			_.extendOwn(userProfile, {resourceAuthority: resourceAuths, actionAuthority: actionAuths});
			dtd.resolve(userProfile);
		};
		var queryDone = function(err, res){
			if(err){
				log.info('error when query user by name and password: '+err);
				return dtd.reject(-1);
			}
			if(res.length === 0){
				log.info('no such user ['+name+']');
				return dtd.reject(0);
			}
			var user = res[0];
			//check password
			if(password !== user.password){
				log.info('user ['+name+'] try login but password not match');
				return dtd.reject(1);
			}
			_.extendOwn(userProfile, {userInfo: user});
			//query authority
			var sqlAuth = 'select a.name, a.code, a.url, a.type from resource a, authority b where a.id = b.resourceid and  b.userid = ?';
			var valuesAuth = [user.id];
			hismpc.query(sqlAuth, valuesAuth, queryAuthDone);
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	},
	//user list
	getUserList: function(queryOptions){
		var dtd = new $def.Deferred();
		var sql = 'select id, loginname, password, username, createtime, mobile, memo, worknum from user';
		var sqlTotal = 'select count(*) as cnt from user';
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
			hismpc.query(sqlTotal, queryTotalDone);
		};
		hismpc.queryPage(sql, queryOptions, queryDone);
		return dtd.promise();
	},
	addUser: function(user){
		//
		var dtd = new $def.Deferred();
		var uuid = new base.UUID();
		var createtime = new Date();
		_.extend(user, {id: uuid, createtime: createtime});

		//check user exists
		var sqlCheckUser = 'select * from user where loginname = ?';
		var sqlCheckUserValues = [user.loginname];
		var checkDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			if(res.length > 0){
				return dtd.reject(0);
			}

			var sql = 'insert into user set ?';
			var values = [user];
			//var sqlInitAuth = '';
			var commitDone = function(err){
				if(err){
					return dtd.reject(err);
				}
				dtd.resolve(user);
			};
			hismpc.getTrans().done(function(trans){
				trans.query(sql, values)
					/*.query()//初始化权限*/;
				trans.commit(commitDone);
			}).fail(function(err){
				dtd.reject(err);
			});
		};
		hismpc.query(sqlCheckUser, sqlCheckUserValues, checkDone);

		return dtd.promise();
	},
	modifyUser: function(id, body){
		var self = this;
		var dtd = new $def.Deferred();
		var sql = 'update user set ? where id = ?';
		var values = [body, id];
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			self.getUser(id).done(function(user){
				dtd.resolve(user);
			}).fail(function(){
				//已经更新成功, 只是查询失败了, 所以是resolve而不是reject
				dtd.resolve({});
			});
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	},
	resetPassword: function(id, password){
		var self = this;
		var dtd = new $def.Deferred();
		var sql = 'update user set ? where id = ?';
		var values = [{password: password}, id];
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve();
		};
		hismpc.query(sql, values, queryDone);
		return dtd.promise();
	},
	updatePassword: function(id, password, newPassword){
		var self = this;
		var dtd = new $def.Deferred();
		var checkSql = 'select password from user where id = ?';
		var sql = 'update user set ? where id = ?';
		var values = [{password: newPassword}, id];
		var updateDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve();
		};
		var checkDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			if(res.length < 1){
				return dtd.reject(-1);
			}
			if(res[0].password !== password){
				return dtd.reject(0);
			}
			hismpc.query(sql, values, updateDone);
		};
		hismpc.query(checkSql, [id], checkDone);
		return dtd.promise();
	},
	getUser: function(id){
		var dtd = new $def.Deferred();
		var sql = 'select id, loginname, password, username, mobile, createtime, memo, worknum from user where id = ?';
		var queryDone = function(err, res){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve(res[0]);
		};
		hismpc.query(sql, [id], queryDone);
		return dtd.promise();
	},
	deleteUser: function(userid){
		//delete authority also when delete user
		var dtd = new $def.Deferred();
		var sqlUser = 'delete from user where id = ?';
		var valuesUser = [userid];
		var sqlAuth = 'delete from authority where userid = ?';
		var valuesAuth = [userid];
		var commitDone = function(err){
			if(err){
				return dtd.reject(err);
			}
			dtd.resolve();
		};
		hismpc.getTrans().done(function(trans){
			trans.query(sqlUser, valuesUser).query(sqlAuth, valuesAuth);
			trans.commit(commitDone);
		}).fail(function(err){
			dtd.reject(err);
		});
		return dtd.promise();
	}
};

var UserBiz = extend(UserProto, Biz);

module.exports = UserBiz;
