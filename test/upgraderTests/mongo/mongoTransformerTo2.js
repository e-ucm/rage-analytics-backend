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

module.exports = function (request, db, config) {
    config.mongodb.db = db;

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**               Test Mongo Transformer To v2                  **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Mongo TransformTo2 test', function () {

        var inData = require('./upgradeInputs/exampleTo2IN');

        beforeEach(function(done){
            db.collection('games').remove({},function(err, removed){
                should(err).be.null;
                db.collection('versions').remove({},function(err, removed){
                    should(err).be.null;
                    db.collection('sessions').remove({},function(err, removed){
                        should(err).be.null;
                        db.collection('games').insert(inData.games, function(err,result){
                            if(!err){
                                db.collection('versions').insert(inData.versions, function(err,result){
                                    if(!err){
                                        db.collection('sessions').insert(inData.sessions, function(err,result){
                                            if(!err){
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
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
            // apply transform
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

                    should(db.collection('classes')).be.Object();

                    var ncom = 0;
                    var tocom = 0;
                    var completed = function(){
                        ncom++
                        if(ncom >= tocom){
                            done();
                        }
                    }

                    var findClassFor = function(session){
                        new Collection(db, 'classes').find(session.classId, true)
                        .then(function(classe){
                            should(classe).be.Object();
                            should.equal(classe.name, 'Automatic Class (' + session.name + ')');
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
                });
            // compare DB with output
        });
    });
};
