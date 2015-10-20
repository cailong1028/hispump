/**
 * Created by cailong on 2015/10/19.
 */

var _ = require('underscore');

var a = _.debounce(function(){
	console.log('11');
}, 1000);

a();
a();