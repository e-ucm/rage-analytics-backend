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

var Path = require('path');
var Collection = require('easy-collections');
var async = require('async');
var upgrader = require(Path.resolve(__dirname, '../upgrader.js'));

var transformers = [
    require(Path.resolve(__dirname, '../transformers/mongo/transformToVersion2.js')),
    require(Path.resolve(__dirname, '../transformers/mongo/transformToVersion3.js'))
];

var existingModelVersion;
var nextTransformer;
var appConfig;
var modelId;

var db = require('../../../lib/db');
// Set database
var dbProvider = {
    db: function () {
        return this.database;
    }
};

db.setDBProvider(dbProvider);

function connect(config, callback) {
    config.mongodb.db = db;
    appConfig = config;
    var MongoClient = require('mongodb').MongoClient;
    var connectionString = config.mongodb.uri;
    MongoClient.connect(connectionString, function (err, db) {
        if (err) {
            callback(new Error('Impossible to connect to MongoDB ', err));
        } else {
            console.log('Successfully connected to ' + connectionString);
            dbProvider.database = db;

            callback(null, config);
        }
    });
}


function guessModelVersion(db, callback) {

    console.log('Starting to guess mongo model version!');
    var minVersion = '1';
    db.db.collections(function (error, collections) {
        if (error) {
            console.log('Failed to retrieve mongo collections, defaulting to min version!', error);
            return callback(minVersion);
        }

        if (!collections) {
            console.log('Mongo collections object does not exist, defaulting to min version!');
            return callback(minVersion);
        }

        if (collections.length === 0) {
            console.log('Mongo collections object has length 0, defaulting to min version!');
            return callback(minVersion);
        }

        var targetVersion = '2';
        for (var i = 0; i < collections.length; ++i) {
            var collection = collections[i];

            var collectionName = collection.name;
            if (collectionName === 'classes') {
                return callback(targetVersion);
            }

        }

        var sessionsCollection = db.collection('sessions');
        var cursor = sessionsCollection.find();

        var found = false;
        cursor.each(function (err, item) {
            if (found) {
                return;
            }
            if (err) {
                console.log('Unexpected error while iterating sessions, defaulting min version!', err);
                found = true;
                return callback(minVersion);
            }

            if (!item) {
                found = true;
                return callback(minVersion);
            }

            // If the item is null then the cursor is exhausted/empty and closed
            if (item && item.classId) {
                found = true;
                return callback(targetVersion);
            }
        });

    });
}

function refreshStatus(appConfig, callback) {
    // STATUS == 0 -> OK no transition required
    //        == 1 -> PENDING, transform must be performed
    //        == 2 -> ERROR, an error has happened, no update
    var status = 0;

    if (existingModelVersion !== appConfig.mongodb.modelVersion.toString()) {

        for (var i = 0; i < transformers.length; ++i) {
            var transformer = transformers[i];
            if (existingModelVersion === transformer.version.origin.toString()) {
                nextTransformer = transformer;
                break;
            }
        }

        if (!nextTransformer) {
            status = 2;
        } else {
            status = 1;
        }

        // TODO check if all the transformers required exist
        // and are implemented
    }

    if (!nextTransformer) {
        return callback(null, {
            status: status
        });
    }

    callback(null, {
        status: status,
        requirements: nextTransformer.requires,
        version: nextTransformer.version
    });
}

function refresh(callback) {

    nextTransformer = null;
    var db = appConfig.mongodb.db;
    var model = new Collection(db, 'model');

    model.find({}, true).then(function (model) {
        var needsGuessing = false;
        if (!model) {
            console.log('MONGO DB Model Version not found, starting to guess version!');
            needsGuessing = true;
            modelId = null;
        } else {
            existingModelVersion = model.version.toString();
            modelId = model._id;
        }

        if (needsGuessing) {
            guessModelVersion(db, function (newVersion) {
                existingModelVersion = newVersion;
                refreshStatus(appConfig, callback);
            });
        } else {
            refreshStatus(appConfig, callback);
        }
    });
}


function transform(callback) {
    async.waterfall([function (newCallback) {
            console.log('Starting executing mongo transformer ' + nextTransformer.version);
            newCallback(null, appConfig);
        }, nextTransformer.backup,
            nextTransformer.upgrade,
            nextTransformer.check],
        function (err, result) {
            if (err) {
                console.error('Check failed (upgrade error?)');
                console.error(err);
                console.log('Trying to restore...');
                return nextTransformer.restore(appConfig, function (restoreError, result) {
                    if (restoreError) {
                        console.error('Error on while restoring the database... sorry :)');
                        return callback(restoreError);
                    }

                    console.log('Restore OK.');
                    return callback(err);
                });
            }

            console.log('Cleaning...');
            nextTransformer.clean(appConfig, function (cleanError, result) {
                if (cleanError) {
                    console.error('Clean failed (!)');
                    console.error(err);
                    console.log('Trying to restore...');
                    return nextTransformer.restore(appConfig, function (restoreError, result) {
                        if (restoreError) {
                            console.error('Error on while restoring the database... sorry :)');
                            return callback(restoreError);
                        }

                        console.log('Restore OK.');
                        callback(err);
                    });
                }
                console.log('Clean OK.');

                var db = appConfig.mongodb.db;
                var model = new Collection(db, 'model');

                if (!modelId) {
                    model.insert({
                        version: nextTransformer.version.destination.toString()
                    }).then(function (model) {
                        console.log('Finished transform mongo phase!');
                        callback(null, model);
                    });
                } else {
                    model.findAndModify(modelId, {
                        version: nextTransformer.version.destination.toString()
                    }).then(function (model) {
                        console.log('Finished transform mongo phase!');
                        callback(null, model);
                    });
                }
            });
        });

}

upgrader.controller('mongo', {
    connect: connect,
    refresh: refresh,
    transform: transform,
    existingModelVersion: function () {
        return existingModelVersion;
    }
});

