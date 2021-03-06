/*global require*/
var _ = require('underscore');
var base = require('../base');
var RedisSession = base.RedisSession;
var express = require('express');
var router = express.Router();
var UserBiz = require('../biz/UserBiz');
var redis_conf = require('../../conf/redis-conf');
var session_cookie_conf = require('../../conf/session-cookie-conf');

var session_prefix = redis_conf['session-prefix'];
var cookieName = router.cookieName = session_cookie_conf.cookie.cookieName;
var cookieSettings = router.cookieSettings = session_cookie_conf.cookie.cookieSettings;

router.get('/', function (req, res, next) {
	res.render('auth');
});

router.post('/', function (req, res, next) {
	//set redis-session
	//var requester = req.connection.remoteAddress;
	var sessionToken, session;
	var name = req.body.username, password = req.body.password;
	var userBiz = new UserBiz();
	//auth system(eg: cas, sso)
	var loginDone = function (userProfile) {
		//set to redis session
		sessionToken = session_prefix + userProfile.userInfo.id + ':' + new base.UUID();
		var redisSession = new RedisSession();
		var sessionString = JSON.stringify(userProfile);
		//redis session value --> string
		redisSession.set(sessionToken, sessionString).done(function () {
			//set cookie replace current hispump cookie
			res.cookie(cookieName, {sessionToken: sessionToken}, cookieSettings);
			//res.render('index');
			//res.redirect('/');
			//使用send 会把 生成的cookie写到客户端, 如果 使用render或者redirect的话, 貌似不能像客户但写入cookie(经测试貌似如是)
			res.send(userProfile);
		}).fail(function (err) {
			log.error('save session to redis error: ' + err);
			return res.status(400).send({statusCode: 400, message: 'session error'});
		});
	};
	var loginFail = function (err) {
		if (err === -1) {
			return res.status(500).send({statusCode: 500, message: 'server error'});
		} else if (err === 0) {
			return res.status(404).send({statusCode: 400, message: 'no such user'});
		} else if (err === 1) {
			return res.status(404).send({statusCode: 400, message: 'password not match'});
		}
	};
	userBiz.login(name, password).done(loginDone).fail(loginFail);
});


router.get('/out', function (req, res, next) {
	//获取cookie
	var cookie = req.cookies[cookieName];

	if (cookie && cookie.sessionToken) {
		var redisSession = new RedisSession();

		//del redis session by token
		redisSession.del(cookie.sessionToken).done(function () {
			res.redirect('/auth');
		}).fail(function (err) {
			res.redirect('/auth');
		});
	} else {
		res.redirect('/auth');
	}
});

module.exports = router;
