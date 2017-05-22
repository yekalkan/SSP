var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/SSPdatabase');

var index = require('./routes/index');
var login = require('./routes/login');
var signup = require('./routes/signup');
var mainpage = require('./routes/mainpage');
var temsilcibilgileri = require('./routes/temsilcibilgileri');
var profile = require('./routes/profile');
var kullanicilar = require('./routes/kullanicilar');
var esyabilgileri = require('./routes/esyabilgileri');
var bagisistekleri = require('./routes/bagisistekleri');
var bagiscibilgileri = require('./routes/bagiscibilgileri');
var istek = require('./routes/istek');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'ssshhhhh', saveUninitialized: true, resave: true}));


app.use(function (req, res, next) {
    req.db = db;
    next();
});

app.use('/', index);
app.use('/login', login);
app.use('/signup', signup);
app.use('/mainpage', mainpage);
app.use('/temsilcibilgileri', temsilcibilgileri);
app.use('/profile', profile);
app.use('/kullanicilar', kullanicilar);
app.use('/bagisistekleri', bagisistekleri);
app.use('/esyabilgileri', esyabilgileri);
app.use('/bagiscibilgileri', bagiscibilgileri);
app.use('/istek', istek);


app.post('/loginprovider', function (req, res) {
    var e_mail = req.body.email.trim();
    var password = req.body.password;

    var db = req.db;
    var users = db.get('users');
    users.find({"email": e_mail, "password": password}, function (err, result) {
        if (err) throw err;
        console.log(result);

        if (result.length > 0) {
            req.session.email = e_mail;
            req.session.loggedin = true;
            req.session.usertype = result[0].usertype;

            if (result[0].usertype === "temsilci" && result[0].signupstatus === "infoneeded") {
                req.session.infoneeded = true;
                res.redirect('/temsilcibilgileri');
            }
            else {
                req.session.infoneeded = false;
                res.redirect('/mainpage');
            }
        }
        else {
            res.redirect('/login');
        }
    });
});


app.post('/yenikullanici', function (req, res) {
    var e_mail = req.body.email.trim();
    var password = req.body.password;
    var password2 = req.body.password2;
    var userType = req.body.usertype;


    var db = req.db;
    var users = db.get('users');
    users.insert({
        "email": e_mail,
        "password": password,
        "usertype": userType,
        "signupstatus": "infoneeded"
    }, function (err, result) {
        if (err) throw err;

        if (userType === "temsilci") {
            req.session.email = e_mail;
            req.session.usertype = userType;
            req.session.loggedin = true;
            req.session.infoneeded = true;
            res.redirect('/temsilcibilgileri');
        }
        else {
            req.session.email = e_mail;
            req.session.usertype = userType;
            req.session.loggedin = true;
            req.session.infoneeded = true;
            console.log(userType, "-----------------------");
            res.redirect('/bagiscibilgileri');
        }
    });
});


app.post('/kullanicibilgileri', function (req, res) {
    var e_mail = req.session.email;
    var userType = req.body.usertype;

    if (userType === "temsilci") {
        req.session.infoneeded = false;
        var db = req.db;
        var users = db.get('users');
        users.update({"email": e_mail}, {
            $set: {
                "signupstatus": "confirmneeded",
                "school": req.body.school,
                "name": req.body.name,
                "birthdate": req.body.birthdate,
                "address": {
                    "localaddress": req.body.address,
                    "district": req.body.district,
                    "city": req.body.city
                },
                "phone": req.body.phone
            }
        }, function (err, result) {
            if (err) throw err;

            req.session.infoneeded = false;
            res.redirect('/mainpage');
        });
    }
    else { // bagisci

        var db = req.db;
        var users = db.get('users');
        users.update({"email": e_mail}, {
            $set: {
                "signupstatus": "confirmed",
                "name": req.body.name,
                "birthdate": req.body.birthdate,
                "address": {
                    "localaddress": req.body.address,
                    "district": req.body.district,
                    "city": req.body.city
                },
                "phone": req.body.phone
            }
        }, function (err, result) {
            if (err) throw err;

            req.session.infoneeded = false;
            res.redirect('/mainpage');
        });
    }


});

