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
var request = require('request');
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
var totalIndices = 0;
var indices = function(callback) {
    if (predefinedIndices) {
        return callback(null, predefinedIndices);
    }
    config.elasticsearch.esClient.cat.indices({format: 'json'}, function(err, indices) {
        var obj = [];
        var count = 0;
        var proccess;
        indices.forEach(function(index) {
            count++;
            proccess = !index.index.startsWith('.');
            proccess &= !index.index.startsWith('result');
            proccess &= !index.index.startsWith('analytics');
            proccess &= !index.index.startsWith('default');
            proccess &= !index.index.startsWith('beaconing');
            proccess &= !index.index.startsWith('opaque');
            if (proccess) {
                obj.push(index.index);
            }
            if (count === indices.length) {
                totalIndices = indices.length;
                callback(null, obj);
            }
        });
    });
};

var checkRoot = function (indexName, callback) {
    config.elasticsearch.esClient.indices.exists({index: 'analytics-' + indexName}, function (err, exists) {
        callback(null, indexName, exists);
    });
};

// Move documents from indices of traces
var moveTraces = function(indexName, isRoot, callback) {
    // Console.log('moving documents of', indexName);
    // console.log('-                              -');
    console.log('-- Moving: ' + indexName);

    let allRecords = [];
    let allFunctions = [];
    var movedCount = 0;
    var totalCount = 0;
    // The parent ID
    var glpId;

    var checkTraceAndInsert = function(hit) {
        return function(callback) {
            if (hit._source.glpId) {
                var newGlpId = hit._source.glpId.replace('analytics-', '');
                if (glpId && glpId !== newGlpId) {
                    console.warn('WARNING: More than one parent node in index ' + indexName + '?', glpId, '/', hit._source.glpId);
                }
                glpId = hit._source.glpId.replace('analytics-', '');
                if (glpId !== indexName) {
                    config.elasticsearch.esClient.index({
                        index: glpId,
                        type: hit._type,
                        body: hit._source
                    }, function (error, result) {
                        if (error) {
                            return callback(error);
                        }
                        movedCount++;
                        process.stdout.write('---- Moved Documents: ' + allRecords.length + '/' + totalCount + '\r');
                        return callback();
                    });
                } else {
                    process.stdout.write('---- Moved Documents: ' + allRecords.length + '/' + totalCount + '\r');
                    return callback();
                }
            }else {
                process.stdout.write('---- Moved Documents: ' + allRecords.length + '/' + totalCount + '\r');
                return callback();
            }
        };
    };

    var stopLooping = function(total_traces) {
        console.log('---- Moved Traces (' + total_traces + '): ' + indexName);
        isRoot |= ((total_traces > 1) && !glpId);
        return callback(null, 'results-' + indexName, glpId, isRoot);
    };

    config.elasticsearch.esClient.search({
        index: indexName,
        scroll: '10s',
        body: {
            query: {
                match_all: {}
            }
        }
    }, function getMoreUntilDone(error, response) {
        if (response.hits && response.hits.hits) {
            totalCount = response.hits.total;
            if (isRoot) {
                return stopLooping(totalCount);
            }

            allFunctions = [];
            for (var h in response.hits.hits) {
                var hit = response.hits.hits[h];
                allFunctions.push(checkTraceAndInsert(hit));
                allRecords.push(hit._id);
            }
            async.waterfall(allFunctions, function (err, result) {
                if (response.hits.total !== allRecords.length) {
                    config.elasticsearch.esClient.scroll({
                        scroll_id: response._scroll_id,
                        scroll: '10s'
                    }, getMoreUntilDone);
                } else {
                    stopLooping(totalCount);
                }
            });
        } else {
            console.log('---- No Traces');
            stopLooping(0);
        }
    });
};

// Move documents from results indices
var moveResults = function(indexName, rootIndex, isRoot, callback) {
    // Console.log('moving documents of index', indexName);
    // Console.log('-                              -');
    console.log('-- Moving Results: ' + indexName);

    let allRecords = [];
    let allFunctions = [];
    let totalCount = 0;
    var movedCount = 0;

    var insertObject = function(h, callback) {
        config.elasticsearch.esClient.index({
            index: 'results-' + rootIndex,
            type: h._type,
            id: indexName + '_' + h._id,
            body: h._source
        }, function (error, result) {
            if (error) {
                error = JSON.parse(error.response).error;
                if (error.type === 'illegal_argument_exception' && error.reason.indexOf('object field starting or ending with a [.]') !== -1) {
                    var problematic = error.reason.substring(error.reason.indexOf(': [') + 3, error.reason.length - 1);
                    var splitted = problematic.split('.');

                    var current = h._source;
                    for (var i = 0; i < splitted.length; i++) {
                        if (current[splitted[i]]) {
                            current = current[splitted[i]];
                        }else {
                            problematic = splitted[i];
                            break;
                        }
                    }

                    var key = null;
                    for (var k in current) {
                        if (k.indexOf(problematic) !== -1) {
                            key = k;
                            break;
                        }
                    }

                    if (key) {
                        var tmp = current[k];
                        delete current[k];
                        current[k.replace('.','')] = tmp;
                    }
                    insertObject(h, callback);
                }else if (error.type === 'illegal_argument_exception' && error.reason.indexOf('Limit of total fields [') !== -1) {
                    var quantity = parseInt(error.reason.substring(error.reason.indexOf('[') + 1, error.reason.indexOf(']'))) + 1000;
                    request.put(config.elasticsearch.uri + '/results-' + rootIndex + '/_settings', {
                        body: { 'index.mapping.total_fields.limit': quantity},
                        json: true
                    },function (err, httpResponse, body) {
                        console.log('Increased to ' + quantity);
                        insertObject(h, callback);
                    });
                }else {
                    return callback(error);
                }
            }else {
                movedCount++;
                process.stdout.write('---- Moved Results: ' + movedCount + '/' + totalCount + '\r');
                callback();
            }
        });
    };

    var checkResultAndInsert = function(hit) {
        return function(callback) {
            insertObject(hit, callback);
        };
    };

    config.elasticsearch.esClient.search({
        index: indexName,
        scroll: '10s',
        body: {
            query: {
                match_all: {}
            }
        }
    }, function getMoreUntilDone(error, response) {
        if (response.hits && response.hits.hits) {
            allFunctions = [];
            totalCount = response.hits.total;
            response.hits.hits.forEach(function (hit) {
                allRecords.push(hit._id);
                if (!isRoot || !hit._id.includes(rootIndex)) {
                    allFunctions.push(checkResultAndInsert(hit));
                }else {
                    totalCount++;
                }
            });
            async.waterfall(allFunctions, function (err, result) {
                if (err) {
                    return callback(err);
                }

                if (response.hits.total !== allRecords.length) {
                    config.elasticsearch.esClient.scroll({
                        scroll_id: response._scroll_id,
                        scroll: '10s'
                    }, getMoreUntilDone);
                } else {
                    console.log('---- Moved Results: ' + indexName);
                    callback(null, indexName.replace('results-', ''), rootIndex, isRoot);
                }
            });
        } else {
            console.log('---- No Results');
            callback(null, indexName.replace('results-', ''), rootIndex, isRoot);
        }
    });
};

