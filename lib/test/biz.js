/**
 * Created by cailong on 2015/8/19.
 */
'use strict';

var base = require('../base');
var log = base.log;
var UploadBiz = require('../biz/UploadBiz');

var data = {id: '11', name: 'cailong'};
var uploadBiz = new UploadBiz(data);

log(JSON.stringify(uploadBiz.acceptData));
log(uploadBiz.acceptData.name);