app.post('/kullanicilistesi', function (req, res) {
    var db = req.db;
    var users = db.get('users');
    var kullanicilar = {};

    users.find({
        "usertype": "temsilci",
        "signupstatus": "confirmneeded"
    }, function (err, resultonayBekleyenTemsilciler) {
        if (err) throw err;

        kullanicilar.onayBekleyenTemsilciler = resultonayBekleyenTemsilciler;

        users.find({"usertype": "temsilci"}, function (err, resulttemsilciler) {
            if (err) throw err;

            kullanicilar.temsilciler = resulttemsilciler;

            users.find({"usertype": "bagisci"}, function (err, resultbagiscilar) {
                if (err) throw err;

                kullanicilar.bagiscilar = resultbagiscilar;

                users.find({"usertype": "admin"}, function (err, resultadminler) {
                    if (err) throw err;

                    kullanicilar.adminler = resultadminler;

                    console.log(kullanicilar);

                    res.send(kullanicilar);

                });

            });

        });

    });
});

app.post('/temsilcionayla', function (req, res) {
    var db = req.db;
    var users = db.get('users');
    users.update({"_id": req.body.id}, {
        $set: {
            "signupstatus": "confirmed"
        }
    }, function (err, result) {
        if (err) throw err;

        res.send("success");
    });
});

app.post('/cevapEkle', function (req, res) {
    var donationRequestID = req.body.donationRequestID;
    var comment = req.body.firstReply;
    var commentID = req.body.firstReplyID;


    console.log(donationRequestID, "---------------------donationRequestID--------------------------------");
    console.log(comment, "---------------------comment--------------------------------");
    console.log(commentID, "-----------1----------commentID--------------------------------");
    var db = req.db;
    var donationRequests = db.get('donationRequests');
    var currentTime = new Date();


    donationRequests.update({"_id": donationRequestID, "comments.commentID": commentID}, {
        $push: {
            'comments.$.replies': {
                "replyID": "0",
                "email": req.session.email,
                "comment": comment,
                "commentDate": currentTime
            }
        }
    }, {"upsert": true}, function (err, result) {
        if (err) throw err;

        donationRequests.find({"_id": donationRequestID}, function (err, result2) {
            if (err) throw err;
            res.render('istek', {username: req.session.email, donationDetail: result2[0]});
        });


    });


});


app.post('/yorumEkle', function (req, res) {
    var donationRequestID = req.body.donationRequestID;
    var comment = req.body.replyToAnswer;
    var commentID = req.body.replyToAnswerID;
    var secondCommentID = req.body.secondReplyID;

    console.log(donationRequestID, "---------------------donationRequestID--------------------------------");
    console.log(comment, "---------------------comment--------------------------------");
    console.log(commentID, "-----------1----------commentID--------------------------------");
    console.log(secondCommentID, "-------2-------------secondCommentID--------------------------------");
    var db = req.db;
    var donationRequests = db.get('donationRequests');
    var currentTime = new Date();
    var maxCommentNumber = 0;

    if (typeof query !== secondCommentID && query) {
        secondCommentID = 0;
        console.log("yoruma ilk cevap", "----------------");
    }


    donationRequests.update({"_id": donationRequestID, "comments.commentID": commentID}, {
        $push: {
            'comments.$.replies': {
                "replyID": secondCommentID.toString(),
                "email": req.session.email,
                "comment": comment,
                "commentDate": currentTime
            }
        }
    }, {"upsert": true}, function (err, result) {
        if (err) throw err;
        donationRequests.find({"_id": donationRequestID}, function (err, result2) {
            if (err) throw err;
            res.render('istek', {username: req.session.email, donationDetail: result2[0]});
        });
    });


});

app.post('/konuyaYorumEkle', function (req, res, next) {
    var donationRequestID = req.body.donationRequestIDReply;
    var comment = req.body.replyToThread;

    console.log(donationRequestID, "---------------------donationRequestID--------------------------------");
    console.log(comment, "---------------------comment--------------------------------");

    var db = req.db;
    var donationRequests = db.get('donationRequests');
    var currentTime = new Date();
    var newCommentID;

    donationRequests.find({"_id": donationRequestID}, function (err, result) {
        if (err) throw err;

        console.log(result[0], "---------------------------------------");
        newCommentID = Object.keys(result[0].comments).length;
        console.log(newCommentID, "-------------------comment count------------------");

        donationRequests.update({"_id": donationRequestID}, {
            $push: {
                'comments': {
                    "commentID": newCommentID.toString(),
                    "email": req.session.email,
                    "comment": comment,
                    "commentDate": currentTime
                }
            }
        }, function (err, result2) {
            if (err) throw err;

            donationRequests.find({"_id": donationRequestID}, function (err, result3) {
                if (err) throw err;
                res.render('istek', {username: req.session.email, donationDetail: result3[0]});
            });

        });

    });


});

app.post('/esyaSil', function (req, res) {
    var db = req.db;
    var users = db.get('item');
    users.update({"_id": req.body.id}, {
        $set: {
            "signupstatus": "confirmed"
        }
    }, function (err, result) {
        if (err) throw err;

        res.send("success");
    });
});

app.post('/esyalarigetir', function (req, res) {
    var db = req.db;
    var items = db.get('item');

    items.find({}, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

app.post('/yeniesyaekle', function (req, res) {
    var db = req.db;
    var items = db.get('item');
    var itemType = req.body.itemType;
    var item = req.body.item;

    items.update({"itemType": itemType}, {
        $addToSet: {
            "itemList": [item]
        }
    }, function (err, result) {
        if (err) throw err;
        res.redirect('/esyabilgileri');
    });
});

app.post('/yeniesyaturuekle', function (req, res) {
    var db = req.db;
    var items = db.get('item');
    var itemType = req.body.itemType;

    items.insert({"itemType": itemType, "itemList": []}, function (err, result) {
        if (err) throw err;
        res.redirect('/esyabilgileri');
    });
});

app.post('/bagisisteklerinigetir', function (req, res) {
    var db = req.db;
    var donationRequests = db.get('donationRequests');

    donationRequests.find({"status": "Aktif"}, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

app.post('/istekGetir', function (req, res) {

    var requestID = req.body.requestID;

    var db = req.db;
    var donationRequests = db.get('donationRequests');

    donationRequests.find({"_id": requestID}, function (err, result) {
        if (err) throw err;

        console.log(requestID, "---------------------------------------")
        res.render('istek', {username: req.session.email, donationDetail: result[0]});
    });
});

app.post('/yeniBagis', function (req, res) {
    var itemType = req.body.itemType;
    var item = req.body.item;
    console.log("-----------------------------------------------------------------", item);
    var itemCount = req.body.requestedCount;

    var db = req.db;
    var currentTime = new Date();
    var donationRequests = db.get('donationRequests');
    var users = db.get('users');

    // donationRequests.insert({"date":currentTime,"status":"Aktif","user":req.session.email,"itemType":itemType, "item":item,"totalcount":itemCount.toString(), "donatedCount":0}, function(err, result) {
    //     if (err) throw err;
    // });

    users.find({"email": req.session.email}, function (err, result) {
        if (err) throw err;

        donationRequests.insert({
            "date": currentTime,
            "status": "Aktif",
            "user": req.session.email,
            "itemType": itemType,
            "address": result[0].address,
            "item": item,
            "totalcount": itemCount.toString(),
            "donatedCount": 0,
            "promisedCount": 0
        }, function (err, result2) {
            if (err) throw err;
        });
    });
    res.redirect('/mainpage');
});

app.post('/bagisekle', function (req, res) {
    var reqId = req.body.reqId;
    var donator = req.session.email;
    var donationCount = req.body.donationCount;
    console.log("-----------------------------------------------------------------", reqId);
    var db = req.db;
    var currentTime = new Date();
    var donations = db.get('donation');
    var donationRequests = db.get('donationRequests');
    var users = db.get('users');


    donationRequests.find({"_id": reqId}, function (err, result) {
        if (err) throw err;

        if (result.length > 0) {

            if (result2.length > 0) {
                donations.insert({
                    "requestId": reqId, "date": currentTime, "donationStatus": "Aktif",
                    "donator": donator, "donationCount": donationCount, "cargoInfo": ""
                }, function (err, result3) {
                    if (err) throw err;

                    donationRequests.update({"_id": reqId}, {
                        $set: {
                            "promisedCount": result[0].promisedCount + donationCount
                        }
                    }, function (err, result4) {
                        if (err) throw err;

                        res.redirect('/profile');
                    });
                });
            }
        }
    });


    res.redirect('/profile');
});


app.post('/kullanicininbagislarinigetir', function (req, res) {
    var db = req.db;
    var donationRequests = db.get('donationRequests');
    var donations = db.get('donation');

    donations.find({"donator": req.session.email}, function (err, result) {
        if (err) throw err;
        var queryString = "{ $or: [ ";
        for (var i; i < result.length; i++) {
            queryString += '{"_id": ' + result[i]._id + ' }';
            if (i != result.length - 1) {
                queryString += ',';
            }
        }
        queryString += ' ] }';

        donationRequests.find(queryString, function (err, result2) {
            if (err) throw err;
            console.log(result);

            var finalResult = {};
            finalResult.donations = result;
            finalResult.donationRequests = result2;
            res.send(finalResult);
        });

    });


});


app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.get('/wsUser', function (req, res) {
    var db = req.db;
    var users = db.get('users');
    users.find({}, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
