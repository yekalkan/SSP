var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {


    var db = req.db;
    var donationRequests = db.get('donationRequests');

    donationRequests.find({"_id" :requestID},function(err, result) {
        if (err) throw err;

     res.render('istek', { username: req.session.email, donationDetail : result[0],userrealname: req.session.userrealname});
        res.redirect('/');

    });



});

module.exports = router;
