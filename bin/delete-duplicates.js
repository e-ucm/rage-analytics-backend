'use strict';

/**
 * Using Generator-based flow in Nodejs to iterate over the entire Elasticsearch database
 * and remove all the documents that are duplicated. A duplicated document has every single field equal to another document
 * with the exception of the field '_id'
 *
 * The workflow is split into three phases:
 *
 *  (1) Load Phase
 *      - iterates documments from an Elasticsearch index shorted by 'timestamp' field increasingly
 *
 *  (2) Filter Phase
 *      - filters the yelded documments forming batches of documents with the same timestamp
 *      - checks the batched documents comparing all the remaining fields of the document
 *      - '_id' field must be different
 *      - all remaining fields must be the same, otherwise it doesn't need removal since it's a unique document
 *      - yelds a batch of documents that have to be removed from the Elasticsearch index
 *
 *  (3) Remove Phase, optionally, if needed
 *      - removes the yelded documents from (2)
 */

// For ES specific naming convention we need to do this
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
let Path = require('path');
let config = require(Path.resolve(__dirname, '../config.js'));
let elasticsearch = require('elasticsearch');

let co = require('co');
let promiseRetry = require('promise-retry');

let baseUsersAPI = config.elasticsearch.uri;

let esClient = new elasticsearch.Client({
    host: baseUsersAPI,
    api: '5.0'
});

// Used for attempting
let defaultRetryOptions = {
    retries: 10,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 60000,
    randomize: true
};

// Attempt
let at = function (promise) {
    return promiseRetry(defaultRetryOptions, function (retry, number) {
        return promise.catch(function (error) {
            if (error.statusCode === 404) {
                throw error;
            }
            console.error('Error retrying ' + number +
                ' for promise ' + promise.name + ' logs: ' +
                JSON.stringify(error, null, 4));
            retry(error);
        });
    });
};

co(function*() {
    yield at(esClient.ping({requestTimeout: 3000}));
    yield at(esClient.indices.refresh({index: '_all'}));

    console.log('Successfully connected to elasticsearch!', baseUsersAPI);

    const indices = yield at(esClient.cat.indices({format: 'json'}));

    const defaultScrollTimeout = '5m';
    const sort = 'timestamp:asc';
    const toDeleteIndex = '.to-delete';
    const defaultScrollSize = 1000;

    let totalDups = 0;

    let compareHits = function(currentHit, foundHit) {
        let euq = true;
        let p = Object.keys(currentHit._source);
        Object.keys(foundHit._source).forEach(function (i) {
            if (p.indexOf(i) === -1) {
                euq = false;
            }
            if (currentHit._source[i] !== foundHit._source[i]) {
                euq = false;
            }
        });
        return euq;
    };

    function* checkDiffs(hits) {
        if (hits.length === 1) {
            return;
        }
        while (hits.length > 0) {
            let currentHit = hits.shift();
            for (let j = 0; j < hits.length; j++) {
                let foundHit = hits[j];
                if (foundHit._id === currentHit._id ||
                    foundHit.toDelete) {
                    continue;
                }

                let euq = compareHits(currentHit, foundHit);

                if (euq) {
                    let body = {
                        original: currentHit,
                        duplicate: foundHit
                    };
                    yield at(esClient.index({
                        index: toDeleteIndex,
                        type: currentHit._type,
                        body: body
                    }));
                    totalDups++;
                    foundHit.toDelete = true;
                }
            }
        }
    }

    function* groupHits(originalHits, hits) {
        for (let i = 0; i < originalHits.length; ++i) {
            let hit = originalHits[i];
            let time = hit._source.timestamp;
            if (!time) {
                continue;
            }

            if (hits.length > 0) {
                let pHit = hits[0];
                if (pHit._source.timestamp !== time) {
                    yield checkDiffs(hits);
                    hits = [];
                }
            }
            hits.push(hit);
        }
    }

    function* removeHits(hits) {

        function deleteIndex(body) {
            return function errTry(error) {
                body.error = JSON.stringify(error, null, 4);
                console.log('Ignoring error', error);
                co(function * () {
                    yield at(esClient.index({
                        index: '.deleting-errors',
                        type: 'errored',
                        body: body
                    }));
                });
            };
        }

        for (let i = 0; i < hits.length; ++i) {
            let hit = hits[i];
            yield at(esClient.delete({
                index: hit._source.duplicate._index,
                type: hit._source.duplicate._type,
                id: hit._source.duplicate._id
            })).catch(deleteIndex(hit));
        }
    }

    function* deleteDups() {
        let result = yield at(esClient.search({
            index: toDeleteIndex,
            scroll: defaultScrollTimeout
        }));

        let total = result.hits.hits.length;

        console.log('Going to delete', total);

        yield removeHits(result.hits.hits);

        while (total < result.hits.total) {

            result = yield at(esClient.scroll({
                scrollId: result._scroll_id,
                scroll: defaultScrollTimeout
            }));
            total += result.hits.hits.length;

            yield removeHits(result.hits.hits);
        }
    }


    for (let i = 0; i < indices.length; i++) {
        let index = indices[i];

        const scrollId = index.index;
        if (scrollId.indexOf('default') === 0 ||
            scrollId.indexOf('results') === 0 ||
            scrollId.indexOf('opaque') === 0 ||
            scrollId.indexOf('.') === 0) {
            continue;
        }

        let result = yield at(esClient.search({
            index: scrollId,
            scroll: defaultScrollTimeout,
            sort: sort,
            size: defaultScrollSize
        }));

        let total = result.hits.hits.length;

        console.log(total);

        let hits = [];
        yield groupHits(result.hits.hits, hits);

        while (total < result.hits.total) {

            result = yield at(esClient.scroll({
                scrollId: result._scroll_id,
                scroll: defaultScrollTimeout,
                size: defaultScrollSize
            }));
            total += result.hits.hits.length;

            yield groupHits(result.hits.hits, hits);
            console.log(total);
        }
    }

    console.log('Duplicates', totalDups);
    yield deleteDups();

}).catch(function (err) {
    // Log any uncaught errors
    // co will not throw any errors you do not handle!!!
    // HANDLE ALL YOUR ERRORS!!!
    console.error(err.stack);
});
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers