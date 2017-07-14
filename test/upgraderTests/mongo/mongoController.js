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
var Collection = require('easy-collections');

module.exports = function (request, app, db) {

    var mongoController;

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**               Test Mongo Collector Version Guessing         **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Mongo Collection test', function () {
        this.timeout(25000);

        before(function (done) {
            var upgrader = require('../../../bin/upgrade/upgrader.js');
            require('../../../bin/upgrade/controllers/upgrade-mongo-collections.js');
            mongoController = upgrader.getController('mongo');
            done();
        });

        var insert = function (data, callback) {

            var keys = Object.keys(data);
            if (keys.length === 0) {
                return callback();
            }

            var count = 0;

            function finished() {
                count++;
                if (count >= keys.length) {
                    callback();
                }
            }

            keys.forEach(function (key) {
                if (!key)
                    return finished();

                db.collection(key).insert(data[key], function (err, result) {
                    should.not.exist(err);
                    finished();
                });
            });
        };


        beforeEach(function (done) {
            mongoController.connect(app.config, function () {
                db.collection('games').drop(function () {
                    db.collection('versions').drop(function () {
                        db.collection('sessions').drop(function () {
                            db.collection('classes').drop(function () {
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('should detect version 1 without with empty mongo collection', function (done) {
            mongoController.refresh(function (err, status) {
                should.not.exist(err);
                should({
                    requirements: {},
                    status: 1,
                    version: {
                        destination: '2',
                        origin: '1'
                    }
                }).deepEqual(status);
                should(mongoController.existingModelVersion()).equal('1');
                done();
            });
        });


        it('should detect version 1 without classes collection', function (done) {
            var inData = require('./upgradeInputs/exampleControllerV1');
            insert(inData, function() {

                mongoController.refresh(function (err, status) {
                    should.not.exist(err);
                    should({
                        requirements: {},
                        status: 1,
                        version: {
                            destination: '2',
                            origin: '1'
                        }
                    }).deepEqual(status);
                    should(mongoController.existingModelVersion()).equal('1');
                    done();
                });
            });
        });


        it('should detect version 2 with a correct classes collection', function (done) {
            var inData = require('./upgradeInputs/exampleControllerV2');
            insert(inData, function() {

                mongoController.refresh(function (err, status) {
                    should.not.exist(err);
                    should({
                        requirements: {},
                        status: 1,
                        version: {
                            destination: '3',
                            origin: '2'
                        }
                    }).deepEqual(status);
                    should(mongoController.existingModelVersion()).equal('2');
                    done();
                });
            });
        });
    });
};
