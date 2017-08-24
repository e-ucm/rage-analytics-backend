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

// For ES specific naming convention we need to do this
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
var ObjectID = require('mongodb').ObjectID;
var retry = require('retry');

var opOpts = {
    retries: 10,
    factor: 2,
    minTimeout: 5000,
    maxTimeout: 60 * 5000,
    randomize: true
};

function processBulkErrors(esClient, bulk, operation, callback) {

    if (bulk.length === 0) {
        return callback(new Error('Fail in bulk API, bulk is empty!' + JSON.stringify(bulk, null, 4)));
    }

    operation.attempt(function (currAttempt) {
        // Do something when backoff starts, e.g. show to the
        // user the delay before next reconnection attempt.
        console.log('processBulkErrors attempt ' + currAttempt);
        esClient.bulk({
            body: bulk
        }, function (err, resp) {
            err = resp.errors || err;
            if (operation.retry(err)) {
                return;
            }
            callback(err ? operation.mainError() : null);
        });
    });
}


var defaultTraceAttributes = [
    'name', 'timestamp', 'event',
    'target', 'type',
    'gameplayId', 'versionId', 'session',
    'firstSessionStarted', 'currentSessionStarted',
    'score', 'success', 'completion', 'response',
    'stored', 'gameplayId_hashCode', 'event_hashCode',
    'type_hashCode', 'target_hashCode'
];
var extensions = [];

var defaultTimeout = '5m';

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var reindexManually = function (esClient, from, to, callback) {
    scrollIndex(esClient, from, function (err, finished, hits, finishedCallback) {
        if (err) {
            console.error('reindexManually - scrollIndex ' + from + ' ' + err);
            return callback(err);
        }

        if (finished) {
            return callback(null, from.index);
        }

        if (hits.hits.length === 0) {
            return callback(null, from.index);
        }

        var bulkUpgradedTraces = [];
        hits.hits.forEach(function (hit) {
            var trace = hit._source;
            if (trace) {
                bulkUpgradedTraces.push({update: {_index: to, _type: hit._type, _id: hit._id}});
                bulkUpgradedTraces.push({doc: trace, doc_as_upsert: true});
            }
        });
        esClient.bulk({
            body: bulkUpgradedTraces
        }, function (err, resp) {
            if (err || resp.errors) {
                var operation = retry.operation(opOpts);
                return processBulkErrors(esClient, bulkUpgradedTraces, operation, function (err) {
                    if (err) {
                        console.error('reindexManually - scrollIndex - processBulkErrors ' + from + ' ' + err);
                        return callback(err);
                    }
                    finishedCallback();
                });
            }
            finishedCallback();
        });
    });
};

var backUpIndex = function (esClient, index, callback) {
    var backupedIndex = 'backup_' + index.index;
    reindexManually(esClient, index, backupedIndex, function (err) {
        var found = false;
        for (var k = 0; k < indices.backup.length; ++k) {
            var backIndex = indices.backup[k];
            if (backIndex.index === backupedIndex) {
                found = true;
                break;
            }
        }
        if (!found) {
            var upgrade = Object.assign({}, index);
            upgrade.index = backupedIndex;
            indices.backup.push(upgrade);
        }
        callback(err, index);
    });
};

/**
 *      {
 *           "health": "yellow",
 *           "status": "open",
 *           "index": "index_name",
 *           "uuid": "L_P5yUBnRC-fzXVrtKkmpQ",
 *           "pri": "5",
 *           "rep": "1",
 *           "docs.count": "30",
 *           "docs.deleted": "0",
 *           "store.size": "206.1kb",
 *           "pri.store.size": "206.1kb"
 *       }
 * @type {{traces: Array, versions: Array, results: Array, opaqueValues: Array, games: Array, configs: {template: null, kibana: null, defaultKibanaIndex: null}, others: Array}}
 */
var indices = {
    traces: [],
    versions: [],
    results: [],
    opaqueValues: [],
    games: [],
    configs: {
        template: null,
        kibana: null,
        defaultKibanaIndex: null
    },
    others: [],
    backup: [],
    upgrade: [],
    deleted: {}
};

function checkIsVersionsIndex(index, config, callback) {
    var objectIdIndex;
    try {
        objectIdIndex = new ObjectID(index.index);
    } catch (ex) {
        console.log(ex, index, callback);
        indices.others.push(index);
        if (callback) {
            callback();
        }
        return;
    }

    config.mongodb.db.collection('versions')
        .findOne({_id: objectIdIndex}, function (err, res) {
            if (err) {
                indices.others.push(index);
            } else if (res) {
                indices.versions.push(index);
            }
            if (callback) {
                callback();
            }
        });
}

function checkIsTracesIndex(index, config, callback) {
    var objectIdIndex;
    try {
        objectIdIndex = new ObjectID(index.index);
    } catch (ex) {
        console.log(ex, index, callback);
        indices.others.push(index);
        if (callback) {
            callback();
        }
        return;
    }
    config.mongodb.db.collection('sessions')
        .findOne({_id: objectIdIndex}, function (err, res) {
            if (err) {
                indices.others.push(index);
                if (callback) {
                    callback();
                }
            } else if (res) {
                indices.traces.push(index);
                if (callback) {
                    callback();
                }
            } else {
                checkIsVersionsIndex(index, config, callback);
            }
        });
}

