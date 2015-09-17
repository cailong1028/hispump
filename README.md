# hispump
a his data pump system aim to pump data exchange current exists his systems 

## 项目配置
clone 项目之后,执行

    npm install
会把项目所依赖的第三方包安装

##启动项目

    cd hispump
    npm start 
    
##项目配置文件目录

    conf
目前使用的配置文件是

    mysql-cluster-conf.json
    redis-conf.json
    
## 单元测试

    npm install mocha -g
    cd hispump
    mocha
    
## 测试上行数据
首先确保mysql, redis和项目正常启动

    cd hispump/lib/test
    node httpClientConcurrent.js
    
## pm2启动
首先安装全局安装pm2

    npm install pm2 -g

pm2.json DEMO

    {
      "apps" : [{
        "name"        : "hispump",
        "cwd"         : ".",
        "script"      : "./bin/www.js",
        "env": {
          "NODE_ENV": "production",
          "PORT": 3000
        },
        "instances"  : 0,
        "exec_mode"  : "cluster_mode",
        "exec_interpreter" : "node",
        "watch"            : true,
        "ignore_watch"     : ["[\\/\\\\]\\./", "node_modules", "log*", "public", "test", ".gitignore", ".jshintrc", "npm-debug.log", "README.md", "json"],
        "min_uptime"       : "1000s",
        "autorestart"      : true,
        "max_restarts"     : 15,
        "log_date_format"  : "YYYY-MM-DD HH:mm Z",
        "error_file"       : "log/pm2/node-app.stderr.log",
        "out_file"         : "log/pm2/node-app.stdout.log"
      }]
    }
 
然后使用

    pm2 start pm2.json

启动项目

如果启动出现问题, 或者需要覆盖之前的pm2.json配置, 需要先

    pm2 delete pm2.json
    再
    pm2 start pm2.json

pm2删除server

    pm2 delete pm2.json
    或者
    pm2 delete all

## 监控pm2

具体参考

    https://app.keymetrics.io(需要使用注册时生成公私钥link本地服务)

    需要开放80, 443, 43554
    centos 7下, 需要设置firewalld

    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --permanent --add-port=43554/tcp

    systemctl restart firewalld

    再登录https://app.keymetrics.io, 就可以在其面板中查看服务器所在设备的cpu, disk, memory等情况, 以及服务的运行状况