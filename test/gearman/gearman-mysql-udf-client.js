/**
 * Created by cailong on 2015/8/5.
 */
var gearmanode = require('gearmanode');
var gearman_conf = require('../../conf/gearman-conf');
var client = gearmanode.client({
	servers: [
		{host: gearman_conf.ip, port: gearman_conf.port}
	]
});
//提交job
var job = client.submitJob('test', "{\"id\": \"1\", \"name\": \"zhangsan\", \"sex\": \"1\", \"age\": \"12\"}");
//var job2 = client.submitJob('test', "{\"id\": \"1\", \"name\": \"zhangsan\", \"sex\": \"1\", \"age\": \"12\"}");
job.on('workData', function (data) {
	console.log('WORK_DATA >>> ' + data);
});
//结果回调函数
job.on('complete', function () {
	console.log('RESULT >>> ' + job.response);
	client.close();
});
