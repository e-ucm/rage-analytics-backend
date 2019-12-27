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
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

var Path = require('path');
var config = require(Path.resolve(__dirname, '../../config.js'));
var async = require('async');
var elasticsearch = require('elasticsearch');

// Unify only the indices from this array if not empty
var predefinedIndices;

var connect = function(callback) {
    var baseUsersAPI = config.elasticsearch.uri;

    var esClient = new elasticsearch.Client({
        host: baseUsersAPI,
        api: '5.6'
    });

    esClient.ping({
        // Ping usually has a 3000ms timeout
        requestTimeout: 3000
    }, function (error) {
        if (error) {
            callback(new Error('Elasticsearch cluster is down!' + error));
        } else {
            console.log('Successfully connected to elasticsearch!');
            config.elasticsearch.esClient = esClient;
            callback(null);
        }
    });
};

// Get the list of indices. The indices doesn't start with '.', 'result', 'analysis' or 'default'.
// Modify this method if there are more key words
var indices = function(callback) {
    if (predefinedIndices) {
        return callback(null, predefinedIndices);
    }
    config.elasticsearch.esClient.cat.indices({format: 'json'}, function(err, indices) {
        var obj = [];
        var count = 0;
        indices.forEach(function(index) {
            count++;
            if (!index.index.startsWith('.') && !index.index.startsWith('result') && !index.index.startsWith('analytics') && !index.index.startsWith('default')) {
                obj.push(index.index);
            }
            if (count === indices.length) {
                callback(null, obj);
            }
        });
    });
};

// Move documents from indices of traces
var moveTraces = function(indexName, callback) {
    // Console.log('moving documents of', indexName);
    // console.log('-                              -');

    let allRecords = [];
    var movedCount = 0;
    // The parent ID
    var glpId;
    // True if traces doesn't has parents
    var isRoot = true;
    config.elasticsearch.esClient.search({
        index: indexName,
        scroll: '5s',
        body: {
            query: {
                match_all: {}
            }
        }
    }, function getMoreUntilDone(error, response) {
        if (response.hits && response.hits.hits) {
            // Collect all the records
            // console.log('total docs: ', response.hits.total);
            response.hits.hits.forEach(function (hit) {
                allRecords.push(hit);
                // Check that the trace has a parent
                if (hit._source.glpId) {
                    // Console.log('has parent GLP ID')
                    var newGlpId = hit._source.glpId.replace('analytics-', '');
                    if (glpId && glpId !== newGlpId) {
                        console.warn('WARNING: More than one parent node in index ' + indexName + '?', glpId, '/', hit._source.glpId);
                    }
                    glpId = hit._source.glpId.replace('analytics-', '');
                    if (glpId !== indexName) {
                        isRoot = false;
                        config.elasticsearch.esClient.index({
                            index: glpId,
                            type: hit._type,
                            body: hit._source
                        }, function (error, result) {
                            if (error) {
                                return callback(error);
                            }
                            movedCount++;
                            // Console.log('Moved documents', movedCount, 'de', indexName, 'a', glpId);
                        });
                    } else {
                        // Console.log('Raiz - No hay que hacer nada')
                    }
                }
            });
            if (response.hits.total !== allRecords.length) {
                // Now we can call scroll over and over
                config.elasticsearch.esClient.scroll({
                    scroll_id: response._scroll_id,
                    scroll: '5s'
                }, getMoreUntilDone);
            } else {
                // Console.log('Index:', indexName, isRoot, 'procesado', '--continuar con', 'results-'+indexName, 'raiz: ', glpId);
                // console.log('#############################');
                callback(null, 'results-' + indexName, glpId, isRoot);
            }
        } else {
            // Console.log('No data');
            // console.log('Index:', indexName, isRoot, 'procesado', '--continuar con', 'result-'+indexName, 'raiz: ', glpId);
            // console.log('################################');
            callback(null, 'result-' + indexName, glpId, isRoot);
        }
    });
};

