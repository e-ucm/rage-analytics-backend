'use strict';

var path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser');

var app = express();
app.config = require((process.env.NODE_ENV === 'test') ? './config-test' : './config');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.sendDefaultSuccessMessage = function () {
        res.json({
            message: 'Success.'
        });
    };
    next();
});

app.get('/', function (req, res) {
    res.render('apidoc');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({
        message: err.message
    });
});

module.exports = app;
