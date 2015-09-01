'use strict';

var path = require('path'),
    logger = require('morgan'),
    express = require('express'),
    bodyParser = require('body-parser');

var app = express();
app.config = require((process.env.NODE_ENV === 'test') ? './config-test' : './config');

// Set database

var dbProvider = {
    db: function () {
        return this.database;
    }
};

var connectToDB = function () {
    var MongoClient = require('mongodb').MongoClient;
    var connectionString = app.config.mongodb.uri;
    MongoClient.connect(connectionString, function (err, db) {
        if (err) {
            console.log(err);
            console.log('Impossible to connect to MongoDB. Retrying in 5s');
            setTimeout(connectToDB, 5000);
        } else {
            console.log('Successfully connected to ' + connectionString);
            dbProvider.database = db;
        }
    });
};

connectToDB();

require('./lib/db').setDBProvider(dbProvider);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
if (app.get('env') === 'development') {
    app.use(logger('dev'));
}

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

app.use(app.config.apiPath + '/games', require('./routes/games'));
app.use(app.config.apiPath + '/sessions', require('./routes/sessions'));
app.use(app.config.apiPath + '/collector', require('./routes/collector'));

var sessions = require('./lib/sessions');

var kafkaService = require('./lib/services/kafka')(app.config.kafka.uri);
sessions.startTasks.push(kafkaService.createTopic);
sessions.endTasks.push(kafkaService.removeTopic);

var stormService = require('./lib/services/storm')(app.config.storm);
sessions.startTasks.push(stormService.startTopology);
sessions.endTasks.push(stormService.endTopology);

var dataSource = require('./lib/traces');
dataSource.addConsumer(require('./lib/consumers/kafka')(app.config.kafka));
dataSource.addConsumer(require('./lib/consumers/openlrs')(app.config.lrs));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    var info = {
        message: err.message
    };
    info.stack = err.stack;
    res.status(err.status || 500).send(info);
});

module.exports = app;
