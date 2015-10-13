/**
 * Created by cailong on 2015/8/17.
 */
/*global require, module*/
'use strict';
//Dtd模块还在完善, 使用成熟的jquery deferred代替 base中的Dtd
//var Dtd = require('./Dtd');
var $def = require('jquery-deferred');
var mysql_conf = require('../../conf/mysql-cluster-conf');
var _ = require('underscore');
var _s = require('underscore.string');
var log = require('./log');
var mysql = require('mysql');

var poolCluster;

var queryDefaultOptions = {
	timeout: 5000,
	typeCast: true
	//an example of converting TINYINT(1) to boolean
	/*typeCast: function (field, next) {
	 if (field.type == 'TINY' && field.length == 1) {
	 return (field.string() == '1'); // 1 = true, 0 = false
	 }
	 return next();
	 }*/
};

var connectionDefaultOptions = {
	host: 'localhost',
	port: 3306,
	//localAddress // The source IP address to use for TCP connection. (Optional)
	user: '',
	password: '',
	database: '',
	charset: 'utf8_general_ci',
	timezone: 'local',
	connectTimeout: 10000,
	stringifyObjects: false,
	insecureAuth: false,
	typeCast: true,
	//queryFormat
	supportBigNumbers: true,
	bigNumberStrings: false,
	dateStrings: false, //Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript Date objects. (Default: false)
	debug: false,// when on production env make it false
	trace: true,
	multipleStatements: false
	//flags
	//ssl
};

var poolDefaultOptions = {
	acquireTimeout: 10000,
	waitForConnections: false, //pool 已死 , wait也是白wait, 还造成不调用callback的问题, 还不如设置为false
	connectionLimit: 10,
	queueLimit: 0 //if set 0, means no limit
};

var poolClusterDefaultOptions = {
	canRetry: true,
	removeNodeErrorCount: 5,
	restoreNodeTimeout: 5000,
	//RR: Select one alternately. (Round-Robin);
	// RANDOM: Select the node by random function.;
	// ORDER: Select the first node available unconditionally.
	defaultSelector: 'RR'
};



var checkSqlType = function(sql){
	return _s.trim(sql).split(' ')[0].toLowerCase();
};

var _makeUpQueryPage = function(){
	//TODO 没有考虑没有callback的情况,
	//TODO hismpc的query和 trans的query同样如此,
	//TODO 需要对没cb的情况处理
	var sql = arguments[0], values = [], options = {}, callback;
	if(arguments.length === 1){
		log.error('queryPage need at least two params');
		return null;
	}
	if(checkSqlType(arguments[0]) !== 'select'){
		log.error('queryPage only support select query');
		arguments[arguments.length - 1](new Error('queryPage only support select query'));
		return null;
	}
	if(arguments.length === 2){
		callback = arguments[1];
	}else if(arguments.length === 3){
		if(!_.isArray(arguments[1]) && typeof arguments[1] !== 'string'){
			callback = arguments[2];
			options = arguments[1];
		}else{
			callback = arguments[2];
			values = arguments[1];
		}
	}else if(arguments.length === 4) {
		callback = arguments[3];
		options = arguments[2];
		values = arguments[1];
	}

	var page = options.page ? parseInt(options.page) : defaultPage;
	var size = options.size ? parseInt(options.size) : defaultSize;
	var orderBy = ' ';
	if(options.orderBy){
		orderBy = orderBy.concat(' order by ?? ');
		values.push(options.orderBy);
		if(options.sort){
			orderBy = orderBy.concat(' '+options.sort+' ');
		}
	}
	sql = sql.concat(orderBy);
	//start, end
	var limit = ' limit ?, ? ';
	var startOffset = page * size;
	values.push(startOffset);
	values.push(startOffset + size);

	sql = sql.concat(limit);

	return {sql: sql, values: values, callback: callback};
};

