/**
 * Created by cailong on 2015/9/6.
 */
/*global require, module*/
'use strict';
var log = require('./log');
var _ = require('underscore');
var hisrp = require('./hisredis-pool');
var $def = require('jquery-deferred');
var session_cookie_conf = require('../../conf/session-cookie-conf');

var sessionExpireTime = session_cookie_conf.session.expireTime;

var RedisSession = function(){
	this.init.apply(this, Array.prototype.slice.call(arguments));
};

_.extend(RedisSession.prototype, {
	expireTime: sessionExpireTime,
	init: function(opts){
		if(opts && opts.expire){
			this.expireTime = opts.expire;
		}
	},
	//redis session set 的同时 设置expire
	set: function(sessionKey, session){
		var self = this;
		var dtd = new $def.Deferred();
		hisrp.set(sessionKey, session).done(function(){
			self.expire(sessionKey).done(function(){
				dtd.resolve(session);
			}).fail(function(err){
				//设置expire失败的话, 需要删除, 不然会成为死数据
				self.del(sessionKey);
				dtd.reject(err);
			});
		}).fail(function(err){
			log.error('hisrp session {set} error : '+e);
			dtd.reject(err);
		});
		return dtd.promise();
	},
	get: function(sessionKey){
		var dtd = new $def.Deferred();
		hisrp.get(sessionKey).done(function(res){
			if(!res){
				log.error('there is no session which session key is ['+sessionKey+']');
				return dtd.reject(null);
			}
			var session = res;
			dtd.resolve(session);
		}).fail(function(err){
			log.error('hisrp session {get} error : '+err);
			dtd.reject(err);
		});
		return dtd.promise();
	},
	del: function(sessionKey){
		var dtd = new $def.Deferred();
		hisrp.del(sessionKey).done(function(){
			dtd.resolve();
		}).fail(function(err){
			log.error('hisrp session {del} error : '+e);
			dtd.reject(err);
		});
		return dtd.promise();
	},
	expire: function(sessionKey, expireTime){
		var dtd = new $def.Deferred();
		expireTime = expireTime || this.expireTime;
		hisrp.expire(sessionKey, expireTime).done(function(){
			dtd.resolve();
		}).fail(function(err){
			log.error('hisrp session {expire} error : '+err);
			dtd.reject(err);
		});
		return dtd.promise();
	}
});

module.exports = RedisSession;