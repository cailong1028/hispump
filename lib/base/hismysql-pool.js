/**
 * Created by cailong on 2015/8/17.
 */
/*global require*/
'use strict';
var mysql_conf = require('../../conf/mysql-conf');
var _ = require('underscore');
var log = require('./log');
var mysql = require('mysql');

var hismysql = function(){};

var queryDefaultOptions = {
	timeout: 5000,
	typeCast: true,
	format: function(){}
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
	debug: true,// when on production env make it false
	trace: true,
	multipleStatements: false
	//flags
	//ssl
};

var poolDefaultOptions = {
	acquireTimeout: 10000,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0 //if set 0, means no limit
};

var poolClusterDefaultOptions = {
	canRetry: true,
	removeNodeErrorCount: 5,
	restoreNodeTimeout: 0,
	//RR: Select one alternately. (Round-Robin);
	// RANDOM: Select the node by random function.;
	// ORDER: Select the first node available unconditionally.
	defaultSelector: 'RR'
};

var pool = hismysql.pool = mysql.createPool(_.extend({}, poolDefaultOptions, mysql_conf));
//用poolCluster代替单一的pool方案, 但是poolcluster 非常不好使,还有BUG
//var poolCluster = hismysql.poolCluster = mysql.createPoolCluster();
//_.each(_.keys(mysql_conf), function(key){
//	poolCluster.add(key, _.extend({},connectionDefaultOptions, poolDefaultOptions, poolClusterDefaultOptions, mysql_conf[key]));
//});

pool.on('connection', function (connection) {
	//connection.query('SET SESSION auto_increment_increment=1');
	log('on poll connection event');
});

pool.on('enqueue', function () {
	log('Waiting for available connection slot');
});

//demo: hismysql.query('SELECT * FROM `books` WHERE `author` = ?', ['David'], callbackFunction);
//sql注入的解决, 下面封装的形式就已经避免了sql注入, 使用?代替直接拼写的sql即可
//Numbers are left untouched
//Booleans are converted to true / false
//Date objects are converted to 'YYYY-mm-dd HH:ii:ss' strings
//Buffers are converted to hex strings, e.g. X'0fa5'
//Strings are safely escaped
//Arrays are turned into list, e.g. ['a', 'b'] turns into 'a', 'b'
//Nested arrays are turned into grouped lists (for bulk inserts), e.g. [['a', 'b'], ['c', 'd']] turns into ('a', 'b'), ('c', 'd')
//Objects are turned into key = 'val' pairs for each enumerable property on the object. If the property's value is a function, it is skipped; if the property's value is an object, toString() is called on it and the returned value is used.
//	undefined / null are converted to NULL
//NaN / Infinity are left as-is. MySQL does not support these, and trying to insert them as values will trigger MySQL errors until they implement support.
//when insert, update, just use json(wonderful) !!!!!!!!!!!!
//var post  = {id: 1, title: 'Hello MySQL'};
//var query = connection.query('INSERT INTO posts SET ?', post, function(err, result) {
//	// Neat!
//});
//console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
hismysql.query = function(sql, values, callback){

	pool.getConnection(function(err, connection) {
		if(err){
			log('POOLCLUSTER ERROR: '+err);
			return ;
		}
		// Use the connection
		var queryOptions = _.extend({sql: sql}, queryDefaultOptions);
		if(typeof values === 'function' && !callback){
			callback = values;
			values = null;
		}

		var qureyParams = [];
		qureyParams.push(queryOptions);
		if(values){
			qureyParams.push(values);
		}
		qureyParams.push(function(err, results, fields) {
			// And done with the connection.
			callback(err, results, fields);
			if(err){
				//TODO 是否desdory?
				log('QUERY ERROR: '+err);
				//connection.destroy();
			}
			connection.release();
			// Don't use the connection here, it has been returned to the pool.
		});
		var query = connection.query.apply(connection, qureyParams);
		log('SQL IS ['+query.sql+']');
	});
};

//关闭node server的时候调用! 非此情况 勿用!!!
hismysql.destroyPool = function(){
	pool.end(function (err) {
		// all connections in the pool have ended
	});
};

/*poolCluster.on('remove', function (nodeId) {
 console.log('REMOVED NODE : ' + nodeId); // nodeId = SLAVE1
 });
 //关闭node server的时候调用! 非此情况 勿用!!!
 hismysql.destroyPool = function () {
 poolCluster.end(function (err) {
 // all connections in the pool cluster have ended
 });
 };*/

//TODO trans 示例代码如下
/*connection.beginTransaction(function(err) {
 if (err) { throw err; }
 connection.query('INSERT INTO posts SET title=?', title, function(err, result) {
 if (err) {
 return connection.rollback(function() {
 throw err;
 });
 }

 var log = 'Post ' + result.insertId + ' added';

 connection.query('INSERT INTO log SET data=?', log, function(err, result) {
 if (err) {
 return connection.rollback(function() {
 throw err;
 });
 }
 connection.commit(function(err) {
 if (err) {
 return connection.rollback(function() {
 throw err;
 });
 }
 console.log('success!');
 });
 });
 });
 });*/

module.exports = hismysql;
