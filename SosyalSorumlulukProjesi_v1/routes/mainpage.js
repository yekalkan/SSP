var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
   /* if(req.session.username){
        res.render('index', { username: req.session.username });
    }
    else {
        res.render('index', { username: ""});
    }*/

    res.render('mainpage', { username: req.session.username});
});

module.exports = router;
