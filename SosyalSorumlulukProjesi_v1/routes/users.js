var express = require('express');
var router = express.Router();

/* GET users listing. a
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

router.get('/', function(req, res, next) {

  if( req.query.Username === "yunus" &&  req.query.Password === "emre"){
      //res.send('Login Accepted.');
      res.redirect('/');
  }
  else{
      res.redirect('/login');
  }

});

module.exports = router;
