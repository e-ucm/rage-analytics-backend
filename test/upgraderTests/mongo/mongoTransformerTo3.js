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
fs = require('fs');

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**               Test Mongo Transformer To v3                  **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Mongo TransformTo3 test', function () {

        var inData = "";

        before(function(done){
            db.collection('games').remove({},function(err, removed){
                should(err).be.null;
                db.collection('versions').remove({},function(err, removed){
                    should(err).be.null;
                    db.collection('classes').remove({},function(err, removed){
                        should(err).be.null;
                        db.collection('sessions').remove({},function(err, removed){
                            should(err).be.null;
                            fs.readFile('/upgradeInputs/exampleTo2IN', 'utf8', function (err,data) {
                                if (err) {
                                    should(err).be.null;
                                }
                                inData = JSON.parse(data);

                                db.collection('games').insert(inData.games, function(err,result){
                                    if(!err){
                                        db.collection('versions').insert(inData.versions, function(err,result){
                                            if(!err){
                                                db.collection('classes').insert(inData.classes, function(err,result){
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
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });

        afterEach(function (done) {
            // delete all index
        });

        it('should transform correctly mongo sessions', function (done) {
            
            // apply transform
            var t = require('../../../bin/upgrade/transformers/mongo/transformToVersion3.js');
            async.waterfall([function (newCallback) {
                    newCallback(null, request.app.config);
                },  t.backup,
                    t.upgrade,
                    t.check],
                function (err, result) {
                    if (err) {
                        return logError(err, result);
                    }

                    should(db.collection('activities')).be.Object();

                    fs.readFile('/upgradeInputs/exampleTo2IN', 'utf8', function (err,data) {
                        if (err) {
                            should(err).be.null;
                        }
                        inData = JSON.parse(data);

                        var findActivityFor = function(session){
                            db.collection('activities').findOne({_id: session._id}, function(err, activity){
                                should.equal(session.name, activity.name);
                            });
                        }

                        for(var s in inData.sessions){
                            findActivityFor(s);
                        }
                    });
                });
            // compare DB with output
        });
    });
};
