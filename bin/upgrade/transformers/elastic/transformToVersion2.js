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

var ObjectID = require('mongodb').ObjectID;

var defaultTraceAttributes = [
    'name', 'timestamp', 'event',
    'target', 'type', 'ext',
    'gameplayId', 'versionId', 'session',
    'firstSessionStarted', 'currentSessionStarted',
    'score', 'success', 'completion', 'response',
    'stored', 'gameplayId_hashCode', 'event_hashCode',
    'type_hashCode', 'target_hashCode'
];
var extensions = [];

var reindex = function (esClient, from, to, callback) {
    esClient.reindex({
        refresh: true,
        body: {
            source: {
                index: from
            },
            dest: {
                index: to
            }
        }
    }, function (err, response) {
        if (err) {
            console.error('Error reindexing index', from, err);
            return callback(err, from, response);
        }
        callback(null, from, response);
    });
};

var backUpIndex = function (esClient, index, callback) {
    reindex(esClient, index.index, 'backup_' + index.index, function (err, from, response) {
        callback(err, index, response);
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

function backup(config, callback) {

    var esClient = config.elasticsearch.esClient;

    esClient.cat.indices({format: 'json'}, function (error, response) {
        if (error) {
            return callback(error);
        }

        if (!response || response.length === 0) {
            return callback(null, config);
        }

        var finishedCount = finishedCountCallback(response.length, function () {
            callback(null, config);
        });

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
            backUpIndex(esClient, index, function (err, index, response) {
                if (err) {
                    console.error('Backup error');
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
            });
        }
    });
}

function upgradeGameIndex(esClient, gameIndex, callback) {
    esClient.index({
        index: gameIndex.index,
        type: 'visualization',
        id: 'TotalSessionPlayers-Cmn',
        body: {
            "title": "TotalSessionPlayers-Cmn",
            "visState": "{\"title\":\"Total Session Players\"," +
            "\"type\":\"metric\",\"params\":{\"handleNoResults\":true," +
            "\"fontSize\":60},\"aggs\":[{\"id\":\"1\",\"type\":\"cardinality\"," +
            "\"schema\":\"metric\",\"params\":{\"field\":\"name.keyword\"," +
            "\"customLabel\":\"SessionPlayers\"}}],\"listeners\":{}}",
            "uiStateJSON": "{}",
            "description": "",
            "version": 1,
            "kibanaSavedObjectMeta": {
                "searchSourceJSON": "{\"index\":\"57604f53f552624300d9caa6\"," +
                "\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}}," +
                "\"filter\":[]}"
            },
            "author": "_default_",
            "isTeacher": true,
            "isDeveloper": true
        }
    }, function (error, response) {
        esClient.index({
            index: gameIndex.index,
            type: 'visualization',
            id: 'xAPIVerbsActivity',
            body: {
                "title": "xAPIVerbsActivity",
                "visState": "{\"title\":\"xAPI Verbs Activity\"," +
                "\"type\":\"histogram\",\"params\":{\"shareYAxis\":true," +
                "\"addTooltip\":true,\"addLegend\":true,\"scale\":\"linear\"," +
                "\"mode\":\"stacked\",\"times\":[],\"addTimeMarker\":false," +
                "\"defaultYExtents\":false,\"setYExtents\":false,\"yAxis\":{}}," +
                "\"aggs\":[{\"id\":\"1\",\"type\":\"count\",\"schema\":\"metric\"," +
                "\"params\":{\"customLabel\":\"Activity Count\"}},{\"id\":\"2\"," +
                "\"type\":\"terms\",\"schema\":\"segment\",\"params\":{" +
                "\"field\":\"event.keyword\",\"size\":15,\"order\":\"desc\"," +
                "\"orderBy\":\"1\",\"customLabel\":\"xAPI Verb\"}}],\"listeners\":{}}",
                "uiStateJSON": "{}",
                "description": "",
                "version": 1,
                "kibanaSavedObjectMeta": {
                    "searchSourceJSON": "{\"index\":\"57604f53f552624300d9caa6\"," +
                    "\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}}," +
                    "\"filter\":[]}"
                },
                "author": "_default_",
                "isTeacher": false,
                "isDeveloper": true
            }
        }, function (error, response) {
            if (callback) {
                callback();
            }
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
    });
    return newTrace;
}

function identifyExtensionsFromIndex(esClient, traceIndex, callback) {
    // first we do a search, and specify a scroll timeout
    var total = 0;
    esClient.search({
        index: traceIndex.index,
        scroll: '30s', // keep the search results "scrollable" for 30 seconds
        type: 'traces',
        body: {
            query: {
                "match_all": {}
            }
        }
    }, function getMoreUntilDone(error, response) {
        // collect the title from each response
        var bulkUpgradedTraces = [];
        var upgradeIndex = 'upgrade_' + traceIndex.index;
        response.hits.hits.forEach(function (hit) {
            var trace = hit._source;
            if (trace) {
                var newTrace = checkTraceExtensions(trace);
                bulkUpgradedTraces.push({index: {_index: upgradeIndex, _type: hit._type, _id: hit._id}});
                bulkUpgradedTraces.push(newTrace);
                ++total;
            }
        });
        esClient.bulk({
            body: bulkUpgradedTraces
        }, function (err, resp) {
            if (response.hits.total > total) {
                // ask elasticsearch for the next set of hits from this search
                esClient.scroll({
                    scrollId: response._scroll_id,
                    scroll: '30s'
                }, getMoreUntilDone);
            } else {
                console.log('Completed scrolling', traceIndex);
                if (callback) {
                    callback();
                }
            }
        });
    });
}

function identifyExtensions(esClient, indexArray, callback) {
    var i;
    for (i = 0; i < indexArray.length; i++) {
        var traceIndex = indexArray[i];
        identifyExtensionsFromIndex(esClient, traceIndex, callback);
    }
}

function scrollIndex(esClient, index, callback) {
    // first we do a search, and specify a scroll timeout
    var total = 0;
    esClient.search({
        index: index.index,
        scroll: '30s', // keep the search results "scrollable" for 30 seconds
        q: '*'
    }, function getMoreUntilDone(error, response) {
        // collect the title from each response
        if (error) {
            return callback(error);
        }

        total += response.hits.hits.length;
        callback(null, false, response.hits, function () {
            if (response.hits.total > total) {
                // ask elasticsearch for the next set of hits from this search
                esClient.scroll({
                    scrollId: response._scroll_id,
                    scroll: '30s'
                }, getMoreUntilDone);
            } else {
                console.log('Completed scrolling', index);
                if (callback) {
                    callback(null, true);
                }
            }
        });
    });
}

function checkNeedsUpdate(visualization) {
    if (extensions.length === 0) {
        return false;
    }

    if (!visualization) {
        return false;
    }

    if (!visualization._source) {
        return false;
    }

    if (!visualization._source.visState) {
        return false;
    }

    var needsUpdate = false;

    for (var i = 0; i < extensions.length; ++i) {
        var extension = extensions[i];
        if (!extension) {
            continue;
        }

        // TODO check it works?
        if (visualization._source.visState.indexOf(extension) === -1) {
            continue;
        }
        var newVisState = visualization._source.visState.replace(extension, 'ext.' + extension);
        visualization._source.visState = newVisState;
        needsUpdate = true;
    }
    if (needsUpdate) {
        return visualization;
    } else {
        return false;
    }
}

function setUpVisualization(esClient, visualization, index, callback) {
    var update = checkNeedsUpdate(visualization);
    if (!update) {
        return callback();
    }

    esClient.index({
        index: 'upgrade_' + index.index,
        type: visualization._type,
        id: visualization._id,
        body: visualization._source
    }, function (error, response) {
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
            console.error(err);
            return callback(err);
        }

        if (finished) {
            return callback();
        }

        var count = 0;
        hits.hits.forEach(function (hit) {
            if (hit._type !== 'visualization') {
                return;
            }
            count++;
        });

        if (count === 0) {
            return finishedCallback();
        }

        var countCallback = finishedCountCallback(count, finishedCallback);
        hits.hits.forEach(function (hit) {
            if (hit._type !== 'visualization') {
                return;
            }

            // TODO create kibana upgrade index :))
            setUpVisualization(esClient, hit, indices.configs.kibana, countCallback);
        });
    });
}

function setUpGameIndex(esClient, gameIndex, callback) {
    scrollIndex(esClient, gameIndex, function (err, finished, hits, finishedCallback) {
        if (err) {
            console.error(err);
            return callback(err);
        }

        if (finished) {
            return callback();
        }

        var count = 0;
        hits.hits.forEach(function (hit) {
            if (hit._type !== 'visualization') {
                return;
            }
            count++;
        });

        if (count === 0) {
            return finishedCallback();
        }

        var countCallback = finishedCountCallback(count, finishedCallback);
        hits.hits.forEach(function (hit) {
            if (hit._type !== 'visualization') {
                return;
            }
            setUpVisualization(esClient, hit, gameIndex, countCallback);
        });
    });
}


function setUpVisualizations(esClient, callback) {
    setUpKibanaIndex(esClient, function (err) {
        if (indices.games.length === 0) {
            return callback();
        }
        for (var i = 0; i < indices.games.length; i++) {
            var gameIndex = indices.games[i];
            setUpGameIndex(esClient, gameIndex, callback);
        }
    })
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
                        reindex(esClient, index.index, index.index.substr('upgrade_'.length), function (err, from, result) {
                            if (err) {
                                console.error(err);
                                return callback(err);
                            }
                            esClient.indices.delete({index: from}, function (err, result) {
                                if (!err) {
                                    indices.deleted[from] = true;
                                }
                                renameCount();
                            });
                        });
                    }
                }));
            }));
        }));
    }));
}


function check(config, callback) {
    console.log('Check OK');
    callback(null, config);

    // TODO
    /*
     callback(null, config); => clean
     callback('error', config); => restore
     */
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
    esClient.indices.delete({index: toRemove.join(',')}, callback);
}

function restore(config, callback) {
    // TODO exceptions
    var esClient = config.elasticsearch.esClient;

    var operationsCount = finishedCountCallback(2, function () {
        callback(null, config);
    });
    var renameCount = finishedCountCallback(indices.backup.length, operationsCount);
    for (var i = 0; i < indices.backup.length; i++) {
        var index = indices.backup[i];
        reindex(esClient, index.index, index.index.substr('backup_'.length), function (err, from, result) {
            if (err) {
                return callback(err);
            }
            esClient.indices.delete({index: from}, renameCount);
        });
    }
    var toRemove = [];
    for (var i = 0; i < indices.upgrade.length; i++) {
        var index = indices.upgrade[i];
        if (!indices.deleted[index.index]) {
            toRemove.push(index.index);
        }
    }
    if (toRemove.length === 0) {
        return operationsCount();
    }
    esClient.indices.delete({index: toRemove.join(',')}, operationsCount);
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