// Move documents from results indices
var moveResults = function(indexName, rootIndex, isRoot, callback) {
    console.log('moving documents of index', indexName);
    // Console.log('-                              -');

    let allRecords = [];
    var movedCount = 0;
    config.elasticsearch.esClient.search({
        index: indexName,
        scroll: '5s',
        body: {
            query: {
                match_all: {}
            }
        }
    }, function getMoreUntilDone(error, response) {
        if (response.hits && response.hits.hits) {
            // Console.log('total docs: ', response.hits.total);
            response.hits.hits.forEach(function (hit) {
                allRecords.push(hit);
                if (!isRoot || !hit._id.includes(rootIndex)) {
                    config.elasticsearch.esClient.index({
                        index: 'results-' + rootIndex,
                        type: hit._type,
                        id: indexName + '_' + hit._id,
                        body: hit._source
                    }, function (error, result) {
                        if (error) {
                            return callback(error);
                        }
                        movedCount++;
                        // Console.log('Moved documents', movedCount, 'de', indexName, 'a', 'results-' + rootIndex);
                    });
                }
            });
            if (response.hits.total !== allRecords.length) {
                // Now we can call scroll over and over
                config.elasticsearch.esClient.scroll({
                    scroll_id: response._scroll_id,
                    scroll: '5s'
                }, getMoreUntilDone);
            } else {
                // Console.log('Remove indices:', indexName.replace('results-', ''), indexName, isRoot );
                // console.log('################################');
                callback(null, indexName.replace('results-', ''), indexName, isRoot);

            }
        } else {
            // Console.log('No data');
            // console.log('Remove indices:', indexName.replace('results-', ''), indexName, isRoot );
            // console.log('################################');
            callback(null, indexName.replace('results-', ''), indexName, isRoot);
        }
    });
};

// Remove the indices 'traceIndex' and 'resultsIndex' if isRoot has the value 'false'
var removeIndex = function(tracesIndex, resultsIndex, isRoot, callback) {
    // Console.log('Remove indices', tracesIndex, resultsIndex, isRoot);
    if (isRoot) {
        callback();
    } else {
        if (tracesIndex) {
            config.elasticsearch.esClient.indices.delete({index: tracesIndex}, function (err) {
                if (err) {
                    return callback(err);
                }
                config.elasticsearch.esClient.indices.exists({index: 'opaque-values-'+tracesIndex}, function (err, exist) {
                    if (exist) {
                        config.elasticsearch.esClient.indices.delete({index: 'opaque-values-'+tracesIndex}, function (err) {
                            
                        });
                    }
                });
                if (resultsIndex) {
                    config.elasticsearch.esClient.indices.exists({index: resultsIndex}, function (err, exist) {
                        if (exist) {
                            config.elasticsearch.esClient.indices.delete({index: resultsIndex}, function (err) {
                                callback(err);
                            });
                        }
                    });
                } else {
                    callback();
                }
            });
        }
    }
};

// Make transformations for the list of indices and their results. Do the moveTraces, moveResults and RemoveIndex foreach activityID
var moveDocuments = function(indexList, callback) {
    // Console.log('movingDocuments');
    // console.log('indices to move:'+JSON.stringify(indexList));
    // first we do a search, and specify a scroll timeout

    async.each(indexList, function(indexName, callback) {
        async.waterfall([
            function(callback) {callback(null, indexName);},
            moveTraces,
            moveResults,
            removeIndex
        ], function (err, result) {
            callback(err);
        });
    }, function(err) {
        // If any of the file processing produced an error, err would equal that error
        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('Come index failed to process', err);
        } else {
            console.log('All index have been processed successfully');
        }
    });
};

// Main function.
// 1. Connect to ElasticSearch
// 2. Get the indices of traces name
// 3. Call the moveDocuments function for the list of indices.
async.waterfall([
    connect,
    indices,
    moveDocuments
], function (err, result) {
    // Result now equals 'done'
});
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers