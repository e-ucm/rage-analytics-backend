/*
 * Copyright 2016 e-UCM (http://www.e-ucm.es/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * This project has received funding from the European Union’s Horizon
 * 2020 research and innovation programme under grant agreement No 644187.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0 (link is external)
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var path = require('path'),
    logger = require('morgan'),
    express = require('express'),
    bodyParser = require('body-parser'),
    elasticsearch = require('elasticsearch');

var app = express();
var isTest = (process.env.NODE_ENV === 'test');
app.config = require(isTest ? './config-test' : './config');

// Set database

var dbProvider = {
    db: function () {
        return this.database;
    }
};

var kafkaService = require('./lib/services/kafka')(app.config.kafka.uri);
var stormService = require('./lib/services/storm')(app.config.storm, app.config.kafka.uri);

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

            if (!isTest) {
                kafkaService.createTopic(app.config.kafka.topicName);
                stormService.startTopology(app.config.storm.defaultAnalysisName, app.config.kafka.topicName);
                setTimeout(function () {
                    var tkFolder = process.env.RAGE_ANALYTICS_BACKEND_TK_REALTIMEJAR;
                    if (!tkFolder) {
                        tkFolder = '/app/output/tk/realtime-jar-with-dependencies.jar';
                    }
                    app.config.storm.realtimeJar = tkFolder;
                    stormService.startTopology(app.config.storm.defaultAnalysisName + 'tk', app.config.kafka.topicName);
                }, 30000);
            }
        }
    });
};

app.esClient = new elasticsearch.Client({
    host: app.config.elasticsearch.uri,
    api: '5.6'
});

app.esClient.ping({
    // Ping usually has a 3000ms timeout
    requestTimeout: 3000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('Successfully connected to elasticsearch: ' + app.config.elasticsearch.uri);
    }
});

connectToDB();

require('./lib/db').setDBProvider(dbProvider);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
if (app.get('env') === 'development') {
    app.use(logger('dev'));
}

app.use(bodyParser.json({limit: app.config.maxSizeRequest}));
app.use(bodyParser.urlencoded({extended: false, limit: app.config.maxSizeRequest}));
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
app.use(app.config.apiPath + '/classes', require('./routes/classes'));
app.use(app.config.apiPath + '/activities', require('./routes/activities')(kafkaService, stormService));
app.use(app.config.apiPath + '/analysis', require('./routes/analysis'));
app.use(app.config.apiPath + '/collector', require('./routes/collector'));
app.use(app.config.apiPath + '/health', require('./routes/health'));
app.use(app.config.apiPath + '/kibana', require('./routes/kibana'));
app.use(app.config.apiPath + '/lti', require('./routes/lti'));
app.use(app.config.apiPath + '/env', require('./routes/env'));

var activities = require('./lib/activities');
activities.preRemove(function (_id, next) {
    activities.deleteAnalysisData(app.config, _id, app.esClient);
    next();
});

var dataSource = require('./lib/traces');
dataSource.addConsumer(require('./lib/consumers/fsraw')(app.config.rawTracesFolder));
dataSource.addConsumer(require('./lib/consumers/elasticsearch')(app.esClient));
dataSource.addConsumer(require('./lib/consumers/kafka')(app.config.kafka));

if (app.config.lrs.useLrs === true) {
    dataSource.addConsumer(require('./lib/consumers/openlrs')(app.config.lrs));
}

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    var info = {
        message: err.message
    };
    info.stack = err.stack;
    res.status(err.status || 500).send(info);
});

module.exports = app;