var hismysql = function(){
	//var pool = hismysql.pool = mysql.createPool(poolDefaultOptions);
	//用poolCluster代替单一的pool方案
	//单例, 如果已经生成了, 就不再执行
	if(poolCluster){
		return hismysql;
	}
	poolCluster = hismysql.poolCluster = mysql.createPoolCluster();
	hismysql.getConnection = poolCluster.getConnection;
	_.each(_.keys(mysql_conf), function(key){
		poolCluster.add(key, _.extend({},connectionDefaultOptions, poolDefaultOptions, poolClusterDefaultOptions, mysql_conf[key]));
	});
	poolCluster.on('remove', function (nodeId) {
		log.info('REMOVED NODE : ' + nodeId); // nodeId = SLAVE1
	});
	return hismysql;
};

var defaultPage = hismysql.defaultPage = 0;
var defaultSize = hismysql.defaultSize= 10;

//demo: hismysql.query('SELECT * FROM `books` WHERE `author` = ?', ['David'], callbackFunction);
//sql注入的解决, 下面封装的形式就已经避免了sql注入, 使用?代替直接拼写的sql即可
//when insert, update, just use json(wonderful) !!!!!!!!!!!!
//var post  = {id: 1, title: 'Hello MySQL'};
//var query = connection.query('INSERT INTO posts SET ?', post, function(err, result) {
//	// Neat!
//});
//console.log.info(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
hismysql.query = function(sql, values, callback){
	var clientConnection = function(err, connection) {
		if(err){
			log.info('POOLCLUSTER ERROR: '+err);
			return callback(err);
		}
		// Use the connection
		var queryOptions = _.extend({sql: sql}, queryDefaultOptions);
		if(typeof values === 'function' && !callback){
			callback = values;
			values = null;
		}
		var qureyParams = [];
		if(values){
			queryOptions.sql = mysql.format(queryOptions.sql, values);
		}
		qureyParams.push(queryOptions);
		if(values){
			qureyParams.push(values);
			sql = mysql.format(sql, values);
		}
		qureyParams.push(function(err, results, fields) {
			// And done with the connection.
			connection.release();
			callback(err, results, fields);
			if(err){
				//TODO 是否desdory?
				log.info('QUERY ERROR: '+err);
				//connection.destroy();
			}
			// Don't use the connection here, it has been returned to the pool.
		});
		//be sure this query function~s executor is connection
		var query = connection.query.apply(connection, qureyParams);
		log.info('SQL IS ['+query.sql+']');
	};

	poolCluster.getConnection('master', clientConnection);
};

//分页查询
//options = {
// 	page: 0,
//	size: 10,
//	orderBy: 'name',
//	sort: 'desc'
// }
hismysql.queryPage = function(sql, values, options, callback){
	var queryObj = _makeUpQueryPage.apply(this, Array.prototype.slice.call(arguments));
	if(!queryObj){
		return;
	}
	hismysql.query(queryObj.sql, queryObj.values, queryObj.callback);
};

//关闭node server的时候调用! 非此情况 勿用!!!
hismysql.destroy = function () {
	log.info('DESTROYING MYSQL CLUSTER POOL ...');
	poolCluster.end(function (err) {
		// all connections in the pool cluster have ended
		log.info('DESTROY MYSQL CLUSTER POOL DONE: if this is not your expect, please check your server');
	});
};

//transaction
var Trans = function(connection){
	this.init(connection);
};

