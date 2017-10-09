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
let ObjectID = require('mongodb').ObjectID;

let co = require('co');
let promiseRetry = require('promise-retry');

// Used for attempting
let defaultRetryOptions = {
    retries: 10,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 60000,
    randomize: true
};

let defaultTraceAttributes = [
    'name', 'timestamp', 'event',
    'target', 'type',
    'gameplayId', 'versionId', 'session',
    'firstSessionStarted', 'currentSessionStarted',
    'score', 'success', 'completion', 'response',
    'stored', 'gameplayId_hashCode', 'event_hashCode',
    'type_hashCode', 'target_hashCode'
];

let extensions = [];

let defaultTimeout = '8m';

let defaultSize = 500;

let defaultBaseMapping = {
    mappings: {
        traces: {
            properties: {
                event: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256
                        }
                    }
                },
                event_hashCode: {
                    type: 'long'
                },
                name: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256
                        }
                    }
                },
                gameplayId: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256
                        }
                    }
                },
                gameplayId_hashCode: {
                    type: 'long'
                },
                versionId: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256
                        }
                    }
                },
                target: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256
                        }
                    }
                },
                target_hashCode: {
                    type: 'long'
                },
                timestamp: {
                    type: 'date'
                },
                stored: {
                    type: 'date'
                },
                firstSessionStarted: {
                    type: 'date'
                },
                currentSessionStarted: {
                    type: 'date'
                },
                type: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256
                        }
                    }
                },
                type_hashCode: {
                    type: 'long'
                },
                score: {
                    type: 'float'
                },
                session: {
                    type: 'float'
                },
                success: {
                    type: 'boolean'
                },
                completion: {
                    type: 'boolean'
                },
                response: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256
                        }
                    }
                }
            }
        }
    }
};

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
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
let indices = {
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

// Attempt
let at = function (promise) {
    return promiseRetry(defaultRetryOptions, function (retry, number) {
        return promise.catch(function (error) {
            if (error.statusCode === 404 ||
                error.status === 404) {
                throw error;
            }
            console.error('Error retrying ' + number +
                ' for promise ' + promise.name + ' logs: ' +
                JSON.stringify(error, null, 4));
            retry(error);
        }).then(function (resp) {
            if (resp && resp.errors) {
                console.error('Error on BULK errores, retrying ' + number +
                    ' for promise ' + promise.name + ' logs: ' +
                    JSON.stringify(resp, null, 4));
                return retry(resp.errors);
            }
            return resp;
        });
    });
};

function* scrollIndex(esClient, index, callback) {

    // First we do a search, and specify a scroll timeout
    let result = yield at(esClient.search({
        index: index,
        sort: ['_doc'],
        size: defaultSize,
        scroll: defaultTimeout
    }));

    let total = result.hits.hits.length;

    yield callback(result.hits);

    while (total < result.hits.total) {

        result = yield at(esClient.scroll({
            scrollId: result._scroll_id,
            scroll: defaultTimeout
        }));
        total += result.hits.hits.length;

        yield callback(result.hits);
    }
}

let reindexManually = function* (esClient, from, to) {
    let mapping = yield at(esClient.indices.getMapping({index: from}));

    if (!(yield at(esClient.indices.exists({index: to})))) {
        yield at(esClient.indices.create({index: to}));
    }

    for (let key in mapping) {
        let indexMapping = mapping[key].mappings;
        for (let type in indexMapping) {
            yield at(esClient.indices.putMapping({
                index: to,
                type: type,
                body: indexMapping[type]
            }));

        }

    }

    function* windowed(hits) {

        let bulkUpgradedTraces = [];
        for (let i = 0; i < hits.hits.length; ++i) {
            let hit = hits.hits[i];
            bulkUpgradedTraces.push({update: {_index: to, _type: hit._type, _id: hit._id}});
            bulkUpgradedTraces.push({doc: hit._source, doc_as_upsert: true});
        }

        if (bulkUpgradedTraces.length > 0) {
            yield at(esClient.bulk({body: bulkUpgradedTraces}));
        }
    }

    yield scrollIndex(esClient, from, windowed);
};

let copyIndexObjectWithPrefixTo = function (whereArray, whatIndex, withPrefixName) {

    let found = false;
    for (let k = 0; k < whereArray.length; ++k) {
        let hitIndex = whereArray[k];
        if (hitIndex.index === withPrefixName) {
            found = true;
            break;
        }
    }
    if (!found) {
        let upgradedIndex = Object.assign({}, whatIndex);
        upgradedIndex.index = withPrefixName;
        whereArray.push(upgradedIndex);
    }
};

let backUpIndex = function* (esClient, index) {
    let backedUpIndex = 'backup_' + index.index;

    yield reindexManually(esClient, index.index, backedUpIndex);

    copyIndexObjectWithPrefixTo(indices.backup, index, backedUpIndex);
};

function* belongsToCollection(mongodb, index, collection) {
    let objectIdIndex;
    try {
        objectIdIndex = new ObjectID(index);
    } catch (ex) {
        return false;
    }

    return (yield at(mongodb.collection(collection)
        .find({_id: objectIdIndex})
        .limit(1)
        .count())) > 0;
}

function backup(config, callback) {

    co(function* () {
        let esClient = config.elasticsearch.esClient;
        yield at(esClient.ping({requestTimeout: 2000}));
        yield at(esClient.indices.refresh({index: '_all'}));
        const responseIndices = yield at(esClient.cat.indices({format: 'json'}));

        for (let i = 0; i < responseIndices.length; i++) {
            let index = responseIndices[i];
            if (index.index) {
                if (index.index.indexOf('backup_') === 0) {
                    indices.backup.push(index);
                    continue;
                }
                if (index.index.indexOf('upgrade_') === 0) {
                    indices.upgrade.push(index);
                    continue;
                }
            }


            let indexName = index.index;
            if (indexName === '.kibana') {
                yield backUpIndex(esClient, index);
                indices.configs.kibana = index;
            } else if (indexName === '.template') {
                yield backUpIndex(esClient, index);
                indices.configs.template = index;
            } else if (indexName === 'default-kibana-index') {
                yield backUpIndex(esClient, index);
                indices.configs.defaultKibanaIndex = index;
            } else if (indexName.indexOf('.games') === 0) {
                yield backUpIndex(esClient, index);
                indices.games.push(index);
            } else if (indexName.indexOf('opaque-values-') === 0) {
                yield backUpIndex(esClient, index);
                indices.opaqueValues.push(index);
            } else if (indexName.indexOf('results-') === 0) {
                indices.results.push(index);
            } else if (yield belongsToCollection(config.mongodb.db,
                    index.index, 'sessions')) {
                yield backUpIndex(esClient, index);
                indices.traces.push(index);
            } else if (yield belongsToCollection(config.mongodb.db,
                    index.index, 'versions')) {
                yield backUpIndex(esClient, index);
                indices.versions.push(index);
            } else {
                indices.others.push(index);
            }
        }

    }).catch(function (err) {
        // Log any uncaught errors
        // co will not throw any errors you do not handle!!!
        // HANDLE ALL YOUR ERRORS!!!
        console.log('Error while backing up!');
        console.error(err.stack);
        callback(err, config);
    }).then(function () {
        callback(null, config);
    });
}

function* upgradeGameIndex(esClient, gameIndex) {

    let totalSessionsVis = yield at(esClient.get({
        index: gameIndex.index,
        type: 'visualization',
        id: 'TotalSessionPlayers-Cmn'
    })).catch(function (notFound) {
        console.log('No TotalSessionPlayers-Cmn ' +
            'visualization found for game index', gameIndex.index);
        console.error(notFound);
    });

    if (totalSessionsVis && totalSessionsVis._source) {
        yield at(esClient.index({
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
        }));
    }

    let xAPIVerbsActivity = yield at(esClient.get({
        index: gameIndex.index,
        type: 'visualization',
        id: 'xAPIVerbsActivity'
    })).catch(function (notFound) {
        console.log('No xAPIVerbsActivity visualization' +
            ' found for game index', gameIndex.index);
        console.error(notFound);
    });

    if (!xAPIVerbsActivity || !xAPIVerbsActivity._source) {
        return;
    }

    yield at(esClient.index({
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
    }));

}

function* upgradeGamesIndices(esClient) {
    if (indices.games.length === 0) {
        return;
    }
    for (let i = 0; i < indices.games.length; i++) {
        let gameIndex = indices.games[i];
        yield upgradeGameIndex(esClient, gameIndex);
    }
}

function checkTraceExtensions(trace) {
    let newTrace = {};
    Object.keys(trace).forEach(function (property) {
            if (defaultTraceAttributes.indexOf(property) === -1) {
                if (!newTrace.ext) {
                    newTrace.ext = {};
                }
                newTrace.ext[property] = String(trace[property]);

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

function* identifyExtensionsFromIndex(esClient, index) {

    let oldMapping = yield at(esClient.indices.getMapping({index: index.index}));
    let upgradeIndex = 'upgrade_' + index.index;
    let mapping = {};
    mapping[upgradeIndex] = Object.assign({}, defaultBaseMapping);

    for (let key in oldMapping) {
        let currentType = oldMapping[key].mappings;
        for (let type in currentType) {
            let currentProperties = currentType[type];
            if (currentProperties && currentProperties.properties) {
                if (!mapping[upgradeIndex].mappings[type]) {
                    mapping[upgradeIndex].mappings[type] = {
                        properties: {}
                    };
                }

                let props = currentProperties.properties;
                let newProperties = mapping[upgradeIndex].mappings[type].properties;
                for (let property in props) {
                    if (defaultTraceAttributes.indexOf(property) === -1) {
                        if (!newProperties.ext) {
                            newProperties.ext = {
                                properties: {}
                            };
                        }
                        newProperties.ext.properties[property] = {
                            type: 'text',
                            fields: {
                                keyword: {
                                    type: 'keyword',
                                    ignore_above: 256
                                }
                            }
                        };
                    } else if (!newProperties[property]) {
                        newProperties.properties[property] = {
                            type: 'text',
                            fields: {
                                keyword: {
                                    type: 'keyword',
                                    ignore_above: 256
                                }
                            }
                        };
                    }
                }
            }
        }
    }

    let upgraded = false;

    if (!(yield at(esClient.indices.exists({index: upgradeIndex})))) {
        yield at(esClient.indices.create({index: upgradeIndex}));
    }

    let indexMapping = mapping.mappings;
    yield at(esClient.indices.close({index: upgradeIndex}));
    for (let type in indexMapping) {
        yield at(esClient.indices.putMapping({
            index: upgradeIndex,
            type: type,
            body: indexMapping[type]
        }));
    }
    yield at(esClient.indices.open({index: upgradeIndex}));

    function* windowed(hits) {
        let bulkUpgradedTraces = [];
        hits.hits.forEach(function (hit) {
            let newTrace = checkTraceExtensions(hit._source);
            bulkUpgradedTraces.push({update: {_index: upgradeIndex, _type: hit._type, _id: hit._id}});
            bulkUpgradedTraces.push({doc: newTrace, doc_as_upsert: true});
        });

        if (bulkUpgradedTraces.length > 0) {
            yield at(esClient.bulk({body: bulkUpgradedTraces}));
            upgraded = true;
        }
    }

    yield scrollIndex(esClient, index.index, windowed);
    if (upgraded) {
        copyIndexObjectWithPrefixTo(indices.upgrade, index, upgradeIndex);
    }
}

function* identifyExtensions(esClient, indexArray) {
    if (indexArray.length === 0) {
        return;
    }
    for (let i = 0; i < indexArray.length; i++) {
        yield identifyExtensionsFromIndex(esClient, indexArray[i]);
    }
}

function checkNeedsUpdateVisualization(visualization) {

    let visState = JSON.parse(visualization._source.visState.replaceAll('\\\"', '"'));

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
    let needsUpdate = false;
    for (let i = 0; i < visState.aggs.length; ++i) {
        let agg = visState.aggs[i];
        if (!agg) {
            continue;
        }

        if (!agg.params) {
            continue;
        }

        if (!agg.params.field) {
            continue;
        }

        let field = agg.params.field;

        let isDefaultAttribute = false;
        for (let j = 0; j < defaultTraceAttributes.length; ++j) {
            let defaultAttribute = defaultTraceAttributes[j];

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

function* setUpKibanaIndex(esClient) {
    if (!indices.configs.kibana) {
        return;
    }

    let upgraded = false;
    let to = 'upgrade_' + indices.configs.kibana.index;

    function* windowed(hits) {
        let bulkUpgradedTraces = [];

        for (let i = 0; i < hits.hits.length; ++i) {
            let hit = hits.hits[i];
            if (hit._type === 'visualization') {
                checkNeedsUpdateVisualization(hit);
            } else if (hit._type === 'index-pattern') {
                checkNeedsUpdateIndexPattern(hit);
            }

            bulkUpgradedTraces.push({update: {_index: to, _type: hit._type, _id: hit._id}});
            bulkUpgradedTraces.push({doc: hit._source, doc_as_upsert: true});
        }

        if (bulkUpgradedTraces.length > 0) {
            yield at(esClient.bulk({body: bulkUpgradedTraces}));
            upgraded = true;
        }
    }

    yield scrollIndex(esClient, indices.configs.kibana.index, windowed);

    if (upgraded) {
        copyIndexObjectWithPrefixTo(indices.upgrade, indices.configs.kibana, to);
    }
}

function checkNeedsUpdateIndexPattern(indexPattern) {

    let fields = JSON.parse(indexPattern._source.fields.replaceAll('\\\"', '"'));


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
    let needsUpdate = false;

    for (let i = 0; i < fields.length; ++i) {
        let field = fields[i];
        if (!field) {
            continue;
        }

        if (!field.name) {
            continue;
        }

        let fieldName = field.name;

        let isDefaultAttribute = false;
        for (let j = 0; j < defaultTraceAttributes.length; ++j) {
            let defaultAttribute = defaultTraceAttributes[j];

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
        indexPattern._source.fields = JSON.stringify(fields);
    }
}

function* setUpTemplateIndex(esClient) {
    if (!indices.configs.template) {
        return;
    }

    let upgraded = false;
    let to = 'upgrade_' + indices.configs.template.index;

    function* windowed(hits) {

        let bulkUpgradedTraces = [];
        hits.hits.forEach(function (hit) {
            if (hit._type === 'index' ||
                hit._type === 'index-pattern') {
                checkNeedsUpdateIndexPattern(hit);
            }

            bulkUpgradedTraces.push({update: {_index: to, _type: hit._type, _id: hit._id}});
            bulkUpgradedTraces.push({doc: hit._source, doc_as_upsert: true});
        });

        if (bulkUpgradedTraces.length > 0) {
            yield at(esClient.bulk({body: bulkUpgradedTraces}));
            upgraded = true;
        }
    }

    yield scrollIndex(esClient, indices.configs.template.index, windowed);

    if (upgraded) {
        copyIndexObjectWithPrefixTo(indices.upgrade, indices.configs.template, to);
    }
}

function* setUpGameIndex(esClient, gameIndex) {

    let upgraded = false;
    let to = 'upgrade_' + gameIndex.index;

    function* windowed(hits) {
        let bulkUpgradedTraces = [];
        hits.hits.forEach(function (hit) {
            if (hit._type === 'visualization') {
                checkNeedsUpdateVisualization(hit);
            } else if (hit._type === 'index-pattern' || hit._type === 'index') {
                checkNeedsUpdateIndexPattern(hit);
            }

            bulkUpgradedTraces.push({update: {_index: to, _type: hit._type, _id: hit._id}});
            bulkUpgradedTraces.push({doc: hit._source, doc_as_upsert: true});
        });

        if (bulkUpgradedTraces.length > 0) {
            yield at(esClient.bulk({body: bulkUpgradedTraces}));
            upgraded = true;
        }
    }

    yield scrollIndex(esClient, gameIndex.index, windowed);

    if (upgraded) {
        copyIndexObjectWithPrefixTo(indices.upgrade, gameIndex, to);
    }
}

function* setUpVisualizations(esClient) {

    yield setUpKibanaIndex(esClient);

    yield setUpTemplateIndex(esClient);

    if (indices.games.length === 0) {
        return;
    }

    for (let i = 0; i < indices.games.length; i++) {
        let gameIndex = indices.games[i];
        yield setUpGameIndex(esClient, gameIndex);
    }
}

function* processExistingUpgradeIndex(esClient, index, newIndex) {

    let exists = yield at(esClient.indices.exists({index: newIndex}));

    if (exists) {
        yield at(esClient.indices.delete({index: newIndex}));
    }

    yield reindexManually(esClient, index, newIndex);

    yield at(esClient.indices.delete({index: index}));
    indices.deleted[index] = true;
}

function upgrade(config, callback) {
    co(function* () {


        let esClient = config.elasticsearch.esClient;
        yield at(esClient.indices.refresh({index: '_all'}));

        yield upgradeGamesIndices(esClient);
        console.log('Finished upgrading game indices!');

        yield identifyExtensions(esClient, indices.traces);
        console.log('Finished identifying traces extensions!', extensions);

        yield identifyExtensions(esClient, indices.versions);
        console.log('Finished identifying versions extensions!', extensions);

        yield setUpVisualizations(esClient);
        console.log('Finished setting up visualizations!', extensions);

        if (indices.upgrade.length === 0) {
            return;
        }

        yield at(esClient.indices.refresh({index: '_all'}));

        for (let i = 0; i < indices.upgrade.length; i++) {
            let index = indices.upgrade[i];
            if (!index.index) {
                continue;
            }

            let newIndex = index.index.substr('upgrade_'.length);
            if (!newIndex) {
                continue;
            }
            yield processExistingUpgradeIndex(esClient, index.index, newIndex);
        }

    }).catch(function (err) {
        // Log any uncaught errors
        // co will not throw any errors you do not handle!!!
        // HANDLE ALL YOUR ERRORS!!!
        console.log('Error while backing up!');
        console.error(err.stack);
        callback(err, config);
    }).then(function () {
        callback(null, config);
    });
}

function sourcesEquals(x, y) {
    // Recursive object equality check
    let p = Object.keys(x);
    return Object.keys(y).every(function (i) {
        if (i === 'ext') {
            let exts = y.ext;
            if (exts) {
                Object.keys(exts).every(function (extKey) {
                    if (extensions.indexOf(extKey) === -1) {
                        return false;
                    }

                    return p.indexOf(extKey) !== -1 && exts[extKey] === x[extKey];
                });
            } else {
                for (let j = 0; j < extensions.length; ++i) {
                    let identifiedExt = extensions[j];
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

function* checkHit(esClient, hit, index) {

    let response = yield at(esClient.get({
        index: index,
        type: hit._type,
        id: hit._id
    }));

    if (!response || !response._source) {
        return false;
    }

    return sourcesEquals(hit._source, response._source);
}

function* checkIndices(esClient, backedUpIndex, index) {

    function* windowed(hits) {
        for (let i = 0; i < hits.hits.length; ++i) {
            let hit = hits.hits[i];

            let same = yield checkHit(esClient, hit, index);

            if (!same) {
                throw new Error('Failed comparing hit ' + JSON.stringify(hit, null, 4));
            }
        }
    }

    yield scrollIndex(esClient, backedUpIndex, windowed);
}

function check(config, callback) {
    co(function* () {

            let esClient = config.elasticsearch.esClient;
            yield at(esClient.indices.refresh({index: '_all'}));

            const indicesResponse = yield at(esClient.cat.indices({format: 'json'}));

            if (!indicesResponse || indicesResponse.length === 0) {
                return callback(null, config);
            }

            let backupCount = 0;
            let i;
            let index;
            for (i = 0; i < indicesResponse.length; i++) {
                index = indicesResponse[i];
                if (index.index) {
                    if (index.index.indexOf('backup_') === 0) {
                        backupCount++;
                    }
                }
            }

            for (i = 0; i < indicesResponse.length; i++) {
                index = indicesResponse[i];
                if (!index.index) {
                    continue;
                }
                if (index.index.indexOf('backup_') !== 0) {
                    continue;
                }

                let normalIndex = index.index.substr('backup_'.length);

                if (!normalIndex) {
                    return callback(new Error('Not found correct index for backed index: ' +
                        JSON.stringify(index, null, 4)));
                }

                let foundIndex = false;
                for (let j = 0; j < indicesResponse.length; ++j) {
                    let retIndex = indicesResponse[j];
                    if (!retIndex.index ||
                        retIndex.index !== normalIndex) {
                        continue;
                    }
                    foundIndex = true;

                    if (index['docs.count'] !== retIndex['docs.count']) {
                        return callback(new Error('DIFFERENT document count ' +
                            JSON.stringify(index, null, 4) + ' and ' +
                            JSON.stringify(retIndex, null, 4)), config);
                    }

                    yield checkIndices(esClient, index.index, retIndex.index);
                }

                if (!foundIndex) {
                    return callback(new Error('Not found normal index for backed index for ' +
                        '(should not happen): ' +
                        JSON.stringify(index, null, 4)));
                }
            }
        }
    ).catch(function (err) {
        // Log any uncaught errors
        // co will not throw any errors you do not handle!!!
        // HANDLE ALL YOUR ERRORS!!!
        console.log('Error while backing up!');
        console.error(err.stack);
        callback(err, config);
    }).then(function () {
        callback(null, config);
    });
}

function clean(config, callback) {
    co(function* () {

        let esClient = config.elasticsearch.esClient;
        yield at(esClient.indices.refresh({index: '_all'}));

        let toRemove = [];
        // Remove the backups
        for (let i = 0; i < indices.backup.length; i++) {
            let backupIndex = indices.backup[i];
            toRemove.push(backupIndex.index);
        }

        // Remove the upgrades that werent removed before
        for (let j = 0; j < indices.upgrade.length; j++) {
            let upgradeIndex = indices.upgrade[j];
            if (!indices.deleted[upgradeIndex.index]) {
                toRemove.push(upgradeIndex.index);
            }
        }

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

        if (toRemove.length === 0) {
            return;
        }

        yield at(esClient.indices.delete({index: toRemove.join(',')}));

    }).catch(function (err) {
        // Log any uncaught errors
        // co will not throw any errors you do not handle!!!
        // HANDLE ALL YOUR ERRORS!!!
        console.log('Error while backing up!');
        console.error(err.stack);
        callback(err, config);
    }).then(function () {
        callback(null, config);
    });
}

function* restoreIndex(esClient, backedUpIndex, newIndex) {

    let exists = yield at(esClient.indices.exists({index: newIndex}));

    if (exists) {
        let result = yield at(esClient.indices.delete({index: newIndex}));
        console.log('Index ' + newIndex + ' deleted successfully, result ' +
            JSON.stringify(result, null, 4));
    }

    reindexManually(esClient, backedUpIndex, newIndex);
}

function restore(config, callback) {
    co(function* () {

        let esClient = config.elasticsearch.esClient;
        yield at(esClient.indices.refresh({index: '_all'}));

        for (let i = 0; i < indices.backup.length; i++) {
            let index = indices.backup[i];
            restoreIndex(esClient, index.index, index.index.substr('backup_'.length));
            yield at(esClient.indices.delete({index: index.index}));
        }
        let toRemove = [];
        for (let j = 0; j < indices.upgrade.length; j++) {
            let indexj = indices.upgrade[j];
            if (indexj && indexj.index && !indices.deleted[indexj.index]) {
                toRemove.push(indexj.index);
            }
        }
        if (toRemove.length === 0) {
            return;
        }
        yield at(esClient.indices.delete({index: toRemove.join(',')}));

    }).catch(function (err) {
        // Log any uncaught errors
        // co will not throw any errors you do not handle!!!
        // HANDLE ALL YOUR ERRORS!!!
        console.log('Error while backing up!');
        console.error(err.stack);
        callback(err, config);
    }).then(function () {
        callback(null, config);
    });
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