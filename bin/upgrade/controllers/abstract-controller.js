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

var async = require('async');
var Class = require('es-class');

/**
 *
 */
var AbstractController = Class({
    // Properties
    status: 1,
    appConfig: null,
    nextTransformer: null,
    transformers: [],
    existingModelVersion: null,

    // Methods
    connect: function (config, callback) {
        var self = this;

        self.appConfig = config;
        self.doConnect(config, function (err, result) {
            if (err) {
                self.status = 1;
                return callback(err, result);
            }
            callback(null, result);
        });
    },
    refresh: function(callback) {
        var self = this;
        self.getModelVersion(self.appConfig, function(err, modelVersion) {
            if (err) {
                console.log('Cannot retrieve the model version', err);
                return callback(err);
            }

            self.existingModelVersion = modelVersion;

            // STATUS == 0 -> OK no transition required
            //        == 1 -> PENDING, transform must be performed
            //        == 2 -> ERROR, an error has happened, no update
            self.status = 0;

            if (self.existingModelVersion !== self.appConfig.elasticsearch.modelVersion) {

                for (var i = 0; i < self.transformers.length; ++i) {
                    var transformer = self.transformers[i];
                    if (self.existingModelVersion === transformer.version.origin) {
                        self.nextTransformer = transformer;
                        break;
                    }
                }

                if (!self.nextTransformer) {
                    self.status = 2;
                } else {
                    self.status = 1;
                }

                // TODO check if all the transformers required exist
                // and are implemented
            }

            if (!self.nextTransformer) {
                return callback(null, {
                    status: self.status
                });
            }
            callback(null, {
                status: self.status,
                requirements: self.nextTransformer.requires,
                version: self.nextTransformer.version
            });

        });
    },
    transform: function(callback) {
        var self = this;
        async.waterfall([function (newCallback) {
                console.log('Starting executing transformer ' + JSON.stringify(self.nextTransformer.version, null, 4));
                newCallback(null, self.appConfig);
            }, self.nextTransformer.backup,
                self.nextTransformer.upgrade,
                self.nextTransformer.check],
            function (err, result) {
                if (err) {
                    console.error('Check failed (upgrade error?)');
                    console.error(err);
                    console.log('Trying to restore...');
                    return self.nextTransformer.restore(self.appConfig, function(restoreError, result) {
                        if (restoreError) {
                            console.error('Error on while restoring the database... sorry :)');
                            return callback(restoreError);
                        }

                        console.log('Restore OK.');
                        return callback(err);
                    });
                }

                console.log('Cleaning...');
                self.nextTransformer.clean(self.appConfig, function(cleanError, result) {

                    if (cleanError) {
                        console.error('Cleaned failed: database might contain unused information...');
                    } else {
                        console.log('Clean OK.');
                    }

                    this.setModelVersion(self.appConfig, function(err, result) {
                        if (err) {
                            return callback(err, result);
                        }
                        console.log('Finished transform transformers phase!');
                        callback(null, result);
                    });
                });
            });
    },

    // Abstract methods

    doConnect: function (config, callback) {
        throw new Error('Connect not implemented');
    },
    getModelVersion: function (config, callback) {
        throw new Error('getModelVersion not implemented');
    },
    setModelVersion: function (config, callback) {
        throw new Error('setModelVersion not implemented');
    }
});

exports.module = AbstractController;
