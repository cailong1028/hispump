/**
 * Created by cailong on 2015/8/4.
 */
'use strict';
var _ = require('underscore');
var redis = require('redis');
var gearmanode = require('gearmanode');
var redis_conf = require('../../conf/redis-conf');
var gearman_conf = require('../../conf/gearman-conf');

var redisClient = redis.createClient(redis_conf.port, redis_conf.ip, {});

var worker = gearmanode.worker({
	servers:[
	{host: gearman_conf.ip, port: gearman_conf.port}
	]/*,
	loadBalancing: 'RoundRobin',
	recoverTime: 10000*/
});

worker.addFunction('syncToRedis', function(job){
	job.sendWorkData(job.payload);
	console.log('job.payload-->' + job.payload.toString());
	updateRedis(JSON.parse(job.payload.toString()));
	job.workComplete('set to redis successful');
},{toStringEncoding: 'ascii'});

var updateRedis = function(json){
	if(!redisClient.connected){
		redisClient = redis.createClient(redis_conf.port, redis_conf.ip, {});
	}
	redisClient.on('error', function(err){
		console.log('redis err-->' + err);
	});
	_.each(_.keys(json), function(value,index){
		redisClient.set(value, json[value].toString(), redis.print);
		console.log('do here --> '+value+': '+json[value].toString());
	});
	redisClient.quit();
};
