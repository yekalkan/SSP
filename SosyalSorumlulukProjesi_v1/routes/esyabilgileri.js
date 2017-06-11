var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

/*
    if(req.session.email == undefined){
        res.redirect('/');
    }
    else if(req.session.usertype != "admin"){
        res.redirect('/');
    }
*/

    res.render('esyabilgileri', { username: req.session.email, userrealname: req.session.userrealname });
});

module.exports = router;
