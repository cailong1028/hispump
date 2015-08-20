/**
 * Created by cailong on 2015/8/6.
 */
/*global require*/
'use strict';
var _ = require('underscore');
var base = require('../base');
var redis = require('redis');
var redis_conf = require('../../conf/redis-conf');

var redis_queue = function(){};

//
var redisClientPool = redis_queue.redisClientPool = {};
redisClientPool.length = 0;

var RedisQueue = redis_queue.RedisQueue = function(){
	this.init(Array.prototype.slice.call(arguments, 0));
};
RedisQueue.extend = base.extend;

var defaultOptions = {
	constructor: RedisQueue,
	defaultRedisClientOptions: {
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
	},
	createQueue: function(){
		if(arguments.length < 1){
			base.log('need queueId');
			return null;
		}
		if(typeof arguments[0] !== 'string'){
			base.log('queueId should be string');
			return null;
		}
	},
	getRedisClient: function(/*queueId*/){
		if(arguments.length < 1){
			base.log('need queueId');
			return null;
		}
		if(typeof arguments[0] !== 'string'){
			base.log('queueId should be string');
			return null;
		}
		var queueId = arguments[0],
			redisClient = redisClientPool[queueId].redisClient;
		if(!redisClient){
			redisClient = redis.createClient(redis_conf.port, redis_conf.ip, {detect_buffers: true});
			redisClientPool.length++;
		}
		this.redisClient = redisClient;
	},
	destory: function(){
		if(!this.redisClient){
			return;
		}
		redisClientPool.length++;
	}
};
_.extend(RedisQueue.prototype, defaultOptions);


module.exports = redis_queue;