/**
 * Created by cailong on 2015/8/19.
 */
'ues strict';
/*global require, describe*/
var assert = require('assert');
var UploadBiz = require('../../lib/biz/UploadBiz');

describe('test Biz and Biz Sub Class', function(){
	describe('test UploadBiz Class Object', function(){
		it('new a UploadBiz Object, post a JSON Data to init', function(){
			var data = {id: '11', name: 'cailong'};
			var uploadBiz = new UploadBiz(data);
			assert.equal(uploadBiz.acceptData.name, 'cailong');
		});
	});
});