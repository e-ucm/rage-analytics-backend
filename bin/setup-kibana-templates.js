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

var Path = require('path');
var config = require(Path.resolve(__dirname, '../config.js'));
var index = require(Path.resolve(__dirname, '../lib/kibana/defaultIndex.js'));
var visualizationArray = require(Path.resolve(__dirname, '../lib/kibana/defaultVisualizations.js'));
var elasticsearch = require('elasticsearch');

var esClient = new elasticsearch.Client({
    host: config.elasticsearch.uri,
    api: '5.6'
});

esClient.ping({
    // Ping usually has a 3000ms timeout
    requestTimeout: 3000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('Successfully connected to elasticsearch: ' + config.elasticsearch.uri);
        setupIndexTemplate();
        setupVisualizationTemplates();
        updateVisualizationMapping();
    }
});

var setupIndexTemplate = function () {
    esClient.index({
        index: '.template',
        type: 'index',
        id: index.title,
        body: index
    }, function (error, response) {
        if (!error) {
            console.log('Added Index template.');
        } else {
            return handleError(error);
        }
    });
};

var setupVisualizationTemplates = function() {
    visualizationArray.forEach(function (visualization) {
        esClient.search({
            index: '.template',
            q: '_id:' + visualization.title
        }, function (error, response) {
            if (response && response.hits && response.hits.total > 0) {
                console.log('Visualization template named:' + visualization.title + 'already exist, updating...');
            }

            esClient.index({
                id: visualization.title,
                index: '.template',
                type: 'visualization',
                body: visualization
            }, function (error, response) {
                if (!error) {
                    console.log('Added Visualization template named: ' + visualization.title);
                } else {
                    return handleError(error);
                }
            });
        });
    });
};

var updateVisualizationMapping = function() {
    esClient.indices.putMapping({
        index: '.kibana',
        type: 'visualization',
        body: {
            "dynamic": "strict",
            "properties": {
                "description": {
                    "type": "text"
                },
                "kibanaSavedObjectMeta": {
                    "properties": {
                        "searchSourceJSON": {
                            "type": "text"
                        }
                    }
                },
                "savedSearchId": {
                    "type": "keyword"
                },
                "title": {
                    "type": "text"
                },
                "uiStateJSON": {
                    "type": "text"
                },
                "version": {
                    "type": "integer"
                },
                "author": {
                    "type": "text"
                },
                "isTeacher": {
                    "type": "boolean"
                },
                "isDeveloper": {
                    "type": "boolean"
                }
            }
        }
    }, function (error, response) {
        if (!error) {
            console.log('Changed visualization mapping');
        } else {
            return handleError(error);
        }
    });
};

var handleError = function(error) {
    console.error(error);
    console.error('Could not connect to ElasticsearchDB!');
    process.exit(0);
};