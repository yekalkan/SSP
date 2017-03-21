var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('temsilcibilgileri');
});

module.exports = router;
/**
 * Created by Emre on 21.3.2017.
 */
