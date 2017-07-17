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
var upgrader = require(Path.resolve(__dirname, '../upgrader.js'));
var AbstractController = require(Path.resolve(__dirname, './abstract-controller.js'));
var transformToVersion2 = require(Path.resolve(__dirname,
    '../transformers/mongo/transformToVersion2.js'));
var transformToVersion3 = require(Path.resolve(__dirname,
    '../transformers/mongo/transformToVersion3.js'));


function MongoController() {
    AbstractController.call(this, [transformToVersion2, transformToVersion3]);
    this.modelId = null;
    this.dbProvider = {
        db: function () {
            return this.database;
        }
    };
    this.db = require('../../../lib/db');
    this.db.setDBProvider(this.dbProvider);
}

MongoController.prototype = new AbstractController();
MongoController.prototype.constructor = MongoController;

MongoController.prototype.doConnect = function (config, callback) {
    config.mongodb.db = this.db;
    var MongoClient = require('mongodb').MongoClient;
    var connectionString = config.mongodb.uri;
    var that = this;
    MongoClient.connect(connectionString, function (err, db) {
        if (err) {
            callback(new Error('Impossible to connect to MongoDB ', err));
        } else {
            console.log('Successfully connected to ' + connectionString);
            that.dbProvider.database = db;
            callback(null, config);
        }
    });
};

MongoController.prototype.guessModelVersion = function(db, callback) {

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
};

MongoController.prototype.getModelVersion = function (config, callback) {
    var db = this.appConfig.mongodb.db;
    var model = new Collection(db, 'model');
    var version = '0';

    model.find({}, true).then(function (model) {
        if (!model) {
            console.log('MONGO DB Model Version not found, starting to guess version!');
            this.modelId = null;
            this.guessModelVersion(db, function (newVersion) {
                callback(null, newVersion);
            });
        } else {
            version = model.version.toString();
            this.modelId = model._id;
            callback(null, version);
        }
    }.bind(this)).fail(function (err) {
        callback(err);
    });
};

MongoController.prototype.setModelVersion = function (config, callback) {
    var db = this.appConfig.mongodb.db;
    var model = new Collection(db, 'model');

    var that = this;
    if (!this.modelId) {
        model.insert({
            version: that.nextTransformer.version.destination.toString()
        }).then(function (model) {
            console.log('Finished transform mongo phase!');
            callback(null, model);
        }).fail(function (err) {
            callback(err);
        });
    } else {
        model.findAndModify(that.modelId, {
            version: that.nextTransformer.version.destination.toString()
        }).then(function (model) {
            console.log('Finished transform mongo phase!');
            callback(null, model);
        }).fail(function (err) {
            callback(err);
        });
    }
};

upgrader.controller('mongo', new MongoController());

