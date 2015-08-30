/**
 * Created by cailong on 2015/8/19.
 */
/*global require*/
'use strict';
var express = require('express');
var router = express.Router();

var UploadBiz = require('../biz/UploadBiz');

router.post('/', function(req, res, next){
	//获取request 参数
	var data = req.body;
	var uploadBiz = new UploadBiz(data);
	var updateDBDone = function(err){
		if(err){
			return res.status(500).send({statusCode: 500, msg: 'upload fail'});
		}
		res.status(200).send({statusCode: 200, msg: 'upload success'});
	};
	uploadBiz.pushQueue(updateDBDone);
});

module.exports = router;
