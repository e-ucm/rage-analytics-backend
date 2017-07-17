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
var elasticsearch = require('elasticsearch');
var upgrader = require(Path.resolve(__dirname, '../upgrader.js'));
var AbstractController = require(Path.resolve(__dirname, './abstract-controller.js'));
var transformerToVersion2 = require(Path.resolve(__dirname,
    '../transformers/elastic/transformToVersion2.js'));

function ElasticController() {
    AbstractController.call(this, [transformerToVersion2]);
}

ElasticController.prototype = new AbstractController();
ElasticController.prototype.constructor = ElasticController;

ElasticController.prototype.doConnect = function (config, callback) {
    var baseUsersAPI = config.elasticsearch.uri;

    var esClient = new elasticsearch.Client({
        host: baseUsersAPI,
        api: '5.0'
    });

    esClient.ping({
        // Ping usually has a 3000ms timeout
        requestTimeout: 3000
    }, function (error) {
        if (error) {
            callback(new Error('Elasticsearch cluster is down!' + error));
        } else {
            console.log('Successfully connected to elasticsearch!', baseUsersAPI);
            config.elasticsearch.esClient = esClient;
            callback(null, config);
        }
    });
};

ElasticController.prototype.getModelVersion = function (config, callback) {
    var esClient = config.elasticsearch.esClient;
    var modelVersion = null;

    esClient.get({
        index: '.model',
        type: 'version',
        id: '1'
    }, function (error, response) {
        var needsVersionGuessing = false;
        if (error) {
            console.log('Error while retrieving ElasticSearch Model Version not found,' +
                ' will start guessing version!', error);
            needsVersionGuessing = true;
        } else {
            if (response && response._id === '1' && response._source) {
                var version = response._source.version;
                if (!version) {
                    console.log('ElasticSearch Model Version attribute not found, ' +
                        'will start guessing version!');
                    needsVersionGuessing = true;
                } else {
                    modelVersion = version.toString();
                }
            } else {
                console.log('ElasticSearch Model Version response (hits) not found, ' +
                    'will start guessing version!');
                needsVersionGuessing = true;
            }
        }

        if (needsVersionGuessing) {
            this.guessModelVersion(esClient, function(newVersion) {
                callback(null, newVersion);
            });
        } else {
            callback(null, modelVersion);
        }
    });
};

ElasticController.prototype.guessModelVersion = function(esClient, callback) {
    console.log('Trying to guess elasticsearch existing model version!');
    var defaultIndex = require(Path.resolve(__dirname, '../../../lib/kibana/defaultIndex.js'));
    var indexId = 'defaultIndex';

    if (defaultIndex && defaultIndex.title) {
        indexId = defaultIndex.title;
    }
    esClient.get({
        index: '.template',
        type: 'index',
        id: indexId
    }, function (error, response) {
        var minVersion = '1';
        if (error) {
            console.log('Error while retrieving ElasticSearch .template (defaultIndex) not found,' +
                ' defaulting to initial version!', error);
            callback(minVersion);
        } else {
            if (response && response._id === indexId && response._source) {
                var fieldStr = response._source.fields;
                if (!fieldStr) {
                    console.log('ElasticSearch Model Version attribute not found, ' +
                        'defaulting to initial version!');
                    callback(minVersion);
                } else {
                    try {
                        var fields = JSON.parse(fieldStr);

                        if (fields && fields.length > 0) {
                            var isVersion2 = false;

                            for (var i = 0; i < fields.length; ++i) {
                                var field = fields[i];
                                if (field && field.name && field.name.indexOf('ext.') === 0) {
                                    isVersion2 = field;
                                    break;
                                }
                            }

                            if (isVersion2) {
                                console.log('Fields parsed, found ext. def at field ' + JSON.stringify(isVersion2, null, 4));
                                callback('2');
                            } else {
                                console.log('Fields parsed object has elements but no ext valued found, defaulting to minimum version');
                                callback(minVersion);
                            }
                        } else {
                            console.log('Fields parsed object is null or empty array, defaulting to minimum version');
                            callback(minVersion);
                        }
                    } catch (ex) {
                        console.log('Error parsing .template defaultIndex.fields', ex);
                        callback(minVersion);
                    }
                }
            } else {
                callback(minVersion);

            }
        }

    });
};

ElasticController.prototype.setModelVersion = function (config, callback) {
    var esClient = this.appConfig.elasticsearch.esClient;
    esClient.index({
        index: '.model',
        type: 'version',
        id: '1',
        body: {
            version: this.nextTransformer.version.destination
        }
    }, function (error, response) {
        if (error) {
            return callback(error, response);
        }
        console.log('Finished transform elastic transformers phase!');
        callback(null, response);
    });
};

upgrader.controller('elastic', new ElasticController());
