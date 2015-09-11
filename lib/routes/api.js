/*global require*/

var base = require('../base');
var express = require('express');
var router = express.Router();

var user = require('./api/user');
var resource = require('./api/resource');
var authority = require('./api/authority');

//TODO api 是否需要身份认证?? 目前在身份认证之后才能调用api接口, openAPI???

router.get('/ping', function(req, res, next){
	res.status(200);
	res.json({statusCode: 200, message: 'ping success'});
});

//获取当前用户profile信息
router.get('/profile', function (req, res, next) {
	res.json(req.session.profile);
});

//
router.get('/sites', function(req, res, next){
	var siteInfo = {
		description: 'hispump',
		log: 'https://uimg.s3.cn-north-1.amazonaws.com.cn/math.linkdesk.com/logo',
		href: '',
		host: '',
		title: 'hispump'
	};
	res.json(siteInfo);
});


user.call(router);
resource.call(router);
authority.call(router);


//attention please !!! must under other router
router.get('/*', function(req, res, next){
	res.status(400);
	res.json({statusCode: 400, message: 'No such API'});
});
module.exports = router;
