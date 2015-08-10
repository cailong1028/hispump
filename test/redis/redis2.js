/**
 * Created by cailong on 2015/7/29.
 */
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
	});
});