function attemptCatIndexErrors(esClient, callback) {
    var operation = retry.operation(opOpts);
    operation.attempt(function (currAttempt) {
        // Do something when backoff starts, e.g. show to the
        // user the delay before next reconnection attempt.
        console.log('attemptCatIndexErrors attempt ' + currAttempt);
        esClient.cat.indices({format: 'json'}, function (err, resp) {
            err = resp.errors || err;
            if (operation.retry(err)) {
                return;
            }
            callback(err ? operation.mainError() : null, resp);
        });
    });
}

function backup(config, callback) {

    var esClient = config.elasticsearch.esClient;

    attemptCatIndexErrors(esClient, function (error, response) {
        if (error) {
            return callback(error);
        }

        if (!response || response.length === 0) {
            return callback(null, config);
        }

        var finishedCount = finishedCountCallback(response.length, function () {
            callback(null, config);
        });

        var backedUpCallback = function (err, index, response) {
            if (err) {
                console.error('Backup error ' + err);
                return callback(err);
            }

            var indexName = index.index;
            if (indexName === '.kibana') {
                indices.configs.kibana = index;
                finishedCount();
            } else if (indexName === '.template') {
                indices.configs.template = index;
                finishedCount();
            } else if (indexName === 'default-kibana-index') {
                indices.configs.defaultKibanaIndex = index;
                finishedCount();
            } else if (indexName.indexOf('.games') === 0) {
                indices.games.push(index);
                finishedCount();
            } else if (indexName.indexOf('opaque-values-') === 0) {
                indices.opaqueValues.push(index);
                finishedCount();
            } else if (indexName.indexOf('results-') === 0) {
                indices.results.push(index);
                finishedCount();
            } else {
                checkIsTracesIndex(index, config, finishedCount);
            }
        };
        for (var i = 0; i < response.length; i++) {
            var index = response[i];
            if (index.index) {
                if (index.index.indexOf('backup_') === 0) {
                    indices.backup.push(index);
                    finishedCount();
                    continue;
                }
                if (index.index.indexOf('upgrade_') === 0) {
                    indices.upgrade.push(index);
                    finishedCount();
                    continue;
                }
            }
            backUpIndex(esClient, index, backedUpCallback);
        }
    });
}

function attemptGetIndexErrors(esClient, options, callback) {
    var operation = retry.operation(opOpts);
    operation.attempt(function (currAttempt) {
        // Do something when backoff starts, e.g. show to the
        // user the delay before next reconnection attempt.
        console.log('attemptGetIndexErrors attempt, ' + currAttempt + ' options, ' + JSON.stringify(options, null, 4));
        esClient.get(options, function (err, resp) {
            err = resp.errors || err;
            console.error('attemptGetIndexErrors ' + err);
            if (err && err.status === 404) {
                return callback();
            }
            if (operation.retry(err)) {
                return;
            }
            callback(err ? operation.mainError() : null, resp);
        });
    });
}


function attemptIndexErrors(esClient, options, callback) {
    var operation = retry.operation(opOpts);
    operation.attempt(function (currAttempt) {
        // Do something when backoff starts, e.g. show to the
        // user the delay before next reconnection attempt.
        console.log('attemptIndexErrors attempt, ' + currAttempt + ' options, ' + JSON.stringify(options, null, 4));
        esClient.index(options, function (err, resp) {
            err = resp.errors || err;
            if (operation.retry(err)) {
                return;
            }
            callback(err ? operation.mainError() : null, resp);
        });
    });
}

function upgradeGameIndex(esClient, gameIndex, callback) {
    attemptGetIndexErrors(esClient, {
        index: gameIndex.index,
        type: 'visualization',
        id: 'TotalSessionPlayers-Cmn'
    }, function (error, response) {
        if (error) {
            return callback(error);
        }

        if (!response || !response._source) {
            return callback();
        }

        attemptIndexErrors(esClient, {
            index: gameIndex.index,
            type: 'visualization',
            id: 'TotalSessionPlayers-Cmn',
            body: {
                title: 'TotalSessionPlayers-Cmn',
                visState: '{"title":"Total Session Players",' +
                '"type":"metric","params":{"handleNoResults":true,' +
                '"fontSize":60},"aggs":[{"id":"1","type":"cardinality",' +
                '"schema":"metric","params":{"field":"name.keyword",' +
                '"customLabel":"SessionPlayers"}}],"listeners":{}}',
                uiStateJSON: '{}',
                description: '',
                version: 1,
                kibanaSavedObjectMeta: {
                    searchSourceJSON: '{"index":"57604f53f552624300d9caa6",' +
                    '"query":{"query_string":{"query":"*","analyze_wildcard":true}},' +
                    '"filter":[]}'
                },
                author: '_default_',
                isTeacher: true,
                isDeveloper: true
            }
        }, function (error, response) {
            if (error) {
                return callback(error);
            }
            attemptGetIndexErrors(esClient, {
                index: gameIndex.index,
                type: 'visualization',
                id: 'xAPIVerbsActivity'
            }, function (errr, res) {
                if (errr) {
                    return callback(errr);
                }

                if (!res || !res._source) {
                    return callback();
                }

                attemptIndexErrors(esClient, {
                    index: gameIndex.index,
                    type: 'visualization',
                    id: 'xAPIVerbsActivity',
                    body: {
                        title: 'xAPIVerbsActivity',
                        visState: '{"title":"xAPI Verbs Activity",' +
                        '"type":"histogram","params":{"shareYAxis":true,' +
                        '"addTooltip":true,"addLegend":true,"scale":"linear",' +
                        '"mode":"stacked","times":[],"addTimeMarker":false,' +
                        '"defaultYExtents":false,"setYExtents":false,"yAxis":{}},' +
                        '"aggs":[{"id":"1","type":"count","schema":"metric",' +
                        '"params":{"customLabel":"Activity Count"}},{"id":"2",' +
                        '"type":"terms","schema":"segment","params":{' +
                        '"field":"event.keyword","size":15,"order":"desc",' +
                        '"orderBy":"1","customLabel":"xAPI Verb"}}],"listeners":{}}',
                        uiStateJSON: '{}',
                        description: '',
                        version: 1,
                        kibanaSavedObjectMeta: {
                            searchSourceJSON: '{"index":"57604f53f552624300d9caa6",' +
                            '"query":{"query_string":{"query":"*","analyze_wildcard":true}},' +
                            '"filter":[]}'
                        },
                        author: '_default_',
                        isTeacher: false,
                        isDeveloper: true
                    }
                }, function (error, response) {
                    if (callback) {
                        callback(error);
                    }
                });
            });
        });
    });
}

