/**
 * Created by cailong on 2015/8/29.
 */
/*global require, module*/
'use strict';
var _ = require('underscore');
var _s = require('underscore.string');

var fileType = function(){

};

var defaultFileTypeGroup = fileType.defaultFileTypeGroup = {
	'text/csv': '.csv',
	'text/rtf': '.rtf',
	'text/plain': '.txt',
	'text/xml': '.xml',
	'text/richtext': '.rtx',
	'image/jpeg': '.jpg .jpeg',
	'image/png': '.png',
	'image/gif': '.gif',
	'image/svg+xml': '.svg',
	'application/msword': '.doc',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
	'application/pdf': '.pdf',
	'application/rtf': '.rtf',
	'application/vnd.ms-excel': '.xls',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
	'application/vnd.ms-outlook': '.msg',
	'application/vnd.ms-powerpoint': '.ppt',
	'application/vnd.ms-project': '.mpp',
	'application/vnd.ms-works': '.wps',
	'application/x-compress': '.z',
	'application/x-compressed': '.tgz',
	'application/x-gtar': '.gtar',
	'application/x-gzip': '.gz',
	'application/x-mswrite': '.wri',
	'application/x-tar': '.tar',
	'application/zip': '.zip',
	'application/x-rar-compressed': '.rar',
	'application/vnd.sealed.eml': '.eml'
};


/*
* 	usage demo
* 	fileType.getFileType('text');
*   fileType.getFileType('text/*');
*   fileType.getFileType('text/csv');
*   fileType.getFileType('text/csv, application/vnd.ms-powerpoint');
*   fileType.getFileType(['text/csv', 'application/vnd.ms-powerpoint']);
* */
var getFileType = fileType.getFileType =  function(fileTypeGroups){
	var defaultFileTypeGroupKeysString = _.keys(defaultFileTypeGroup).join(' ');
	var fileTypeGroupArray, returnTypes = [];
	if(_.isString(fileTypeGroups)){
		fileTypeGroupArray = fileTypeGroups.split(',');
	}else if(_.isArray(fileTypeGroups)){
		fileTypeGroupArray = fileTypeGroups;
	}
	if(fileTypeGroupArray){
		_.each(fileTypeGroupArray, function(one){
			var reg = new RegExp('('+_s.trim(one)+'[^\\s]*)', 'g');
			var hitKeys = defaultFileTypeGroupKeysString.match(reg);
			_.each(hitKeys, function(oneKeyOfHit){
				var oneType = defaultFileTypeGroup[_s.trim(oneKeyOfHit)];
				//jshint expr:true
				oneType ? returnTypes.push(oneType) : void 0;
			});
		});
	}
	return returnTypes.join(',');
};

module.exports = fileType;