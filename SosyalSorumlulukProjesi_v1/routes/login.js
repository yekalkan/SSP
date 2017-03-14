var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    //res.send('here is the login page');
    res.render('login');
});

/*
router.get('/', function(req, res, next) {
    res.send('Password: ' + req.body.Password);
});
*/

module.exports = router;