// Obtain and modify all the visualizations for an activityId
var updateVisualizations = function(activityId, rootId, isRoot, callback) {
    console.log('-- Updating Visualizations: ' + activityId);
    var to_update = [];
    var total = [];
    config.elasticsearch.esClient.search({
        index: '.kibana',
        type: 'visualization',
        scroll: '10s',
        q: activityId
    }, function getMoreUntilDone(error, response) {

        response.hits.hits.forEach(function (hit) {
            total.push(hit._id);
            if (hit._id.indexOf(activityId) !== -1) {
                to_update.push(modifyVisualization(hit, activityId, rootId));
            }
        });

        if (response.hits.total !== total.length) {
            config.elasticsearch.esClient.scroll({
                scrollId: response._scroll_id,
                scroll: '10s'
            }, getMoreUntilDone);
        } else {
            async.waterfall(to_update, function (err, result) {
                console.log('-- Updated Visualizations: ' + to_update.length);
                callback(err, activityId, 'results-' + activityId, isRoot);
            });
        }
    });
};

// Modify a visualization updating its query and index where it points to
var modifyVisualization = function(hit, activityId, rootId) {
    return function(callback) {

        var obj = hit._source;
        var searchSource = JSON.parse(obj.kibanaSavedObjectMeta.searchSourceJSON);

        searchSource.index = rootId ? rootId : activityId;

        if (searchSource.query && searchSource.query.query_string) {
            if (!searchSource.query.query_string.query || searchSource.query.query_string.query === '') {
                searchSource.query.query_string.query = 'activityId:' + activityId;
            }else {
                searchSource.query.query_string.query = '(' + searchSource.query.query_string.query + ')';
                searchSource.query.query_string.query += ' AND activityId:' + activityId;
            }
        }else {
            searchSource.query = {query_string: {analyze_wildcard: true,query: 'activityId:' + activityId}};
        }

        obj.kibanaSavedObjectMeta.searchSourceJSON = JSON.stringify(searchSource);

        config.elasticsearch.esClient.index({
            index: '.kibana',
            type: 'visualization',
            id: hit._id,
            body: obj
        }, function (error, result) {
            if (!error) {
                console.log('---- Updated Visualization: ' + hit._id);
                callback();
            } else {
                callback(error);
            }
        });
    };
};

// Remove the indices 'traceIndex' and 'resultsIndex' if isRoot has the value 'false'
var removeIndex = function(tracesIndex, resultsIndex, isRoot, callback) {
    // Console.log('Remove indices', tracesIndex, resultsIndex, isRoot);

    var checkAndTryToDelete = function(index) {
        return function(cb) {
            if (!index) {
                return cb();
            }

            config.elasticsearch.esClient.indices.exists({index: index}, function (err, exist) {
                if (exist) {
                    config.elasticsearch.esClient.indices.delete({index: index}, function (err) {
                        console.log('---- Deleted: ' + index);
                        cb();
                    });
                }else {
                    cb();
                }
            });
        };
    };

    console.log('-- Deleting: ' + tracesIndex);
    if (isRoot) {
        console.log('---- ISROOT');
        callback();
    } else {
        async.waterfall([
                checkAndTryToDelete(tracesIndex),
                checkAndTryToDelete('opaque-values-' + tracesIndex),
                checkAndTryToDelete(resultsIndex),
                checkAndTryToDelete('opaque-values-' + resultsIndex)
            ], function (err, result) {
            callback(err);
        });
    }
};

// Make transformations for the list of indices and their results. Do the moveTraces, moveResults and RemoveIndex foreach activityID
var moveDocuments = function(indexList, callback) {
    // Console.log('movingDocuments');
    // console.log('indices to move:'+JSON.stringify(indexList));
    // first we do a search, and specify a scroll timeout

    var done = 0;
    async.eachSeries(indexList, function(indexName, callback) {
        async.waterfall([
            function(callback) { done++; console.log('\n' + indexName + '-------------------------------------------------------------------------- ' + done + '/' + totalIndices); callback(null, indexName);},
            checkRoot,
            moveTraces,
            moveResults,
            updateVisualizations,
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
