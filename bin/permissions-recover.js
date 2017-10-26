/*
 * Copyright 2016 e-UCM (http://www.e-ucm.es/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * This project has received funding from the European Union's Horizon
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

var Path = require('path'),
    config = require(Path.resolve(__dirname, '../config.js')),
    elasticsearch = require('elasticsearch'),
    ObjectId = require('mongodb').ObjectId,
    async = require('async');

var MongoClient = require('mongodb').MongoClient;

var dbBackend;
var dbA2;

var esClient = new elasticsearch.Client({
    host: config.elasticsearch.uri,
    api: '5.0'
});

var connectToDB = function (connectionString, dbVar) {
    MongoClient.connect(connectionString, function (err, db) {
        if (err) {
            console.log(err);
            console.log('Impossible to connect to MongoDB. Retrying in 5s');
            setTimeout(connectToDB, 5000);
        } else {
            console.log('Successfully connected to ' + connectionString);
            if (dbVar === 'backend') {
                dbBackend = db;
            } else {
                dbA2 = db;
            }
            db.serverConfig.connected = false;
        }
    });
};

esClient.ping({
    // Ping usually has a 3000ms timeout
    requestTimeout: 3000
}, function (error) {
    if (error) {
        return console.trace('elasticsearch cluster is down!');
    }

    console.log('Successfully connected to elasticsearch: ' + config.elasticsearch.uri);

    connectToDB(config.mongodb.uri, 'backend');
    connectToDB(config.mongodb.uriA2, 'a2');

    setTimeout(function () {
        resolvePermissions();
    }, 2000);

});

var resolvePermissions = function () {

    var documentObj = {};
    var look = [];
    var mgetObj = {
        url: '/elasticsearch/_mget',
        permissions: {},
        key: 'docs._id',
        _id: ObjectId('58dea40f4ecf830c0e3f3856'),
        methods: [
            'post',
            'put'
        ]
    };

    esClient.search({
        index: '.kibana',
        type: 'dashboard',
        size: 5000
    }, function (error, response) {
        if (error || response.hits.total === 0) {
            if (!error) {
                error = new Error('No dashboards');
            }
            return handleError(error);
        }

        // Get games and sessions IDs from dashboards IDs
        async.eachSeries(response.hits.hits, function (doc, callback) {
            // 'dasboard_ID'
            var visID = doc._source.title.substring(10, doc._source.title.length); // Get _ID
            console.log('ID -- ', visID);
            documentObj[visID] = [doc._source.title, visID];
            var docJSON = JSON.parse(doc._source.panelsJSON);
            // Get visualizations that compose the dashboards
            docJSON.forEach(function(vis) {
                documentObj[visID].push(vis.id);
            });

            dbBackend.collection('versions').find({_id: ObjectId(visID)}).toArray(function (err, version) {
                if (err || !version || version.length === 0) {
                    dbBackend.collection('sessions').find({_id: ObjectId(visID)}).toArray(function (err, session) {
                        if (err || !session || session.length === 0) {
                            return callback();
                        }
                        console.log('session = ',session[0]._id);
                        session[0].teachers.forEach(function (tea) {
                            if (!mgetObj.permissions[tea]) {
                                mgetObj.permissions[tea] = ['5.0.0', 'default-kibana-index'];
                            }
                            documentObj[visID].forEach(function(resourceName) {
                                mgetObj.permissions[tea].push(resourceName);
                            });
                        });
                        return callback();
                    });
                } else {
                    console.log('version = ',version[0]._id);
                    var gameID = version[0].gameId;
                    // Get the username and create the object with the resources (dashboards, index and visualizations)
                    dbBackend.collection('games').find({_id: ObjectId(gameID)}).toArray(function (err, game) {
                        if (err || !game || game.length === 0) {
                            dbBackend.collection('sessions').find({_id: ObjectId(visID)}).toArray(function (err, session) {
                                if (err || !session || session.length === 0) {
                                    return callback();
                                }
                                console.log('session = ',session[0]);
                                session[0].teachers.forEach(function (tea) {
                                    if (!mgetObj.permissions[tea]) {
                                        mgetObj.permissions[tea] = ['5.0.0', 'default-kibana-index'];
                                    }
                                    documentObj[visID].forEach(function(resourceName) {
                                        mgetObj.permissions[tea].push(resourceName);
                                    });
                                });
                                return callback();
                            });
                        } else {
                            console.log('games = ',game[0]._id);
                            game[0].developers.forEach(function (dev) {
                                if (!mgetObj.permissions[dev]) {
                                    mgetObj.permissions[dev] = ['5.0.0', 'default-kibana-index'];
                                }
                                documentObj[visID].forEach(function (resourceName) {
                                    mgetObj.permissions[dev].push(resourceName);
                                });
                            });
                            return callback();
                        }
                    });
                }
            });
        }, function(err) {
            look = [mgetObj];
            dbA2.collection('applications').findOneAndUpdate(
                {prefix: 'kibana'},
                {$set: {look: look}},
                {upsert: true},
                function(error, item) {
                    handleError(error);
                });
        });
    });
};

var handleError = function(error) {
    console.error(error);
    process.exit(0);
};