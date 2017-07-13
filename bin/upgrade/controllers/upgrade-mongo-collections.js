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

// Set database
var dbProvider = {
    db: function () {
        return this.database;
    }
};

var db = require('../../../lib/db');
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

function refresh(callback) {

    nextTransformer = null;
    var db = appConfig.mongodb.db;
    var model = new Collection(db, 'model');

    model.find({}, true).then(function (model) {
        if (!model) {
            console.log('MONGO DB Model Version not found, defaulting to initial version!');
            existingModelVersion = '1';
            modelId = null;
        } else {
            existingModelVersion = model.version.toString();
            modelId = model._id;
        }

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
    transform: transform
});

