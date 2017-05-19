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

/**
 * This file issues the needed requests to set up the default kibana index. *
 */

var Path = require('path');
var request = require('request');
var config = require(Path.resolve(__dirname, '../config.js'));
var elasticsearch = require('elasticsearch');

var defaultKibanaIndexValue = config.kibana.defaultIndex;

request({
    uri: config.elasticsearch.uri + '/_template/geopoint',
    method: 'PUT',
    body: {
      'order': 0,
      'template': '*',
      'settings': {},
      'mappings': {
        '_default_': {
          'properties': {
          	'ext': {
          		'type': 'object',
          		'properties': {
		            'location': {
		              'type': 'geo_point'
		            }
          		}
          	}
          }
        }
      }
    },
    json: true
}, function (err, httpResponse, body) {
    if (err) {
        console.error(err);
        console.log('Did not setup default Elasticsearch geopoint _template!');
    }

    console.log('Success setting up geopoint elasticsearch _template');
});

var esClient = new elasticsearch.Client({
    host: config.elasticsearch.uri,
    api: '5.0'
});

esClient.ping({
    // Ping usually has a 3000ms timeout
    requestTimeout: 3000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('Successfully connected to elasticsearch: ' + config.elasticsearch.uri);
        setupDefaultKibanaIndex();
    }
});

var setupDefaultKibanaIndex = function () {
    esClient.search({
        index: '.kibana',
        type: 'config'
    }, function (error, response) {
        if (!error) {
            if (response.hits) {
                var hits = response.hits.hits;
                if (hits.length < 1) {

                    console.log('Did not configure kibana default index, continuing anyway!');
                    return process.exit(0);
                }


                esClient.index({
                    index: '.kibana',
                    type: 'index-pattern',
                    id: defaultKibanaIndexValue,
                    body: {
                        title: defaultKibanaIndexValue,
                        timeFieldName: 'timestamp',
                        fields: '[]'
                    }
                }, function (error, response) {
                    if (!error) {
                        esClient.index({
                            index: defaultKibanaIndexValue,
                            type: 'empty',
                            id: null,
                            body: {timestamp: new Date()}
                        }, function (error, response) {
                            if (!error) {
                                for (var i = 0; i < hits.length; ++i) {

                                    var appData = hits[i];
                                    if (!appData._source.defaultIndex) {
                                        appData._source.defaultIndex = defaultKibanaIndexValue;
                                        addDefaultIndex(appData);
                                    }
                                }

                            } else {
                                return handleError(error);
                            }
                        });

                    } else {
                        return handleError(error);
                    }
                });

            }
        } else {
            return handleError(error);
        }
    });
};

var addDefaultIndex = function(appData) {
    esClient.index({
        index: '.kibana',
        type: 'config',
        id: appData._id,
        body: appData._source
    }, function (error, response) {
        if (!error) {

            console.log('Default Kibana Index setup complete for', appData._id);
        } else {
            return handleError(error);
        }
    });
};

var handleError = function(error) {
    console.error(error);
    console.error('Could not connect to ElasticsearchDB!');
    console.log('Did not configure kibana default index, continuing anyway!');
    process.exit(0);
};
