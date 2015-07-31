/**
 * Created by cailong on 2015/7/29.
 */
'use strict';
//var describe = require('mocha').describe;
var assert = require('assert');
describe('Array', function(){
	/*describe.skip('#indexOf()', function(){
		it('should be -1 if there is no the value in array', function(){
			assert.equal(-1, [1,2,3].indexOf(5));
			assert.equal(-1, [1,2,3].indexOf(0));
		});
	});*/
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
			var redis = require('redis');
			var client = redis.createClient(6379, '192.168.62.129', {});
			client.on('erroe', function(err){
				console.log('Error '+err);
			});
			client.set('cl', 'cailong', redis.print);
			//client.hset('hash key', 'hash set 1', 'sone value', redis.print);
			client.get('cl', function(err, reply){
				console.log('reply is -->'+reply);
				reply.should.equal('cailong');
				done();
			})
		})
	});
});