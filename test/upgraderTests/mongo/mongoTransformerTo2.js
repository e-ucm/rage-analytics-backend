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
    /**               Test Mongo Transformer To v2                  **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Mongo TransformTo2 test', function () {

        var inData = require('./upgradeInputs/exampleTo2IN');
        var outData = require('./upgradeOutputs/exampleTo2OUT');

        var insertAndUpgrade = function(data, callback){
            var transform = function(){
                var t = require('../../../bin/upgrade/transformers/mongo/transformToVersion2.js');
                async.waterfall([function (newCallback) {
                    newCallback(null, config);
                },  t.backup,
                    t.upgrade,
                    t.check],
                function (err, result) {
                    if (err) {
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
                    db.collection('sessions').remove({},function(err, removed){
                        should(err).be.null;
                        done();
                    });
                });
            });
        });

        afterEach(function (done) {
            db.collection('games').remove({},function(err, removed){
                should(err).be.null;
                db.collection('versions').remove({},function(err, removed){
                    should(err).be.null;
                    db.collection('sessions').remove({},function(err, removed){
                        should(err).be.null;
                        db.collection('classes').remove({},function(err, removed){
                            should(err).be.null;
                            done();
                        });
                    });
                });
            });
        });

        it('should create a class for each session and include classId into the sessions', function (done) {
            insertAndUpgrade(inData, function(){
                should(db.collection('classes')).be.Object();

                var checker = new utils.CompletionChecker(0,done);

                var findClassFor = function(session){
                    new Collection(db, 'classes').find(session.classId, true)
                    .then(function(classe){
                        should(classe).be.Object();
                        should.equal(classe.name, 'Automatic Class (' + session.name + ')');
                        checker.Completed();
                    }).fail(function(err){
                        console.info(err);
                    });
                }

                db.collection('sessions').find({}, function(err,sessions){
                    sessions.forEach(function(s){
                        if(s == null)
                            return;

                        checker.tocom++;
                        findClassFor(s);
                    });
                });
            });
        });

        it('should Games collection be equal to exampleTo2OUT games array', function (done) {
            insertAndUpgrade(inData, function(){
                utils.collectionComparer(db, 'games', outData, done);
            });
        });

        it('should versions collection be equal to exampleTo2OUT versions array', function (done) {
            insertAndUpgrade(inData, function(){
                utils.collectionComparer(db, 'versions', outData, done);
            });
        });

        it('should classes collection be equal to exampleTo2OUT classes array ignoring _id', function (done) {
            insertAndUpgrade(inData, function(){
                db.collection('classes').find({}, function(err,classes){
                    classes.count().then(function(size){
                        var checker = new utils.CompletionChecker(size,done);
                        classes.forEach(function(o1){
                            if(o1 == null)
                                return;

                            var found = false;
                            for(var o2 of outData.classes){
                                if(o1.name.toString() === o2.name.toString()){
                                    found = true;
                                    should(utils.compareDocuments(o1, o2, ["_id", "created"])).equal(true);
                                }
                            }
                            should(found).equal(true);
                            checker.Completed();
                        });
                    });
                });
            });
        });

        it('should sessions collection be equal to exampleTo2OUT sessions array ignoring classId (previously checked)', function (done) {
            insertAndUpgrade(inData, function(){
                utils.collectionComparer(db, 'sessions', outData, done, ["classId"]);
            });
        });

        it('should do the upgrade even with empty collections', function (done) {
            insertAndUpgrade([], function(){
                var checker = new utils.CompletionChecker(4, done);
                var comp = function(){
                    checker.Completed();
                }

                utils.collectionComparer(db, 'games', {'games': []}, comp);
                utils.collectionComparer(db, 'versions', {'versions': []}, comp);
                utils.collectionComparer(db, 'classes', {'classes': []}, comp);
                utils.collectionComparer(db, 'sessions', {'sessions': []}, comp);
            });
        });
    });
};
