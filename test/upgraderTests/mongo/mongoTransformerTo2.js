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

function CompletionChecker(max, callback){
    this.ncom = 0;
    this.tocom = max;
    this.Completed = function(){
        this.ncom++
        if(this.ncom >= this.tocom){
            callback();
        }
    }
}

var collectionComparer = function(db, name, data, callback, ignoredFields){
    db.collection(name).find({}, function(err,result){
        result.count().then(function(size){
            var checker = new CompletionChecker(size,callback);
            result.forEach(function(o1){
                if(o1 == null)
                    return;

                var found = false;
                for(var o2 of data[name]){
                    if(o1._id.toString() === o2._id.toString()){
                        found = true;
                        should(compareDocuments(o1,o2, ignoredFields)).equal(true);
                    }
                }
                should(found).equal(true);
                checker.Completed();
            });
        });
    });
}

function compareDocuments(doc1, doc2, ignoredFields){
    if(ignoredFields === undefined || ignoredFields === null)
        ignoredFields = [];

    var equal = true;
    if(doc1 === undefined && doc2 === undefined || doc1 === null &&  doc2 === null){
        return true;
    }
    if(!doc1 || !doc2){
        console.log("ERROR COMPARING VALUES (SOME VALUE IS NOT VALID): ", doc1, " AND ", doc2);
        return false;
    }
    Object.keys(doc1).forEach(function(key) {
        if(ignoredFields.includes(key)){
            equal = true;
            return;
        }

        var val = doc1[key];
        if(typeof(val) !== typeof({})){
            if(val !== doc2[key]){
                console.log("ERROR COMPARING VALUES: ", val, " (",typeof(val),") AND ", doc2[key]," (",typeof(val),")");
                equal = false;
            }
            if(typeof(val) !== typeof(doc2[key])){
                console.log("ERROR COMPARING TYPES: ", val, " AND ", doc2[key])
                equal = false;
            }
        } else {
            equal = compareDocuments(val, doc2[key], ignoredFields);
        }
    });
    return equal;
}

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

                    var checker = new CompletionChecker(0,done);

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
            // compare DB with output
        });

        it('should Games collection be equal to exampleTo2OUT games array', function (done) {
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
                collectionComparer(db, 'games', outData, done);
            });
        });

        it('should versions collection be equal to exampleTo2OUT versions array', function (done) {
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

                collectionComparer(db, 'versions', outData, done);
            });
        });

        it('should classes collection be equal to exampleTo2OUT classes array ignoring _id', function (done) {
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

                db.collection('classes').find({}, function(err,classes){
                    classes.count().then(function(size){
                        var checker = new CompletionChecker(size,done);
                        classes.forEach(function(o1){
                            if(o1 == null)
                                return;

                            var found = false;
                            for(var o2 of outData.classes){
                                if(o1.name.toString() === o2.name.toString()){
                                    found = true;
                                    should(compareDocuments(o1,o2, ["_id"])).equal(true);
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

                collectionComparer(db, 'sessions', outData, done, ['classId']);
            });
        });
    });
};
