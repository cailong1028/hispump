/*global require*/

var base = require('../base');
var log = base.log;
var moment = require("moment");
var express = require('express');
var redis_conf = require('../../conf/redis-conf');
var session_cookie_conf = require('../../conf/session-cookie-conf');
var url = require('url');
var router = express.Router();
var hisrp = base.hisrp;
var hrpp = base.hrpp;

var heartbeatExpireTime = session_cookie_conf['heartbeat'].expireTime;
var heartbeatPrefix = redis_conf['heartbeat-prefix'];
//心跳get协议/heartbeat?mac=
router.get('/', function(req, res, next){
	var query = hrpp(req).query;
	//设备并不一定已经分配了科室
	if(!query.mac){
		res.status(400);
		res.json({statusCode: 400, message: 'heartbeat fail! need mac'});
	}
	var key = heartbeatPrefix + query.mac.toUpperCase();
	try{
		hisrp.set(key, moment().format("YYYY-MM-DD HH:mm:ss")).done(function(error, res) {
			hisrp.expire(key, heartbeatExpireTime).done(function(){

			}).fail(function(err){
				hisrp.del(key);
				log.error('heartbeat set expire to redis error: '+err);
			});
		}).fail(function(err){
			log.error('heartbeat set to redis error '+err);
		});
	}catch(err){
		//不可预知的系统级别错误
		log.error('heartbeat to redis error '+err);
	}
	res.status(200);
	res.json({statusCode: 200, message: 'heartbeat success'});
});
module.exports = router;