function finishedCountCallback(length, callback) {
    var finished = 0;
    return function () {
        finished++;
        if (finished >= length) {
            callback();
        }
    };
}

function upgradeGamesIndices(esClient, callback) {
    if (indices.games.length === 0) {
        return callback();
    }
    var i;
    for (i = 0; i < indices.games.length; i++) {
        var gameIndex = indices.games[i];
        upgradeGameIndex(esClient, gameIndex, callback);
    }
}

function checkTraceExtensions(trace) {
    var newTrace = {};
    Object.keys(trace).forEach(function (property) {
            if (defaultTraceAttributes.indexOf(property) === -1) {
                if (!newTrace.ext) {
                    newTrace.ext = {};
                }
                newTrace.ext[property] = trace[property];

                if (extensions.indexOf(property) === -1) {
                    extensions.push(property);
                }
            } else {
                newTrace[property] = trace[property];
            }
        }
    );
    return newTrace;
}

function identifyExtensionsFromIndex(esClient, traceIndex, callback) {
    // First we do a search, and specify a scroll timeout
    var total = 0;
    esClient.search({
        index: traceIndex.index,
        scroll: defaultTimeout, // Keep the search results "scrollable" for 30 seconds
        type: 'traces'
    }, function getMoreUntilDone(error, response) {
        if (error) {
            return callback(error);
        }
        // Collect the title from each response
        if (response.hits.hits.length === 0) {
            console.log('Completed scrolling, 0 results', traceIndex);
            if (callback) {
                callback();
            }
        }
        var bulkUpgradedTraces = [];
        var upgradeIndex = 'upgrade_' + traceIndex.index;
        response.hits.hits.forEach(function (hit) {
            var trace = hit._source;
            if (trace) {
                var newTrace = checkTraceExtensions(trace);
                bulkUpgradedTraces.push({update: {_index: upgradeIndex, _type: hit._type, _id: hit._id}});
                bulkUpgradedTraces.push({doc: newTrace, doc_as_upsert: true});
                ++total;
            }
        });

        var finishBulk = function () {
            var found = false;
            for (var k = 0; k < indices.upgrade.length; ++k) {
                var index = indices.upgrade[k];
                if (index.index === upgradeIndex) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                var upgrade = Object.assign({}, traceIndex);
                upgrade.index = upgradeIndex;
                indices.upgrade.push(upgrade);
            }
            if (response.hits.total > total) {
                // Ask elasticsearch for the next set of hits from this search
                esClient.scroll({
                    scrollId: response._scroll_id,
                    scroll: defaultTimeout
                }, getMoreUntilDone);
            } else {
                console.log('Completed scrolling', traceIndex);
                if (callback) {
                    callback();
                }
            }
        };
        esClient.bulk({
            body: bulkUpgradedTraces
        }, function (err, resp) {
            if (err || resp.errors) {
                var operation = retry.operation(opOpts);
                return processBulkErrors(esClient, bulkUpgradedTraces, operation, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    finishBulk();
                });
            }
            finishBulk();
        });
    });
}

function identifyExtensions(esClient, indexArray, callback) {
    if (indexArray.length === 0) {
        return callback();
    }
    var i;
    for (i = 0; i < indexArray.length; i++) {
        var traceIndex = indexArray[i];
        identifyExtensionsFromIndex(esClient, traceIndex, callback);
    }
}

