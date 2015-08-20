/**
 * Created by cailong on 2015/8/7.
 */
/*global require*/
'use strict';
var _  = require('underscore');
var redis = require('redis');
var log = require('./log');
var redis_conf = require('../../conf/redis-conf');

var hisredis = function(){

};

var defaultRedisClientOptions = {
	parser: 'javascript', //hiredis
	return_buffers: false,
	detect_buffer: false,
	socket_nodely: true,
	socket_keepalive: true,
	no_ready_check: false,
	enable_offline_queue: true,
	retry_max_delay: null,
	connect_timeout: false,
	max_attempts: null,
	auth_pass: null,
	family: 'IPv4'
};

var redisClient;

var i = 0;
var getRedisClient = function(/*queueId*/){
	if(!redisClient || !redisClient.connected){
		log('!!!'+ ++i);
		redisClient = hisredis.redisClient = redis.createClient(redis_conf.port, redis_conf.ip, hisredis.defaultRedisClientOptions);
	}
	return redisClient;
};

_.extend(hisredis, {
	defaultRedisClientOptions: defaultRedisClientOptions,
	getRedisClient: getRedisClient
});

module.exports = hisredis;