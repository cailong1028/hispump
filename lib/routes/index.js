var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test/:id', function(req, res, next){
  //url格式如下: /test/123?name=李四
  //获取的方式如下
  //var id = req.params.id;
  //var name = req.query.name;

  res.send('test success!');
});

module.exports = router;
