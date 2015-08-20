/**
 * Created by cailong on 2015/8/3.
 */
/*global require, describe*/
'use strict';
var assert = require('assert');
var gearmanode = require('gearmanode');
var gearman_conf = require('../../conf/gearman-conf');

var worker = gearmanode.worker({servers: [
	{host: gearman_conf.ip, port: gearman_conf.port}
]});

worker.addFunction('reverse', function (job) {
	job.sendWorkData(job.payload); // mirror input as partial result
	job.workComplete(job.payload.toString().split("").reverse().join(""));
});

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
	worker.close();
	describe('gearman', function(){
		describe('worker register and client trigger', function(){
			it('show responese returned by gearman', function(){
				assert.equal(job.response, '!dlrow olleh');
			})
		});
	});
});

