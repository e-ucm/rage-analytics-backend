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

var should = require('should');

module.exports = function (app, esClient, mongo) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**              Test Elastic Controller                        **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Elastic Controller test', function () {
        this.timeout(25000);
        app.config.elasticsearch.esClient = esClient;
        app.config.mongodb.db = mongo;
        var elasticController;
        before(function (done) {
            var upgrader = require('../../../bin/upgrade/upgrader.js');
            require('../../../bin/upgrade/controllers/upgrade-elastic-indices.js');
            elasticController = upgrader.getController('elastic');
            done();
        });

        beforeEach(function (done) {
            app.esClient.indices.delete({
                index: '_all'
            }, function (error, response) {
                elasticController.connect(app.config, function () {
                    done(error);
                });
            });

        });

        it('should detect version 1 without with empty ES DB', function (done) {
            elasticController.refresh(function (err, status) {
                should.not.exist(err);
                should({
                    status: 1,
                    requirements: {
                        mongo: '1'
                    },
                    version: {
                        origin: '1',
                        destination: '2'
                    }
                }).deepEqual(status);
                elasticController.getModelVersion(elasticController.appConfig, function (err, version) {
                    should(version).equal('1');
                    done();
                });
            });
        });

        it('should detect version 1 with a version 1 .template index', function (done) {
            var fileIn = './upgradeInputs/templateIndexTo2IN.js';

            bulkFunction(fileIn, '.template', function(error) {
                should.not.exist(error);
                elasticController.refresh(function (err, status) {
                    should.not.exist(err);
                    should({
                        status: 1,
                        requirements: {
                            mongo: '1'
                        },
                        version: {
                            origin: '1',
                            destination: '2'
                        }
                    }).deepEqual(status);
                    elasticController.getModelVersion(elasticController.appConfig, function (err, version) {
                        should(version).equal('1');
                        done();
                    });
                });
            });
        });

        it('should detect version 1 with no .template index but other indices', function (done) {
            var fileIn = './upgradeInputs/kibanaIndexTo2IN.js';

            bulkFunction(fileIn, '.kibana', function(error) {
                should.not.exist(error);
                elasticController.refresh(function (err, status) {
                    should.not.exist(err);
                    should({
                        status: 1,
                        requirements: {
                            mongo: '1'
                        },
                        version: {
                            origin: '1',
                            destination: '2'
                        }
                    }).deepEqual(status);
                    elasticController.getModelVersion(elasticController.appConfig, function (err, version) {
                        should(version).equal('1');
                        done();
                    });
                });
            });
        });

        it('should detect version 1 with a .template index but no defaultIndex id', function (done) {
            var fileIn = './upgradeInputs/kibanaIndexTo2IN.js';

            bulkFunction(fileIn, '.kibana', function(error) {
                should.not.exist(error);
                elasticController.refresh(function (err, status) {
                    should.not.exist(err);
                    should({
                        status: 1,
                        requirements: {
                            mongo: '1'
                        },
                        version: {
                            origin: '1',
                            destination: '2'
                        }
                    }).deepEqual(status);
                    elasticController.getModelVersion(elasticController.appConfig, function (err, version) {
                        should(version).equal('1');
                        done();
                    });
                });
            });
        });

        it('should detect version 2 with a version 2 .template index', function (done) {
            var fileIn = './upgradeOutputs/templateIndexControllerOUT.js';

            bulkFunction(fileIn, '.template', function(error) {
                should.not.exist(error);
                elasticController.refresh(function (err, status) {
                    should.not.exist(err);

                    should({
                        status: 0
                    }).deepEqual(status);

                    elasticController.getModelVersion(elasticController.appConfig, function (err, version) {
                        should(version).equal('2');
                        done();
                    });
                });
            });
        });
    });


    function bulkFunction(fileIn, index, callback) {
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
                callback(null, fileIn);
            }, 2000);
        });
    }
};
