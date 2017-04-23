var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    if(req.session.email != undefined){
        res.redirect('/mainpage');
    }
    else {
        res.render('signup');

    }
});

module.exports = router;
