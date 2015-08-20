/**
 * Created by cailong on 2015/7/29.
 */
/*global require, describe*/
'use strict';
var assert = require('assert');
var base = require('../../lib/base');
var hisredis = base.hisredis;
describe('hisredis', function(){
	describe('test hisredis', function(){
		var client = hisredis.getRedisClient();
		it('base client use!', function (done) {
			client.on('erroe', function(err){
				console.log('Error '+err);
			});
			client.get('id', function(err, replay){
				console.log(replay);
				assert.equal('1', replay);
				done();
			});
		});
		it('base client use!', function (done) {
			client.on('erroe', function(err){
				console.log('Error '+err);
			});
			client.get('id', function(err, replay){
				console.log(replay);
				assert.equal('1', replay);
				done();
			});
		});
	});
	describe('test hisredis', function(){
		it('base client use!', function (done) {
			var client = hisredis.getRedisClient();
			client.on('erroe', function(err){
				console.log('Error '+err);
			});
			client.get('id', function(err, replay){
				console.log(replay);
				assert.equal('1', replay);
				done();
			});
		});
		it('base client use!', function (done) {
			var client = hisredis.getRedisClient();
			client.on('erroe', function(err){
				console.log('Error '+err);
			});
			client.get('id', function(err, replay){
				console.log(replay);
				assert.equal('1', replay);
				done();
			});
		});
		it('hmset hmget', function (done) {
			var client = hisredis.getRedisClient();
			client.hmset('map_test_mocha', 'key1', 'value1');
			client.hmget('map_test_mocha', 'key1', function(err, replay){
				assert.equal('value1', replay);
				done();
			});
		});
		it('lpush and lrange ! well done! well job!', function (done) {
			var client = hisredis.getRedisClient();
			var user1 = {id: 1, name: 'zhang'},
				user2 = {id: 2, name: 'li'};
			client.lpush('list_test_mocha', JSON.stringify(user1), JSON.stringify(user2));
			client.lrange('list_test_mocha', 0, -1, function(err, replay){
				assert.equal('li', JSON.parse(replay[0]).name);
				client.brpop('list_test_mocha', 2, function(listName, item){
					assert.equal('zhang', JSON.parse(item[1]).name);
					client.brpop('list_test_mocha', 2, function(listName, item){
						assert.equal('li', JSON.parse(item[1]).name);
						done();
					});
				});
			});
		});
	});
});