function scrollIndex(esClient, index, callback) {
    // First we do a search, and specify a scroll timeout
    setTimeout(function () {
        var total = 0;
        esClient.search({
            index: index.index,
            scroll: defaultTimeout // Keep the search results "scrollable" for 30 seconds
        }, function getMoreUntilDone(error, response) {
            // Collect the title from each response
            if (error) {
                console.error('Unexpected error while scrolling!', JSON.stringify(index, null, 4));
                console.error(error);
                return callback(error);
            }

            total += response.hits.hits.length;
            callback(null, false, response.hits, function () {
                if (response.hits.total > total) {
                    // Ask elasticsearch for the next set of hits from this search
                    if (response._scroll_id) {
                        esClient.scroll({
                            scrollId: response._scroll_id,
                            scroll: defaultTimeout
                        }, getMoreUntilDone);
                    } else if (callback) {
                        callback(null, true);
                    }
                } else {
                    console.log('Completed scrolling', index);
                    if (callback) {
                        callback(null, true);
                    }
                }
            });
        });
    }, 2000);
}

function checkNeedsUpdate(visualization) {

    var visState = JSON.parse(visualization._source.visState.replaceAll('\\\"', '"'));

    /*
     * Example of visState:
     * {
     *   \"title\":\"Alternative Selected Correct Incorrect Per QuestionId\",
     *   \"type\":\"histogram\",
     *   \"params\":{
     *       \"addLegend\":true,
     *       \"addTimeMarker\":false,
     *       \"addTooltip\":true,
     *       \"defaultYExtents\":false,
     *       \"mode\":\"stacked\",
     *       \"scale\":\"linear\",
     *       \"setYExtents\":false,
     *       \"shareYAxis\":true,
     *       \"times\":[],
     *       \"yAxis\":{}
     *   },
     *   \"aggs\":[
     *       {\"id\":\"1\",\"type\":\"count\",\"schema\":\"metric\",
     *           \"params\":{}},
     *       {\"id\":\"2\",\"type\":\"terms\",\"schema\":\"segment\",
     *           \"params\":{
     *               \"field\":\"target.keyword\",
     *               \"include\":{\"pattern\":\"\"},
     *               \"size\":100,
     *               \"order\":\"asc\",
     *               \"orderBy\":\"_term\",
     *               \"customLabel\":\"Alternative\"
     *               }
     *           },
     *       {\"id\":\"4\",\"type\":\"filters\",\"schema\":\"group\",
     *           \"params\":{
     *               \"filters\":[
     *                   {
     *                       \"input\":{
     *                           \"query\":{
     *                               \"query_string\":{
     *                                   \"query\":\"success:true\",
     *                                   \"analyze_wildcard\":true
     *                                   }
     *                               }
     *                           },
     *                       \"label\":\"\"
     *                   },
     *                   {
     *                       \"input\":{
     *                           \"query\":{
     *                               \"query_string\":{
     *                                   \"query\":\"success:false\",
     *                                   \"analyze_wildcard\":true
     *                               }
     *                           }
     *                       }
     *                   }
     *               ]
     *           }
     *       }
     *   ],
     *   \"listeners\":{}
     * }
     * */
    var needsUpdate = false;
    for (var i = 0; i < visState.aggs.length; ++i) {
        var agg = visState.aggs[i];
        if (!agg) {
            continue;
        }

        if (!agg.params) {
            continue;
        }

        if (!agg.params.field) {
            continue;
        }

        var field = agg.params.field;

        var isDefaultAttribute = false;
        for (var j = 0; j < defaultTraceAttributes.length; ++j) {
            var defaultAttribute = defaultTraceAttributes[j];

            if (field === defaultAttribute ||
                field === defaultAttribute + '.keyword') {
                isDefaultAttribute = true;
                break;
            }
        }

        if (!isDefaultAttribute) {
            agg.params.field = 'ext.' + field;
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        visualization._source.visState = JSON.stringify(visState);
    }
}

function setUpVisualization(esClient, visualization, index, callback) {
    checkNeedsUpdate(visualization);

    var upgradedIndex = 'upgrade_' + index.index;
    attemptIndexErrors(esClient, {
        index: upgradedIndex,
        type: visualization._type,
        id: visualization._id,
        body: visualization._source
    }, function (error, response) {
        if (error) {
            return callback(error);
        }
        var found = false;
        var ind;
        for (var k = 0; k < indices.upgrade.length; ++k) {
            ind = indices.upgrade[k];
            if (ind.index === upgradedIndex) {
                found = true;
                break;
            }
        }
        if (!found) {
            var upgrade = Object.assign({}, index);
            upgrade.index = upgradedIndex;
            indices.upgrade.push(upgrade);
        }
        if (callback) {
            callback();
        }
    });
}

function checkNeedsUpdateIndexPattern(indexPattern) {

    var fields = JSON.parse(indexPattern._source.fields.replaceAll('\\\"', '"'));


    /*Example fields:
     * [
     *   {
     *       \"name\":\"type\",
     *       \"type\":\"string\",
     *       \"count\":0,
     *       \"scripted\":false,
     *       \"indexed\":true,
     *       \"analyzed\":true,
     *       \"doc_values\":false
     *   },
     *   {
     *       \"name\":\"gameplayId\",
     *       \"type\":\"string\",
     *       \"count\":0,
     *       \"scripted\":false,
     *       \"indexed\":true,
     *       \"analyzed\":true,
     *       \"doc_values\":false
     *   },
     *   {
     *       \"name\":\"Estimulado.keyword\",
     *       \"type\":\"string\",
     *       \"count\":0,
     *       \"scripted\":false,
     *       \"indexed\":true,
     *       \"analyzed\":false,
     *       \"doc_values\":true
     *   }
     * ]
     *
     * */
    var needsUpdate = false;

    for (var i = 0; i < fields.length; ++i) {
        var field = fields[i];
        if (!field) {
            continue;
        }

        if (!field.name) {
            continue;
        }

        var fieldName = field.name;

        var isDefaultAttribute = false;
        for (var j = 0; j < defaultTraceAttributes.length; ++j) {
            var defaultAttribute = defaultTraceAttributes[j];

            if (fieldName === defaultAttribute ||
                fieldName === defaultAttribute + '.keyword') {
                isDefaultAttribute = true;
                break;
            }
        }

        if (!isDefaultAttribute) {
            field.name = 'ext.' + fieldName;
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        var stringified = JSON.stringify(fields);
        indexPattern._source.fields = stringified;
    }
}

function setUpIndexPattern(esClient, indexPattern, index, callback) {
    checkNeedsUpdateIndexPattern(indexPattern);

    var upgradedIndex = 'upgrade_' + index.index;
    attemptIndexErrors(esClient, {
        index: upgradedIndex,
        type: indexPattern._type,
        id: indexPattern._id,
        body: indexPattern._source
    }, function (error, response) {
        if (error) {
            return callback(error);
        }
        var found = false;
        var ind;
        for (var k = 0; k < indices.upgrade.length; ++k) {
            ind = indices.upgrade[k];
            if (ind.index === upgradedIndex) {
                found = true;
                break;
            }
        }
        if (!found) {
            var upgrade = Object.assign({}, index);
            upgrade.index = upgradedIndex;
            indices.upgrade.push(upgrade);
        }
        if (callback) {
            callback();
        }
    });
}

function setUpKibanaIndex(esClient, callback) {
    if (!indices.configs.kibana) {
        return callback();
    }
    scrollIndex(esClient, indices.configs.kibana, function (err, finished, hits, finishedCallback) {
        if (err) {
            console.error('setUpKibanaIndex - scrollIndex ' + err);
            return callback(err);
        }

        if (finished) {
            return callback();
        }


        var to = 'upgrade_' + indices.configs.kibana.index;
        var bulkUpgradedTraces = [];
        var count = 0;
        hits.hits.forEach(function (hit) {
            if (hit._type === 'visualization' ||
                hit._type === 'index-pattern') {
                count++;
            } else {
                bulkUpgradedTraces.push({update: {_index: to, _type: hit._type, _id: hit._id}});
                bulkUpgradedTraces.push({doc: hit._source, doc_as_upsert: true});

                var found = false;
                for (var k = 0; k < indices.upgrade.length; ++k) {
                    var index = indices.upgrade[k];
                    if (index.index === to) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var upgrade = Object.assign({}, indices.configs.kibana);
                    upgrade.index = to;
                    indices.upgrade.push(upgrade);
                }
            }
        });

        if (count === 0 && bulkUpgradedTraces.length === 0) {
            return finishedCallback();
        }

        var countCallback = finishedCountCallback(count + 1, finishedCallback);

        if (count > 0) {
            hits.hits.forEach(function (hit) {
                if (hit._type === 'visualization') {
                    setUpVisualization(esClient, hit, indices.configs.kibana, countCallback);
                } else if (hit._type === 'index-pattern') {
                    setUpIndexPattern(esClient, hit, indices.configs.kibana, countCallback);
                }
            });
        }

        if (bulkUpgradedTraces.length > 0) {
            esClient.bulk({
                body: bulkUpgradedTraces
            }, function (err, resp) {
                if (err || resp.errors) {

                    var operation = retry.operation(opOpts);
                    return processBulkErrors(esClient, bulkUpgradedTraces, operation, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        countCallback();
                    });
                }
                countCallback();
            });
        } else {
            countCallback();
        }
    });
}

function setUpTemplateIndex(esClient, callback) {
    if (!indices.configs.template) {
        return callback();
    }
    scrollIndex(esClient, indices.configs.template, function (err, finished, hits, finishedCallback) {
        if (err) {
            console.error('setUpTemplateIndex - scrollIndex ' + err);
            return callback(err);
        }

        if (finished) {
            return callback();
        }

        var to = 'upgrade_' + indices.configs.template.index;
        var bulkUpgradedTraces = [];
        var count = 0;
        hits.hits.forEach(function (hit) {
            if (hit._type === 'index' ||
                hit._type === 'index-pattern') {
                count++;
            } else {
                bulkUpgradedTraces.push({update: {_index: to, _type: hit._type, _id: hit._id}});
                bulkUpgradedTraces.push({doc: hit._source, doc_as_upsert: true});

                var found = false;
                for (var k = 0; k < indices.upgrade.length; ++k) {
                    var index = indices.upgrade[k];
                    if (index.index === to) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var upgrade = Object.assign({}, indices.configs.template);
                    upgrade.index = to;
                    indices.upgrade.push(upgrade);
                }
            }
        });

        if (count === 0 && bulkUpgradedTraces.length === 0) {
            return finishedCallback();
        }

        var countCallback = finishedCountCallback(count + 1, finishedCallback);
        if (count > 0) {
            hits.hits.forEach(function (hit) {
                if (hit._type === 'index' ||
                    hit._type === 'index-pattern') {
                    setUpIndexPattern(esClient, hit, indices.configs.template, countCallback);
                }
            });
        }

        if (bulkUpgradedTraces.length > 0) {
            esClient.bulk({
                body: bulkUpgradedTraces
            }, function (err, resp) {
                if (err || resp.errors) {

                    var operation = retry.operation(opOpts);
                    return processBulkErrors(esClient, bulkUpgradedTraces, operation, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        countCallback();
                    });
                }
                countCallback();
            });
        } else {
            countCallback();
        }
    });
}

