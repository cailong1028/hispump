/**
 * Created by cailong on 2015/9/8.
 */
/*global require, module*/
'use strict';
var base = require('../base');
var RedisSession = base.RedisSession;
var auth = require('../routes/auth');
var sessionFilter = {
	filter: function(req, res, next){
		//获取cookie
		var cookie = req.cookies[auth.cookieName];

		if(cookie && cookie.sessionToken){
			var redisSession = new RedisSession();
			redisSession.get(cookie.sessionToken).done(function(result){
				req.session = {token: cookie.sessionToken, profile: JSON.parse(result)};
				//对expire延时
				redisSession.expire(cookie.sessionToken);
				//不再每次session 验证之后都重写客户端cookie, 只延时,不重写
				//只有在每次auth(login)的时候重写客户端cookie
				//同时延长cookie时效为session存活时间的4 * 24倍 (即一天)
				//res.cookie(auth.cookieName, {sessionToken: cookie.sessionToken}, auth.cookieSettings);
				next();
			}).fail(function(err) {
				//此时应该redirect 不应该render , 因为session失效, 但是页面由index来控制, render执行没有效果
				//res.render('auth');
				res.redirect('/auth');
			});
		}else{
			res.redirect('/auth');
		}
	}
};

module.exports = sessionFilter;