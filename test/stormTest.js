'use strict';

var path = require('path'),
    logger = require('morgan'),
    express = require('express'),
    bodyParser = require('body-parser');

var app = express();
app.config = require('../config-test');

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

require('../lib/db').setDBProvider(dbProvider);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
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

var sessionId = "sessionTest";

var kafkaService = require('../lib/services/kafka')(app.config.kafka.uri);


try{
    var task = kafkaService.createTopic;
    task.call(null, sessionId).then(function(err, retult){

    });
} catch(e){
    setTimeout(function () {
        var task = kafkaService.createTopic;
        task.call(null, sessionId).then(function(err, retult){

        });
    }, 1000);
}

var stormService = require('../lib/services/storm')(app.config.storm, app.config.mongodb.uri, app.config.kafka.uri);

var task = stormService.startTopology;
task.call(null, sessionId).then(function(err, retult){

});

var dataSource = require('../lib/traces');
dataSource.addConsumer(require('../lib/consumers/kafka')(app.config.kafka));

var _getAllFilesFromFolder = function(dir) {

    var filesystem = require("fs");

    filesystem.readdirSync(__dirname + dir).forEach(function(file) {
        file = dir+'/'+file;
        console.log("reading"+file);
        var source = Fs.readFileSync(__dirname + file);
        kafkaService.send(topic, source);
        //results.push(file);
    });
    //return results;
};

_getAllFilesFromFolder("/traces");

//kafkaService.removeTopic(sessionId);
//stormService.endTopology(sessionId);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    var info = {
        message: err.message
    };
    info.stack = err.stack;
    res.status(err.status || 500).send(info);
});

module.exports = app;