function setUpGameIndex(esClient, gameIndex, callback) {
    scrollIndex(esClient, gameIndex, function (err, finished, hits, finishedCallback) {
        if (err) {
            console.error('setUpGameIndex - scrollIndex ' + gameIndex + ' ' + err);
            return callback(err);
        }

        if (finished) {
            return callback();
        }

        var to = 'upgrade_' + gameIndex.index;
        var bulkUpgradedTraces = [];
        var count = 0;
        hits.hits.forEach(function (hit) {
            if (hit._type !== 'visualization' &&
                hit._type !== 'index-pattern' &&
                hit._type !== 'index') {
                bulkUpgradedTraces.push({update: {_index: to, _type: hit._type, _id: hit._id}});
                bulkUpgradedTraces.push({doc: hit._source, doc_as_upsert: true});

                var found = false;
                for (var k = 0; k < indices.upgrade.length; ++k) {
                    var index = indices.upgrade[k];
                    if (index.index === to) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var upgrade = Object.assign({}, gameIndex);
                    upgrade.index = to;
                    indices.upgrade.push(upgrade);
                }
            } else {
                count++;
            }
        });

        if (count === 0 && bulkUpgradedTraces.length === 0) {
            return finishedCallback();
        }

        var countCallback = finishedCountCallback(count + 1, finishedCallback);
        if (count > 0) {
            hits.hits.forEach(function (hit) {
                if (hit._type === 'visualization') {
                    setUpVisualization(esClient, hit, gameIndex, countCallback);
                } else if (hit._type === 'index' ||
                    hit._type === 'index-pattern') {
                    setUpIndexPattern(esClient, hit, gameIndex, countCallback);
                }
            });
        }

        if (bulkUpgradedTraces.length > 0) {
            esClient.bulk({
                body: bulkUpgradedTraces
            }, function (err, resp) {
                if (err || resp.errors) {

                    var operation = retry.operation(opOpts);
                    return processBulkErrors(esClient, bulkUpgradedTraces, operation, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        countCallback();
                    });
                }
                countCallback();
            });
        } else {
            countCallback();
        }
    });
}


