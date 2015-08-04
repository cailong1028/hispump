/**
 * Created by cailong on 2015/8/4.
 */
'use strict';
var assert = require('assert');
var _ = require('underscore');
var redis = require('redis');
var gearmanode = require('gearmanode');
var redis_conf = require('../../conf/redis-conf');
var gearman_conf = require('../../conf/gearman-conf');
var encoding = 'utf-8';

var redisClient = redis.createClient(redis_conf.port, redis_conf.ip, {});

var worker = gearmanode.worker({
	servers:[
		{host: gearman_conf.ip, port: gearman_conf.port}
	]
});

worker.addFunction('syncToRedis', function(job){
	job.sendWorkData(job.payload);
	console.log('job.payload-->' + job.payload.toString());
	updateRedis(JSON.parse(job.payload.toString()));
	job.workComplete('set to redis successful');
},{toStringEncoding: encoding});

var updateRedis = function(json){
	if(!redisClient.connected){
		redisClient = redis.createClient(redis_conf.port, redis_conf.ip, {});
	}
	redisClient.on('error', function(err){
		console.log('redis err-->' + err);
	});
	_.each(_.keys(json), function(value,index){
		redisClient.set(value, json[value].toString(), redis.print);
	});
};

var gearmanclient = gearmanode.client({servers: [
	{host: gearman_conf.ip, port: gearman_conf.port}
]});

var job = gearmanclient.submitJob('syncToRedis', JSON.stringify({id: 1, name: 'cl', age: 19}), {toStringEncoding: encoding});
job.on('workData', function(data) {
	console.log('WORK_DATA >>> ' + data.toString());
});

job.on('complete', function() {
	gearmanclient.close();
	worker.close();
	describe('gearman redis ', function(){
		describe('gearman client push data to redis, and gearman client.sbmitJob~s data must be string', function(){
			it('get changed redis data', function(done){
				redisClient.get('name', function(err, reply){
					assert.equal(reply.toString(), 'cl');
					redisClient.quit();
					done();
				});
			});
		});
	});
});
