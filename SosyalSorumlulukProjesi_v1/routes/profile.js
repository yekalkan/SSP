var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var e_mail=req.session.email;

    var db = req.db;
    var users = db.get('users');
    users.find({"email":e_mail}, function(err, result) {
        if (err) throw err;
        console.log(result);

        if(result.length > 0) {
            res.render('profile',{user:result[0],username:req.session.email});
        }
        else{
            res.send("user not found.");
        }
    });

});

module.exports = router;
