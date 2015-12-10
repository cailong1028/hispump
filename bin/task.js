/**
 * Created by cl on 2015/12/10.
 */

/*global require*/

var base = require('../lib/base');

//var watcher = new base.Watcher();
var DownloadTask = require('../lib/task/DownloadTask');

var downloadTask = new DownloadTask();
downloadTask.run();

//暂时不添加watcher监控
//watcher.addTask(downloadTask);