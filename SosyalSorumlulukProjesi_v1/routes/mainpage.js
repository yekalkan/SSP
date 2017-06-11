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
           res.render('mainpage', { username: req.session.email,userrealname: req.session.userrealname});
       }
   }
   else if(req.session.usertype === "bagisci"){
       res.render('mainpage', { username: req.session.email,userrealname: req.session.userrealname});
   }
   else if(req.session.usertype === "admin"){
       res.render('mainpage', { username: req.session.email,userrealname: req.session.userrealname});
   }

});

module.exports = router;
