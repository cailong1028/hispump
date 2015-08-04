/**
 * Created by cailong on 2015/8/3.
 */
'use strict';
var gearmanode = require('gearmanode');
var gearman_conf = require('../../conf/gearman-conf');
var client = gearmanode.client({servers: [
	{host: gearman_conf.ip, port: gearman_conf.port}
]});

var job = client.submitJob('reverse', 'hello world!');
job.on('workData', function(data) {
	console.log('WORK_DATA >>> ' + data);
});
job.on('complete', function() {
	console.log('RESULT >>> ' + job.response);
	client.close();
});