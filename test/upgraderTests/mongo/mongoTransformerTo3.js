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
var Collection = require('easy-collections');
var utils = require('../upgraderTestUtils.js');

module.exports = function (request, db, config) {
    config.mongodb.db = db;

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**               Test Mongo Transformer To v3                  **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Mongo TransformTo3 test', function () {

        var inData = require('./upgradeInputs/exampleTo3IN');
        var outData = require('./upgradeOutputs/exampleTo3OUT');

        var insertAndUpgrade = function(data, callback){
            var transform = function(){
                var t = require('../../../bin/upgrade/transformers/mongo/transformToVersion3.js');
                async.waterfall([function (newCallback) {
                    newCallback(null, config);
                },  t.backup,
                    t.upgrade,
                    t.check],
                function (err, result) {
                    if (err) {
                        console.info(err);
                        return logError(err, result);
                    }
                    callback();
                });
            };

            if(Object.keys(data).length == 0){
                transform();
            }

            var checker = new utils.CompletionChecker(Object.keys(data).length, transform);

            Object.keys(data).forEach(function (key) {
                if(key == null)
                    return;

                db.collection(key).insert(data[key], function(err,result){
                    should(err).be.null;
                    checker.Completed();
                });
            });
        }

        beforeEach(function(done){
            db.collection('games').remove({},function(err, removed){
                should(err).be.null;
                db.collection('versions').remove({},function(err, removed){
                    should(err).be.null;
                    db.collection('classes').remove({},function(err, removed){
                        should(err).be.null;
                        db.collection('sessions').remove({},function(err, removed){
                            should(err).be.null;
                            done();
                        });
                    });
                });
            });
        });

        afterEach(function (done) {
            db.collection('games').remove({},function(err, removed){
                should(err).be.null;
                db.collection('versions').remove({},function(err, removed){
                    should(err).be.null;
                    db.collection('activities').remove({},function(err, removed){
                        should(err).be.null;
                        db.collection('classes').remove({},function(err, removed){
                            should(err).be.null;
                            done();
                        });
                    });
                });
            });
        });

        it('should transform correctly mongo sessions', function (done) {
            insertAndUpgrade(inData, function(){
                should(db.collection('activities')).be.Object();
                var ncom = 0;
                var tocom = inData.sessions.length;
                var completed = function(){
                    ncom++
                    if(ncom >= tocom){
                        done();
                    }
                }

                var findActivityFor = function(session){
                    new Collection(db, 'activities').find(session._id, true)
                    .then(function(activity){
                        should.equal(session.name, activity.name);
                        completed();
                    }).fail(function(err){
                        console.info(err);
                    });
                }

                db.collection('sessions').find({}, function(err,sessions){
                    sessions.forEach(function(s){
                        if(s == null)
                            return;

                        tocom++;
                        findClassFor(s);
                    });
                });

                for(var s of inData.sessions){
                    findActivityFor(s);
                }
            });
        });

        it('should Games collection be equal to exampleTo3OUT games array', function (done) {
            insertAndUpgrade(inData, function(){
                utils.collectionComparer(db, 'games', outData, done);
            });
        });

        it('should Versions collection be equal to exampleTo3OUT versions array', function (done) {
            insertAndUpgrade(inData, function(){
                utils.collectionComparer(db, 'versions', outData, done);
            });
        });

        it('should Classes collection be equal to exampleTo3OUT classes array', function (done) {
            insertAndUpgrade(inData, function(){
                utils.collectionComparer(db, 'classes', outData, done);
            });
        });

        it('should Activities collection be equal to exampleTo3OUT activities array', function (done) {
            insertAndUpgrade(inData, function(){
                utils.collectionComparer(db, 'activities', outData, done);
            });
        });

        it('should sessions collection be empty', function (done) {
            insertAndUpgrade(inData, function(){
                utils.collectionComparer(db, 'sessions', {'sessions': []}, done);
            });
        });

        it('should do the upgrade even with empty collections', function (done) {
            insertAndUpgrade([], function(){
                var checker = new utils.CompletionChecker(5, done);
                var comp = function(){
                    checker.Completed();
                }

                utils.collectionComparer(db, 'games', {'games': []}, comp);
                utils.collectionComparer(db, 'versions', {'versions': []}, comp);
                utils.collectionComparer(db, 'classes', {'classes': []}, comp);
                utils.collectionComparer(db, 'sessions', {'sessions': []}, comp);
                utils.collectionComparer(db, 'activities', {'activities': []}, comp);
            });
        });
    });
};
