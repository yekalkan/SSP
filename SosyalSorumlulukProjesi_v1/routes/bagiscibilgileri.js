var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.email == undefined){
        res.redirect('/');
    }
    else if(req.session.usertype === "bagisci"){
        if(!req.session.infoneeded){
            res.redirect('/mainpage');
        }
        else{
            res.render('bagiscibilgileri');
        }
    }
    else if(req.session.usertype === "bagisci"){
        res.redirect('/mainpage');
    }
    else if(req.session.usertype === "admin"){
        res.redirect('/mainpage');
    }
    else{

        res.render('temsilcibilgileri');
    }
});

module.exports = router;
