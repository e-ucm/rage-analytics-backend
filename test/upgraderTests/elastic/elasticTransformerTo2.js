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

var async = require('async'),
    ObjectID = require('mongodb').ObjectId,
    utils = require('../upgraderTestUtils.js');


var idSession = new ObjectID('dummyGameId0');

module.exports = function (app, esClient, mongo) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**              Test Elastic Transformer To v2                 **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Elastic TransformTo2 test', function () {
        this.timeout(1000000);
        app.config.elasticsearch.esClient = esClient;
        app.config.mongodb.db = mongo;

        before(function(done) {
            mongo.collection('sessions').insert(
                {
                    _id: idSession,
                    title: 'Dummy'
                }, function () {
                    done();
                });
        });

        beforeEach(function (done) {
            app.esClient.indices.delete({
                index: '_all'
            }, function (error, response) {
                done(error);
            });

        });

        it('should transform correctly traces extensions', function (done) {
            var fileIn = './upgradeInputs/tracesTo2IN.js';
            var fileOut = './upgradeOutputs/tracesTo2OUT.js';
            var searchObj = {
                index: idSession.toString(),
                type: 'traces'
            };

            async.waterfall([function(callback) {
                callback(null, fileIn, fileOut, idSession.toString(), searchObj);},
                bulkFunction,
                transformFunction,
                compareFunction
            ], function (err, result) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });

        it('should transform correctly .kibana index', function (done) {
            var fileIn = './upgradeInputs/kibanaIndexTo2IN.js';
            var fileOut = './upgradeOutputs/kibanaIndexTo2OUT.js';
            var searchObj = {
                index: '.kibana'
            };

            async.waterfall([function(callback) {
                callback(null, fileIn, fileOut, '.kibana', searchObj);},
                bulkFunction,
                transformFunction,
                compareFunction
            ], function (err, result) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });

        it('should transform correctly .game indices', function (done) {
            var fileIn = './upgradeInputs/gameIndexTo2IN.js';
            var fileOut = './upgradeOutputs/gameIndexTo2OUT.js';
            var searchObj = {
                index: '.games1234'
            };

            async.waterfall([function(callback) {
                callback(null, fileIn, fileOut, '.games1234', searchObj);},
                bulkFunction,
                transformFunction,
                compareFunction
            ], function (err, result) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });

        it('should transform correctly .template index', function (done) {
            var fileIn = './upgradeInputs/templateIndexTo2IN.js';
            var fileOut = './upgradeOutputs/templateIndexTo2OUT.js';
            var searchObj = {
                index: '.template'
            };

            async.waterfall([function(callback) {
                callback(null, fileIn, fileOut, '.template', searchObj);},
                bulkFunction,
                transformFunction,
                compareFunction
            ], function (err, result) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });

        it('should not be error transforming more than one index', function (done) {
            var fileIn = './upgradeInputs/templateIndexTo2IN.js';
            var fileOut = './upgradeOutputs/templateIndexTo2OUT.js';

            var fileIn2 = './upgradeInputs/kibanaIndexTo2IN.js';
            var fileOut2 = './upgradeOutputs/kibanaIndexTo2OUT.js';

            var searchObj = {
                index: '.template'
            };

            async.waterfall([function(callback) {
                callback(null, fileIn, fileOut, '.template', searchObj);},
                bulkFunction,
                function(fileIn, fileOut, index, searchObj, callback) {
                    callback(null, fileIn2, fileOut2, '.kibana', searchObj);},
                bulkFunction,
                transformFunction
            ], function (err, result) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });

        it('should not be error with a empty database', function (done) {
            async.waterfall([ function(callback) {
                callback(null, null, null, null, null);},
                transformFunction,
                checkEmptyDB
            ], function (err, result) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });

        it('should transform correctly all traces extensions', function (done) {
            async.waterfall([function(callback) {
                callback(null, null, null, idSession.toString(), null);},
                generateTracesAndBulk,
                transformFunction
            ], function (err, result) {
                if (err) {
                    return done(err);
                }
                return done();
            });
        });
    });

    function bulkFunction(fileIn, fileOut, index, searchObj, callback) {
        var bodyIn = require(fileIn);

        var bulkBody = { body: []};

        bodyIn.forEach(function(doc) {
            // Action description
            bulkBody.body.push({ index:  {
                _index: index ? index : doc.index,
                _type: doc.type,
                _id: doc.id
            }});
            // Document to index
            bulkBody.body.push(doc.source);
        });
        // Fill DB
        app.esClient.bulk(bulkBody, function (error, response) {
            if (error) {
                return callback(error);
            }
            setTimeout(function() {
                callback(null, fileIn, fileOut, idSession, searchObj);
            }, 2000);
        });
    }

    function transformFunction(fileIn, fileOut, idSession, searchObj, callback) {
        // Apply transform
        var t = require('../../../bin/upgrade/transformers/elastic/transformToVersion2.js');
        async.waterfall([function (newCallback) {
            newCallback(null, app.config);
        },  t.backup,
            t.upgrade,
            t.check,
            t.clean
        ], function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, fileIn, fileOut, idSession, searchObj);
        });
    }

    function compareFunction(fileIn, fileOut, idSession, searchObj, callback) {
        var bodyOut = require(fileOut);

        setTimeout(function() {
            app.esClient.search(searchObj, function (err, response) {
                console.log('SEARCH RESPONSE: ', JSON.stringify(response));
                if (err) {
                    return callback(err);
                }
                if (response.hits.hits.length === bodyOut.length) {
                    var error = null;
                    bodyOut.forEach(function(doc1) {
                        var doc2;
                        response.hits.hits.forEach(function (doc) {
                            if (doc._id.toString() === doc1.id.toString() && doc._type === doc1.type) {
                                if (utils.compareDocuments(doc._source, doc1.source)) {
                                    doc2 = doc;
                                }
                            }
                        });
                        if (!doc2) {
                            error = new Error('The result DB and the OUT expected documents are different');
                            console.error('Document not FOUND: ' + JSON.stringify(doc1));
                        }
                    });
                    return callback(error);
                }
                return callback(new Error('The OUT expected (' + bodyOut.length + ') and OUT transform(' + response.hits.hits.length + ') lenght  document are different'));
            });
        }, 2000);
    }

    function checkEmptyDB(fileIn, fileOut, idSession, searchObj, callback) {

        setTimeout(function() {
            app.esClient.cat.indices(function (err, response) {
                if (response === undefined) {
                    return callback();
                }
                var indices = response.split('\n');
                if (indices.length === 1) {
                    var info = indices[0].split(' ');
                    if (info[2] === '.model') {
                        return callback();
                    }
                }

                callback(new Error('database is not empty'));
            });
        }, 2000);
    }

    function generateTracesAndBulk(fileIn, fileOut, index, searchObj, callback) {
        var times = [];
        for(var t = 0; t < 100; t++){
            times.push(t);
        }
        var nTraces = 5000;

      
        async.eachSeries(times, function(elem, done){
            var bulkBody = { body: []};
            for (var i = 0; i < nTraces; i++) {
                // Action description
                bulkBody.body.push({
                    index: {
                        _index: index,
                        _type: 'traces'
                    }
                });
                // Document to index
                var doc = {
                    name: (Math.random() + 1).toString(36).substring(7),
                    timestamp: '2017-01-26T16:01:13.225Z',
                    event: 'event',
                    target: (Math.random() + 1).toString(36).substring(4),
                    type: 'type'
                };
    
                var r = Math.floor(Math.random() * 10);
                if (r < 3) {
                    doc['extension' + r] = Math.random() < 0.5;
                } else if (r < 7) {
                    doc['extension' + r] = (Math.random() + 1).toString(36).substring(r);
                } else {
                    doc['extension' + r] = Math.floor(Math.random() * 100);
                }
                bulkBody.body.push(doc);
            }
            
            
            // Fill DB
            app.esClient.bulk(bulkBody, function (error, response) {
                if (error) {
                    return done(error);
                }
                setTimeout(function() {
                    done();
                }, 2000);
            });
        }, function(err){
            callback(err, fileIn, fileOut, index, searchObj);
        });
    }
};
