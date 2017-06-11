var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('esyalar', { username: req.session.email,userrealname: req.session.userrealname});
});

module.exports = router;
