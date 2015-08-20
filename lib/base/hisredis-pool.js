/**
 * Created by cailong on 2015/8/20.
 */
/*global global, require*/
'use strict';
var log = require('./log');
var util = require('util');
var redisPool = require('sol-redis-pool');
var redis_conf = require('../../conf/redis-conf');

var LOG_MESSAGE = "Available: %s, Pool Size: %s";

var currDB = global.env === 'production' ? redis_conf.production : redis_conf.development;

var hisredisPool = function () {

};

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

var pool = hisredisPool.pool = redisPool(redisSettings, poolSettings);

pool.on("error", function (reason) {
	log("Connection Error:" + reason);
});

pool.on("destroy", function () {
	log(util.format(" Checking pool info after client destroyed: " + LOG_MESSAGE, pool.availableObjectsCount(), pool.getPoolSize()));
});

var lpush = hisredisPool.lpush = function (queueID, dataString, callback) {
	var connection = function (err, client) {
		if(err){
			log('REDIS POOL acquireDb ERROR: ' + err);
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
			log('REDIS CLIENT LPUSH ERROR: '+ e);
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
			log('REDIS POOL acquireDb ERROR: ' + err);
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
			log('REDIS CLIENT BRPOP ERROR: '+ e);
			if(callback && typeof callback === 'function'){
				callback(new Error(e));
			}
		}
	};
	pool.acquireDb(connection, currDB);
};

module.exports = hisredisPool;