function setUpVisualizations(esClient, callback) {
    setUpKibanaIndex(esClient, function (err) {
        if (err) {
            return callback(err);
        }
        setUpTemplateIndex(esClient, function (err) {
            if (err) {
                return callback(err);
            }
            if (indices.games.length === 0) {
                return callback();
            }

            for (var i = 0; i < indices.games.length; i++) {
                var gameIndex = indices.games[i];
                setUpGameIndex(esClient, gameIndex, callback);
            }
        });
    });
}

function attemptIndexExistsErrors(esClient, options, callback) {
    var operation = retry.operation(opOpts);
    operation.attempt(function (currAttempt) {
        // Do something when backoff starts, e.g. show to the
        // user the delay before next reconnection attempt.
        console.log('attemptIndexExistsErrors attempt, ' + currAttempt + ' options, ' + JSON.stringify(options, null, 4));
        esClient.indices.exists(options, function (err, resp) {
            err = resp.errors || err;
            if (operation.retry(err)) {
                return;
            }
            callback(err ? operation.mainError() : null, resp);
        });
    });
}


function attemptIndexDeleteErrors(esClient, options, callback) {
    var operation = retry.operation(opOpts);
    operation.attempt(function (currAttempt) {
        // Do something when backoff starts, e.g. show to the
        // user the delay before next reconnection attempt.
        console.log('attemptIndexDeleteErrors attempt, ' + currAttempt + ' options, ' + JSON.stringify(options, null, 4));
        esClient.indices.delete(options, function (err, resp) {
            err = resp.errors || err;
            if (operation.retry(err)) {
                return;
            }
            callback(err ? operation.mainError() : null, resp);
        });
    });
}


