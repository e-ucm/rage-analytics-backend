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
    var esClient = this.appConfig.elasticsearch.esClient;
    var version = 0;

    esClient.get({
        index: '.model',
        type: 'version',
        id: '1'
    }, function (error, response) {
        if (error) {
            console.log('Error while retrieving ElasticSearch Model Version not found,' +
                ' defaulting to initial version!', error);
            version = '1';
        } else {
            if (response && response._id === '1' && response._source) {
                version = response._source.version;
                if (!version) {
                    console.log('ElasticSearch Model Version attribute not found, ' +
                        'defaulting to initial version!');
                    version = '1';
                } else {
                    version = version.toString();
                }
            } else {
                console.log('ElasticSearch Model Version response (hits) not found, ' +
                    'defaulting to initial version!');
                version = '1';
            }
        }

        callback(null, version);
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
