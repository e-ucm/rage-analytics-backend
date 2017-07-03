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
var inherits = require('util').inherits;
var AbstractController = require(Path.resolve(__dirname, './abstract-controller.js'));


function MongoController(transformers) {
    AbstractController.call(this, transformers);
    this.modelId = null;
    this.dbProvider = {
        db: function () {
            return this.database;
        }
    };
    this.db = require('../../../lib/db');
    this.db.setDBProvider(this.dbProvider);
}

inherits(MongoController, AbstractController);

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

MongoController.prototype.getModelVersion = function (config, callback) {
    var db = this.appConfig.mongodb.db;
    var model = new Collection(db, 'model');
    var version = '0';

    var that = this;
    model.find({}, true).then(function (model) {
        if (!model) {
            console.log('MONGO DB Model Version not found, defaulting to initial version!');
            version = '1';
            that.modelId = null;
        } else {
            that.modelId = model._id;
            version = model.version;
        }
        callback(null, version);
    }).fail(function (err) {
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

upgrader.controller('mongo', new MongoController([require(Path.resolve(__dirname,
    '../transformers/mongo/transformToVersion2.js')), require(Path.resolve(__dirname,
    '../transformers/mongo/transformToVersion3.js'))]));


