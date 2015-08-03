/**
 * Created by cailong on 2015/8/3.
 */
'use strict';
var gearmanode = require('gearmanode');
var gearman_conf = require('../../conf/gearman-conf');
var worker = gearmanode.worker({servers: [
	{host: gearman_conf.ip, port: gearman_conf.port}
]});

worker.addFunction('reverse', function (job) {
	job.sendWorkData(job.payload); // mirror input as partial result
	job.workComplete(job.payload.toString().split("").reverse().join(""));
});