/**
 * Created by cailong on 2015/8/19.
 */
var base = require('../base');
var Biz = base.Biz;
var extend = base.extend;

var UploadBiz = extend({
	init: function(data){
		this.acceptData = data;
	},
	updateDB: function(){
		var data = _.clone(this.acceptData);
		data.type;
	}
}, Biz);

module.exports = UploadBiz;
