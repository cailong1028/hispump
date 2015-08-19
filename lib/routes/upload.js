/**
 * Created by cailong on 2015/8/19.
 */
var express = require('express');
var router = express.Router();

router.post('upload', function(req, res, next){
	//获取request 参数
	var data = req.body;
	res.json(data);
});

module.exports = router;
