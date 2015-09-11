/**
 * Created by cailong on 2015/8/20.
 */
/*global global, require*/
'use strict';
var log = require('./log');
var util = require('util');
var $def = require('jquery-deferred');
var redisPool = require('sol-redis-pool');
var redis_conf = require('../../conf/redis-conf');

var LOG_MESSAGE = "Available: %s, Pool Size: %s";

var currDB = global.env === 'production' ? redis_conf.production : redis_conf.development;

var redisSettings = {
	// Use TCP connections for Redis clients.
	host: redis_conf.ip,
	port: redis_conf.port,
	// Set a redis client option.
	enable_offline_queue: true,
	no_ready_check: true
};

// Configure the generic-pool settings.
var poolSettings = {
	idleTimeoutMillis: 5000,
	max: 10,
	min: 2 //因为有一个brpop的连接所以最少一个
};

var pool;

var hisredisPool = function () {
	if(pool){
		return hisredisPool;
	}
	pool = hisredisPool.pool = redisPool(redisSettings, poolSettings);
	pool.on("error", function (reason) {
		log.info("Connection Error:" + reason);
	});

	pool.on("destroy", function () {
		log.info(util.format(" Checking pool info after client destroyed: " + LOG_MESSAGE, pool.availableObjectsCount(), pool.getPoolSize()));
	});
	return hisredisPool;
};

var lpush = hisredisPool.lpush = function (queueID, dataString, callback) {
	var connection = function (err, client) {
		if(err){
			log.info('REDIS POOL acquireDb ERROR: ' + err);
			return;
		}
		// Issue the PING command.
		//client.ping(getPingResponse);
		try{
			client.lpush(queueID, dataString, function (listName, item) {
				pool.release(client);
				if(callback && typeof callback === 'function'){
					callback(null, listName, item);
				}
			});
		}catch(e){
			pool.release(client);
			log.info('REDIS CLIENT LPUSH ERROR: '+ e);
			if(callback && typeof callback === 'function'){
				callback(new Error(e));
			}
		}
	};
	pool.acquireDb(connection, currDB);
};

var brpop = hisredisPool.brpop = function(queueID, blockTimeout, callback){
	if(typeof blockTimeout === 'function'){
		callback = blockTimeout;
		blockTimeout = 0;
	}
	var connection = function (err, client) {
		if(err){
			log.info('REDIS POOL acquireDb ERROR: ' + err);
			return;
		}
		try{
			client.brpop(queueID, blockTimeout, function (listName, item) {
				pool.release(client);
				if(callback && typeof callback === 'function'){
					callback(null, listName, item);
				}
			});
		}catch(e){
			pool.release(client);
			log.info('REDIS CLIENT BRPOP ERROR: '+ e);
			if(callback && typeof callback === 'function'){
				callback(new Error(e));
			}
		}
	};
	pool.acquireDb(connection, currDB);
};

var get = hisredisPool.get = function(key){
	var dtd = new $def.Deferred();
	var connection = function (err, client) {
		if(err){
			log.info('REDIS POOL acquireDb ERROR: ' + err);
			return dtd.reject(err);
		}
		try{
			client.get(key, function (err2, reply) {
				pool.release(client);
				if(err2){
					log.info('REDIS {get} error: '+err2);
					return dtd.reject(err2);
				}
				dtd.resolve(reply);
			});
		}catch(e){
			pool.release(client);
			log.info('REDIS CLIENT GET ERROR: '+ e);
			dtd.reject(e);
		}
	};
	pool.acquireDb(connection, currDB);
	return dtd.promise();
};

var set = hisredisPool.set = function(key, value){
	var dtd = new $def.Deferred();
	var connection = function (err, client) {
		if(err){
			log.info('REDIS POOL acquireDb ERROR: ' + err);
			dtd.reject(err);
			return;
		}
		try{
			client.set(key, value, function (err2, reply) {
				pool.release(client);
				if(err2){
					log.info('REDIS {set} error: '+err2);
					dtd.reject(err);
					return;
				}
				dtd.resolve();
			});
		}catch(e){
			pool.release(client);
			log.info('REDIS CLIENT GET ERROR: '+ e);
			dtd.reject(err);
		}
	};
	pool.acquireDb(connection, currDB);
	return dtd.promise();
};

var del = hisredisPool.del = function(key){
	var dtd = new $def.Deferred();
	var connection = function (err, client) {
		if(err){
			log.info('REDIS POOL acquireDb ERROR: ' + err);
			return dtd.reject(err);
		}
		try{
			client.del(key, function (err2) {
				pool.release(client);
				if(err2){
					log.info('REDIS {del} error: '+err2);
					return dtd.reject(err2);
				}
				dtd.resolve();
			});
		}catch(e){
			pool.release(client);
			log.info('REDIS CLIENT DEL ERROR: '+ e);
			dtd.reject(e);
		}
	};
	pool.acquireDb(connection, currDB);
	return dtd.promise();
};

var expire = hisredisPool.expire = function(key, expireTime){
	var dtd = new $def.Deferred();
	var connection = function (err, client) {
		if(err){
			log.info('REDIS POOL acquireDb ERROR: ' + err);
			dtd.reject(err);
			return;
		}
		try{
			client.expire(key, expireTime, function (err2, reply) {
				pool.release(client);
				if(err2){
					log.info('REDIS {expire} error: '+err2);
					dtd.reject(err);
					return;
				}
				dtd.resolve();
			});
		}catch(e){
			pool.release(client);
			log.info('REDIS CLIENT GET ERROR: '+ e);
			dtd.reject(err);
		}
	};
	pool.acquireDb(connection, currDB);
	return dtd.promise();
};

module.exports = hisredisPool;