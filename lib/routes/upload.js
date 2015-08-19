/**
 * Created by cailong on 2015/8/19.
 */
var express = require('express');
var router = express.Router();

var UploadBiz = require('../biz/UploadBiz');

router.post('upload', function(req, res, next){
	/*res.format({
		'text/plain': function(){
			res.send('your post request should be application/json');
		},
		'text/html': function(){
			res.send('<p>your post request should be application/json</p>');
		},
		'application/json': function(){
			res.send({ message: 'hey' });
		},
		'default': function() {
			// log the request and respond with 406
			res.status(406).send('Not Acceptable');
		}
	});*/
	//获取request 参数
	var data = req.body;
	var uploadBiz = new UploadBiz(data);
	uploadBiz.updateDB();
	res.status(200).send();
});

module.exports = router;