function processExistingUpgradeIndex(esClient, index, newIndex, renameCountCallback, callback) {
    attemptIndexExistsErrors(esClient, {
            index: newIndex
        }, function (err, exists) {
            if (err) {
                console.error('Error checking if index exists, going to reindex ' + err);
            }

            if (exists) {
                attemptIndexDeleteErrors(esClient, {index: newIndex}, function (err, result) {
                    if (err) {
                        console.error('attemptIndexDeleteErrors ' + newIndex + ' ' + err);
                        return callback(err);
                    }

                    console.log('Index ' + newIndex + ' deleted successfully, result ' +
                        JSON.stringify(result, null, 4));
                    setTimeout(function () {
                        reindexManually(esClient, index, newIndex, function (err, from) {
                            if (err) {
                                console.error('processExistingUpgradeIndex - attemptIndexExistsErrors - ' +
                                    'attemptIndexDeleteErrors - ' +
                                    'reindexManually ' + index + '  ' + err);
                                return callback(err);
                            }

                            attemptIndexDeleteErrors(esClient, {index: from}, function (err, result) {
                                if (!err) {
                                    indices.deleted[from] = true;
                                }
                                renameCountCallback();
                            });
                        });
                    }, 5000);
                });
            } else {
                reindexManually(esClient, index, newIndex, function (errr, from) {
                    if (err) {
                        console.error('processExistingUpgradeIndex - attemptIndexExistsErrors - ' +
                            'reindexManually ' + index + '  ' + errr);
                        return callback(errr);
                    }

                    attemptIndexDeleteErrors(esClient, {index: from}, function (err, result) {
                        if (!err) {
                            indices.deleted[from] = true;
                        }
                        renameCountCallback();
                    });
                });
            }
        }
    );
}

function upgrade(config, callback) {
    console.log(JSON.stringify(indices, null, '    '));

    var esClient = config.elasticsearch.esClient;
    // Set up .games
    // https://github.com/e-ucm/rage-analytics/wiki/Upgrading-RAGE-Analytics
    // #case-2---upgrading-rage-without-traces-data
    upgradeGamesIndices(esClient, finishedCountCallback(indices.games.length, function () {
        console.log('Finished upgrading game indices!');
        identifyExtensions(esClient, indices.traces, finishedCountCallback(indices.traces.length, function () {
            console.log('Finished identifying traces extensions!', extensions);
            identifyExtensions(esClient, indices.versions, finishedCountCallback(indices.versions.length, function () {
                console.log('Finished identifying versions extensions!', extensions);
                setUpVisualizations(esClient, finishedCountCallback(indices.games.length, function () {
                    console.log('Finished setting up visualizations!', extensions);

                    if (indices.upgrade.length === 0) {
                        return callback(null, config);
                    }
                    var renameCount = finishedCountCallback(indices.upgrade.length, function () {
                        callback(null, config);
                    });
                    for (var i = 0; i < indices.upgrade.length; i++) {
                        var index = indices.upgrade[i];
                        if (!index.index) {
                            renameCount();
                            continue;
                        }

                        var newIndex = index.index.substr('upgrade_'.length);
                        if (!newIndex) {
                            renameCount();
                            continue;
                        }
                        processExistingUpgradeIndex(esClient, index, newIndex, renameCount, callback);
                    }
                }));
            }));
        }));
    }));
}

function sourcesEquals(x, y) {
    // Recursive object equality check
    var p = Object.keys(x);
    return Object.keys(y).every(function (i) {
        if (i === 'ext') {
            var exts = y.ext;
            if (exts) {
                Object.keys(exts).every(function (extKey) {
                    if (extensions.indexOf(extKey) === -1) {
                        return false;
                    }

                    return p.indexOf(extKey) !== -1 && exts[extKey] === x[extKey];
                });
            } else {
                for (var j = 0; j < extensions.length; ++i) {
                    var identifiedExt = extensions[j];
                    if (p.indexOf(identifiedExt) !== -1) {
                        return false;
                    }
                }
            }

            return true;
        }

        if (i === 'fields' || i === 'visState') {
            return true;
        }

        if (p.indexOf(i) !== -1) {
            return true;
        }

        return extensions.indexOf(i) !== -1;
    });
}

function checkHit(esClient, hit, index, callback) {
    attemptGetIndexErrors(esClient, {
        index: index.index,
        type: hit._type,
        id: hit._id
    }, function (error, response) {
        if (error) {
            return callback(error);
        }

        if (!response || !response._source) {
            return callback(null, false, hit, response);
        }

        // Compare sources
        if (sourcesEquals(hit._source, response._source)) {
            return callback(null, true);
        }

        return callback(null, false, hit, response);
    });
}

function checkIndices(esClient, backedUpIndex, index, callback) {
    scrollIndex(esClient, backedUpIndex, function (err, finished, hits, finishedCallback) {
        if (err) {
            console.error('There was an error scrolling the index ' + JSON.stringify(backedUpIndex, null, 4));
            return callback(err);
        }

        if (finished) {
            return callback(null);
        }

        if (hits.hits.length === 0) {
            return callback(null);
        }

        var countCallbak = finishedCountCallback(hits.hits.length, function () {
            finishedCallback();
        });

        hits.hits.forEach(function (hit) {
            checkHit(esClient, hit, index, function (err, same, hit, ret) {
                if (err) {
                    return callback(err);
                }

                if (!same) {
                    return callback(new Error('Failed comparing hit ' + JSON.stringify(hit, null, 4) +
                        ' ' + JSON.stringify(ret, null, 4)));
                }

                countCallbak();
            });
        });
    });
}

