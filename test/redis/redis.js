/**
 * Created by cailong on 2015/7/29.
 */
/*global require, describe*/
'use strict';
var assert = require('assert');
var redis = require('redis');
var redis_conf = require('../../conf/redis-conf');
var base = require('../../lib/base');
var hisredis = base.hisredis;
describe('Array', function(){
	describe('#indexOf2()', function(){
		it('should be -1 if there is no the value in array', function(){
			assert.equal(-1, [1,2,3].indexOf(5));
			assert.equal(-1, [1,2,3].indexOf(0));
		});
	});
});

describe('redis', function(){
	describe('set get', function(){
		it('set cl cailong and get cl is cailong', function(done){
			var client = redis.createClient(redis_conf.port, redis_conf.ip);
			client.set('cl', 'cailong', redis.print);
			//client.hset('hash key', 'hash set 1', 'sone value', redis.print);
			client.get('cl', function(err, reply){
				assert.equal(reply, 'cailong');
				done();
			});
		})
	});
	describe('use same client', function(){
		it('use some client', function(done){
			var client = redis.createClient(redis_conf.port, redis_conf.ip);
			client.set('cl', 'cailong', redis.print);
			//client.hset('hash key', 'hash set 1', 'sone value', redis.print);
			client.get('cl', function(err, reply){
				assert.equal(reply, 'cailong');
				done();
			})
		})
	});
	describe('return_buffers', function(){
		it.skip('return_buffers', function(done){
			var client = redis.createClient(redis_conf.port, redis_conf.ip, {return_buffers: true});
			client.on('erroe', function(err){
				console.log('Error '+err);
			});
			client.set('cl', {id: 1, name: 'cailong'}, redis.print);
			//client.hset('hash key', 'hash set 1', 'sone value', redis.print);
			client.get('cl', function(err, reply){
				assert.equal(JSON.toJSON(reply.toString()).name, 'cailong');
				client.quit();
				done();
			})
		})
	});
	describe('detect_buffers', function(){
		it('detect_buffers', function(done){
			var client = redis.createClient(redis_conf.port, redis_conf.ip, {detect_buffers: true});
			client.on('erroe', function(err){
				console.log('Error '+err);
			});
			client.set('cl', 'cailong', redis.print);
			//client.hset('hash key', 'hash set 1', 'sone value', redis.print);
			client.get(new Buffer('cl'), function(err, reply){
				assert.equal(reply.toString(), 'cailong');
				client.quit();
				done();
			})
		})
	});
	{
		var client = redis.createClient(redis_conf.port, redis_conf.ip, {detect_buffers: true});
		client.set('foo', 'bar');
		client.get('foo', function (err, replay) {
			describe('buffer', function () {
				it('show buffers', function () {
					assert.equal('bar', replay);
				})
			});
			client.quit();
		});
	}
	{
		var client = redis.createClient(redis_conf.port, redis_conf.ip, {detect_buffers: true});
		client.get(new Buffer('foo'), function (err, replay) {
			describe('buffer', function () {
				it('show buffers', function () {
					console.log('aaaa-->'+replay);
					assert.equal('bar', replay);
				})
			});
			client.quit();
		});
	}
	//sub pub

	//rpoplpush + lrem

});