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
    
    
 
