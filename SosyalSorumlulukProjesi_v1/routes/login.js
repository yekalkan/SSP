var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    //res.send('here is the login page');
    if(req.session.email != undefined){
        res.redirect('/mainpage');
    }
    else{
        res.render('login');
    }
});


module.exports = router;
