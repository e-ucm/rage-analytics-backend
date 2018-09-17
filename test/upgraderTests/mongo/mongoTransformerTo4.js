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
var async = require('async');
var utils = require('../upgraderTestUtils.js');

module.exports = function (request, db, config) {
    config.mongodb.db = db;

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**               Test Mongo Transformer To v4                  **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Mongo TransformTo4 test', function () {

        var inData = require('./upgradeInputs/exampleTo4IN');
        var outData = require('./upgradeOutputs/exampleTo4OUT');
        var insertAndUpgrade = function (data, callback) {
            var transform = function () {
                var t = require('../../../bin/upgrade/transformers/mongo/transformToVersion4.js');
                async.waterfall([function (newCallback) {
                        newCallback(null, config);
                    }, t.backup,
                        t.upgrade,
                        t.check,
                        t.clean],
                    function (err, result) {
                        if (err) {
                            console.info(err);
                            return console.error(err, result);
                        }
                        callback();
                    });
            };

            if (Object.keys(data).length === 0) {
                transform();
            }

            var checker = new utils.CompletionChecker(Object.keys(data).length, transform);

            Object.keys(data).forEach(function (key) {
                if (key === null) {
                    return;
                }

                db.collection(key).insert(data[key], function (err, result) {
                    should.equal(err, null);
                    checker.Completed();
                });
            });
        };

        beforeEach(function (done) {
            db.collection('games').remove({}, function (err, removed) {
                should.equal(err, null);
                db.collection('classes').remove({}, function (err, removed) {
                    should.equal(err, null);
                    db.collection('activities').remove({}, function() {
                        db.collection('versions').remove({}, function (err, removed) {
                            should.equal(err, null);
                            db.collection('players').remove({}, function (err, removed) {
                                should.equal(err, null);
                                db.collection('authtokens').remove({}, function (err, removed) {
                                    should.equal(err, null);
                                    db.collection('gameplays_5a16cc69bfc960008bc5e079').remove({}, function (err, removed) {
                                        should.equal(err, null);
                                        db.collection('gameplays_5a16c726bfc960008bc5e071').remove({}, function (err, removed) {
                                            should.equal(err, null);
                                            db.collection('gameplays_5a14760fffce74008bddcabc').remove({}, function (err, removed) {
                                                should.equal(err, null);
                                                setTimeout(function() { done(); }, 500);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        afterEach(function (done) {
            db.collection('games').remove({}, function (err, removed) {
                should.equal(err, null);
                db.collection('classes').remove({}, function (err, removed) {
                    should.equal(err, null);
                    db.collection('activities').remove({}, function() {
                        db.collection('versions').remove({}, function (err, removed) {
                            should.equal(err, null);
                            db.collection('players').remove({}, function (err, removed) {
                                should.equal(err, null);
                                db.collection('authtokens').remove({}, function (err, removed) {
                                    should.equal(err, null);
                                    db.collection('gameplays_5a16cc69bfc960008bc5e079').remove({}, function (err, removed) {
                                        should.equal(err, null);
                                        db.collection('gameplays_5a16c726bfc960008bc5e071').remove({}, function (err, removed) {
                                            should.equal(err, null);
                                            db.collection('gameplays_5a14760fffce74008bddcabc').remove({}, function (err, removed) {
                                                should.equal(err, null);
                                                setTimeout(function() { done(); }, 500);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        it('should Activities contain open and visible field', function (done) {
            insertAndUpgrade(inData, function () {
                utils.collectionComparer(db, 'activities', outData, done);
            });
        });

        it('should Classes collection be equal to exampleTo4OUT classes array', function (done) {
            insertAndUpgrade(inData, function () {
                utils.collectionComparer(db, 'classes', outData, done);
            });
        });

        it('should Games collection be equal to exampleTo4OUT games array', function (done) {
            insertAndUpgrade(inData, function () {
                utils.collectionComparer(db, 'games', outData, done);
            });
        });

        it('should Players collection be equal to exampleTo4OUT players array', function (done) {
            insertAndUpgrade(inData, function () {
                utils.collectionComparer(db, 'players', outData, done);
            });
        });

        it('should Gameplays collection be equal to exampleTo4OUT versions array', function (done) {
            insertAndUpgrade(inData, function () {
                utils.collectionComparer(db, 'gameplays_5a16cc69bfc960008bc5e079', outData, function () {
                    utils.collectionComparer(db, 'gameplays_5a16c726bfc960008bc5e071', outData, function () {
                        utils.collectionComparer(db, 'gameplays_5a14760fffce74008bddcabc', outData, done);
                    });
                });
            });
        });

        it('should do the upgrade even with empty collections', function (done) {
            insertAndUpgrade([], function () {
                var checker = new utils.CompletionChecker(6, done);
                var comp = function () {
                    checker.Completed();
                };

                utils.collectionComparer(db, 'classes',      {classes: []}, comp);
                utils.collectionComparer(db, 'activities',   {activities: []}, comp);
                utils.collectionComparer(db, 'games',        {games: []}, comp);
                utils.collectionComparer(db, 'players',      {players: []}, comp);
                utils.collectionComparer(db, 'versions',     {versions: []}, comp);
                utils.collectionComparer(db, 'authtokens',   {authtokens: []}, comp);
            });
        });
    });
};