_.extend(Trans.prototype, {
	init: function(connection){
		this.id = new Date().getTime();
		this.queryList = [];
		this.connection = connection;
	},
	query: function(sql, values, callback){
		var trans = this;

		var oneQuery = function(cb){
			var queryOptions = _.extend({sql: sql}, queryDefaultOptions);
			if(typeof values === 'function' && !callback){
				callback = values;
				values = null;
			}
			var qureyParams = [];
			if(values){
				queryOptions.sql = mysql.format(queryOptions.sql, values);
			}
			qureyParams.push(queryOptions);
			if(values){
				qureyParams.push(values);
				sql = mysql.format(sql, values);
			}
			var connectionCb = function(err, results, fields) {
				if(err){
					trans.rollback();
					log.info('TRANSACTION ['+trans.id+'] QUERY ERROR: '+err);
					log.info('TRANSACTION ['+trans.id+'] ROLLBACK: ');
					if(callback && _.isFunction(callback)){
						callback(err, results, fields);
					}
					trans.callback(err);
					return;
				}
				if(callback && _.isFunction(callback)) {
					callback(err, results, fields);
				}
				if(cb){
					cb.call(trans);
				}
			};
			qureyParams.push(connectionCb);
			var ret = function(){
				var query = trans.connection.query.apply(trans.connection, qureyParams);
				log.info('TRANSACTION ['+trans.id+'] SQL IS ['+query.sql+']');
			};
			return ret;
		};

		this.queryList.push(oneQuery);
		return this;
	},
	queryPage: function(sql, values, options, callback){
		var queryObj = _makeUpQueryPage.apply(this, Array.prototype.slice.call(arguments));
		if(!queryObj){
			return;
		}
		this.query(queryObj.sql, queryObj.values, queryObj.callback);
		return this;
	},
	commit: function(cb){
		var trans = this;
		trans.callback = cb;
		var commitCallBack = function(err){
			log.info('TRANSACTION ['+trans.id+'] COMMIT SUCCESS');
			if(cb && typeof cb === 'function'){
				cb(err);
			}
		};
		var transBegin = function(err){
			if(err){
				log.info('TRANSACTION BEGIN ERROR: '+err);
				return cb(err);
			}
			if(trans.queryList.length === 0){
				log.info('TRANSACTION WARNING: NO QUERY IN TRANSACTION');
				return cb(new Error('TRANSACTION WARNING: NO QUERY IN TRANSACTION'));
			}else if(trans.queryList.length === 1){
				var temp0 = trans.queryList[0](function(){
					trans.connection.commit(commitCallBack);
				});
				trans.queryList[0] = function(){
					return temp0;
				};
			}else {
				var i = trans.queryList.length - 1;
				var tempi = trans.queryList[i](function(){
					trans.connection.commit(commitCallBack);
				});
				trans.queryList[i] = function(){
					return tempi;
				};
				for(; i > 0; i--){
					var temp = trans.queryList[i - 1](trans.queryList[i]());
					trans.queryList[i - 1] = function(){
						return temp;
					};
				}
			}
			return trans.queryList[0]()();
		};
		trans.connection.beginTransaction(transBegin);
	},
	rollback: function(cb){
		var rollbackCallback = function(err){
			if(cb && typeof cb === 'function'){
				cb(err);
			}
		};
		this.connection.rollback(rollbackCallback);
	}
});

//INVOKE TRANSACTION DEMO:
//var id = new UUID();
//var insertObj1 = {id: '3', name: 'trans插入数据', age: 1, sex: '男'};
//var insertObj2 = {id: '4', name: 'trans插入数据', age: 1, sex: '男'};
//var sql1 = 'insert into test set ?';
//var sql2 = 'insert into test set ?';
//var cb1 = function(err, res, fields){
//	if(err){
//		log.info('cb1 err-->'+err);
//		//关闭测试程序使用, 项目中不要调用hismpc.destroy
//		return hismpc.destroy();
//	}
//	log.info('cb1 res is-->'+JSON.stringify(res));
//};
//var cb2 = function(err, res, fields){
//	if(err){
//		log.info('cb2 err-->'+err);
//		//关闭测试程序使用, 项目中不要调用hismpc.destroy
//		return hismpc.destroy();
//	}
//	log.info('cb2 res is-->'+JSON.stringify(res));
//};
//
//var trans1CommitDone = function(err){
//	log.info('trans done!');
//	//关闭测试程序使用, 项目中不要调用hismpc.destroy
//	hismpc.destroy();
//};
//
//hismpc.getTrans().done(function(err, trans){
//	trans.query(sql1, insertObj1, cb1)
//		.query(sql2, insertObj2, cb2);
//
//	trans.commit(trans1CommitDone);
//});
var getTrans = hismysql.getTrans = function(err){
	var dtd = new $def.Deferred();
	poolCluster.getConnection('master', function(err, connection){
		if(err){
			log.info('SQL ERROR: can not get transaction-->' + err);
			return dtd.reject(err)
		}
		dtd.resolve(new Trans(connection));
	});
	return dtd.promise();
};

//trans demo please see

module.exports = hismysql;
