/**
 * Created by cailong on 2015/9/8.
 */
/*global require, module*/
'use strict';

var urlFilter = {
	filter: function(req, res, next){
		res.render('index', {navigation: req.url});
	}
};

module.exports = urlFilter;