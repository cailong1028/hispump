/*global require*/

var base = require('../base');
var log = base.log;
var moment = require("moment");
var express = require('express');
var redis_conf = require('../../conf/redis-conf');
var heartbeat = redis_conf['heartbeat'];
var url = require('url');
var router = express.Router();
var hisrp = base.hisrp;




//心跳get协议http://127.0.0.1:5000/heartbeat?DEPCODE=123&SMARTCODE=123434

router.get('/', function(req, res, next){
	var arg = url.parse(req.url, true).query;
	console.log(arg.DEPCODE);//返回001
	console.log(arg.SMARTCODE);//返回002
	var key = heartbeat + arg.DEPCODE + "-" + arg.SMARTCODE
	try{
		hisrp.set(key, moment().format("YYYY-MM-DD HH:mm:ss"), function(error, res) {
			log.info('heartbeat to redis error');
		});
	}catch(e){
		//不可预知的系统级别错误
		log.info('heartbeat to redis error '+e);
	}
	res.status(200);
	res.json({statusCode: 200, message: 'heartbeat success'});
});
module.exports = router;
