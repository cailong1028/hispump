/*global require*/

var base = require('../base');
var express = require('express');
var router = express.Router();

var dev = require('./api/dev');
var dept = require('./api/dept');
var user = require('./api/user');
var resource = require('./api/resource');
var authority = require('./api/authority');
var statistics = require('./api/statistics');
var devdrug = require('./api/devdrug');
var drug = require('./api/drug');

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
		description: 'Rivamed统一服务平台',
		//log: 'url',
		href: '',
		host: '',
		title: 'Rivamed统一服务平台'
	};
	res.json(siteInfo);
});

user.call(router);
resource.call(router);
authority.call(router);
dev.call(router);
dept.call(router);
statistics.call(router);
devdrug.call(router);
drug.call(router);

//attention please !!! must under other router
router.get('/*', function(req, res, next){
	res.status(400);
	res.json({statusCode: 400, message: 'No such API'});
});
module.exports = router;
