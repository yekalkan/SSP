var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.email == undefined){
        res.redirect('/');
    }
    else if(req.session.usertype === "temsilci"){
        if(req.session.infoneeded){
            res.redirect('/temsilcibilgileri');
        }
        else{
            res.render('bagisistekleri', { username: req.session.email});
        }
    }
    else if(req.session.usertype === "bagisci"){
        res.render('bagisistekleri', { username: req.session.email});
    }
    else if(req.session.usertype === "admin"){
        res.render('bagisistekleri', { username: req.session.email});
    }

});

module.exports = router;
