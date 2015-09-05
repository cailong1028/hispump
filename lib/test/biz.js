/**
 * Created by cailong on 2015/8/19.
 */
/*global require*/
'use strict';

var base = require('../base');
var UploadBiz = require('../biz/UploadBiz');

var data = {id: '11', name: 'cailong'};
var uploadBiz = new UploadBiz(data);

console.log(JSON.stringify(uploadBiz.acceptData));
console.log(uploadBiz.acceptData.name);