var checked = false;
function check(config, callback) {
    var esClient = config.elasticsearch.esClient;

    attemptCatIndexErrors(esClient, function (error, response) {
        if (error) {
            return callback(error);
        }

        if (!response || response.length === 0) {
            return callback(null, config);
        }

        var backupCount = 0;
        var i;
        var index;
        for (i = 0; i < response.length; i++) {
            index = response[i];
            if (index.index) {
                if (index.index.indexOf('backup_') === 0) {
                    backupCount++;
                }
            }
        }

        var countCallback = finishedCountCallback(backupCount, function () {
            callback(null, config);
        });

        var finishedCheckingIndicesCallback = function (err) {
            if (err) {
                return callback(err, config);
            }
            countCallback();
        };

        function recursiveCheck() {
            check(config, callback);
        }

        for (i = 0; i < response.length; i++) {
            index = response[i];
            if (index.index) {
                if (index.index.indexOf('backup_') === 0) {

                    var normalIndex = index.index.substr('backup_'.length);

                    if (normalIndex) {
                        var foundIndex = false;
                        for (var j = 0; j < response.length; ++j) {
                            var retIndex = response[j];

                            if (retIndex.index && retIndex.index === normalIndex) {
                                foundIndex = true;
                                if (index['docs.count'] !== retIndex['docs.count']) {
                                    if (checked) {
                                        return callback(new Error('DIFFERENT document count ' +
                                            JSON.stringify(index, null, 4) + ' and ' +
                                            JSON.stringify(retIndex, null, 4)), config);
                                    }
                                    checked = true;
                                    return setTimeout(recursiveCheck, 5000);
                                }

                                checkIndices(esClient, index, retIndex, finishedCheckingIndicesCallback);
                            }
                        }
                        if (!foundIndex) {
                            return callback(new Error('Not found normal index for backed index for ' +
                                '(should not happen): ' +
                                JSON.stringify(index, null, 4)));
                        }
                    } else {
                        return callback(new Error('Not found correct index for backed index: ' +
                            JSON.stringify(index, null, 4)));
                    }
                }
            }
        }
    });
}

function clean(config, callback) {
    var esClient = config.elasticsearch.esClient;

    var toRemove = [];
    // Remove the backups
    for (var i = 0; i < indices.backup.length; i++) {
        var backupIndex = indices.backup[i];
        toRemove.push(backupIndex.index);
    }

    // Remove the upgrades that werent removed before
    for (var j = 0; j < indices.upgrade.length; j++) {
        var upgradeIndex = indices.upgrade[j];
        if (!indices.deleted[upgradeIndex.index]) {
            toRemove.push(upgradeIndex.index);
        }
    }
    if (toRemove.length === 0) {
        return callback(null, config);
    }
    attemptIndexDeleteErrors(esClient, {index: toRemove.join(',')}, function (err) {
        indices = {
            traces: [],
            versions: [],
            results: [],
            opaqueValues: [],
            games: [],
            configs: {
                template: null,
                kibana: null,
                defaultKibanaIndex: null
            },
            others: [],
            backup: [],
            upgrade: [],
            deleted: {}
        };
        extensions = [];
        callback(err, config);
    });
}

function restoreIndex(esClient, backedUpIndex, newIndex, callbackToDelete) {
    attemptIndexExistsErrors(esClient, {
            index: newIndex
        }, function (err, exists) {
            if (err) {
                console.error('Error checking if index exists (probably does not exist)' +
                    ', going to reindex' + err);
            }

            if (exists) {
                attemptIndexDeleteErrors(esClient, {index: newIndex}, function (err, result) {
                    if (err) {
                        console.error('Could not delete existing index (should not happen)!');
                        console.error(err);
                        return callbackToDelete(err);
                    }

                    console.log('Index ' + newIndex + ' deleted successfully, result ' +
                        JSON.stringify(result, null, 4));
                    setTimeout(function () {
                        reindexManually(esClient, backedUpIndex, newIndex, callbackToDelete);
                    }, 5000);
                });
            } else {
                reindexManually(esClient, backedUpIndex, newIndex, callbackToDelete);
            }
        }
    );
}

function restore(config, callback) {
    var esClient = config.elasticsearch.esClient;

    var operationsCount = finishedCountCallback(2, function () {
        callback(null, config);
    });
    var renameCount = finishedCountCallback(indices.backup.length, operationsCount);
    var reindexedCallback = function (err, from) {
        if (err) {
            return callback(err);
        }
        attemptIndexDeleteErrors(esClient, {index: from}, renameCount);
    };
    for (var i = 0; i < indices.backup.length; i++) {
        var index = indices.backup[i];
        restoreIndex(esClient, index, index.index.substr('backup_'.length), reindexedCallback);
    }
    var toRemove = [];
    for (var j = 0; j < indices.upgrade.length; j++) {
        var indexj = indices.upgrade[j];
        if (indexj && indexj.index && !indices.deleted[indexj.index]) {
            toRemove.push(indexj.index);
        }
    }
    if (toRemove.length === 0) {
        return operationsCount();
    }
    attemptIndexDeleteErrors(esClient, {index: toRemove.join(',')}, operationsCount);
}

module.exports = {
    backup: backup,
    upgrade: upgrade,
    check: check,
    clean: clean,
    restore: restore,
    requires: {
        mongo: '1'
    },
    version: {
        origin: '1',
        destination: '2'
    }
};
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers