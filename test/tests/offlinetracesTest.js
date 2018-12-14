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

var should = require('should'),
    ObjectID = require('mongodb').ObjectId;


var idGame = new ObjectID('dummyGameId0'),
    idVersion = new ObjectID('dummyVersId0'),
    idActivity = new ObjectID('dummySessId0'),
    idActivityOffline = new ObjectID('dummySessId4'),
    idActivityNotFound = new ObjectID('dummySessId2'),
    idActivityNotFound2 = new ObjectID('dummySessId9'),
    idClass = new ObjectID('dummyClasId0'),
    idGroup = new ObjectID('dummyGrouId0'),
    idGrouping = new ObjectID('dummyGrogId0');

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Offlinetraces API                    **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Offlinetraces tests', function () {

        before(function (done) {
            db.collection('games').insert(
                {
                    _id: idGame,
                    title: 'Dummy'
                }, function () {
                    db.collection('versions').insert(
                        {
                            _id: idVersion,
                            gameId: idGame
                        }, function () {
                            db.collection('groups').insert(
                                {
                                    _id: idGroup,
                                    participants: {
                                        teachers: ['Teacher1'],
                                        assistants: ['Assistant1'],
                                        students: ['Student1']
                                    }
                                }, function () {
                                    db.collection('groupings').insert(
                                        {
                                            _id: idGrouping,
                                            groups: [idGroup]
                                        }, function () {
                                            db.collection('classes').insert(
                                                {
                                                    _id: idClass,
                                                    groups: [],
                                                    groupings: [],
                                                    participants: {
                                                        teachers: ['Teacher1'],
                                                        assistants: ['Assistant1'],
                                                        students: ['Student1']
                                                    }
                                                }, function () {
                                                    db.collection('activities').insert(
                                                        [{
                                                            _id: idActivity,
                                                            gameId: idGame,
                                                            versionId: idVersion,
                                                            classId: idClass,
                                                            name: 'name online',
                                                            groups: [],
                                                            groupings: [],
                                                            allowAnonymous: true,
                                                            trackingCode: '1'
                                                        }, {
                                                            gameId: idGame,
                                                            versionId: idVersion,
                                                            classId: idClass
                                                        }], function () {
                                                            db.collection('activities').insert(
                                                                [{
                                                                    _id: idActivityOffline,
                                                                    gameId: idGame,
                                                                    versionId: idVersion,
                                                                    classId: idClass,
                                                                    name: 'name act offline',
                                                                    groups: [],
                                                                    groupings: [],
                                                                    allowAnonymous: true,
                                                                    offline: true,
                                                                    trackingCode: '2'
                                                                }, {
                                                                    gameId: idGame,
                                                                    versionId: idVersion,
                                                                    classId: idClass
                                                                }], done);
                                                        });

                                                });
                                        });
                                });
                        });
                });
        });

        after(function (done) {

            db.collection('games').drop(function () {
                db.collection('versions').drop(function () {
                    db.collection('classes').drop(function () {
                        db.collection('activities').drop(function () {
                            db.collection('offlinetraces').drop(done);
                        });
                    });
                });
            });
        });

        it('should correctly process Kahoot results.xlsx file', function (done) {

            var offlinetraces = require('../../lib/offlinetraces')();
            var csvToXapi = require('../../lib/csvToXAPI');

            var csvtraces = offlinetraces.kahootToCSV('./test/resources/kahootresults.xlsx');

            should.not.exist(csvtraces.error);
            for (var i = 0; i < csvtraces.length; ++i) {
                var trace = csvtraces[i];
                var resp = csvToXapi(trace);

                should.not.exist(resp.error);
                should(resp.statement).be.an.Object();
            }
            done();
        });

        it('should not POST a new analysis when the activity does not exist', function (done) {

            request.post('/api/offlinetraces/' + idActivityNotFound)
                .expect(400)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                // .attach('analysis', './test/resources/flux.yml')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    request.post('/api/offlinetraces/' + idActivityNotFound2 + '/kahoot')
                        .expect(400)
                        .set('Accept', 'application/json')
                        .set('X-Gleaner-User', 'username')
                        // .attach('analysis', './test/resources/flux.yml')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            done(err);
                        });
                });
        });


        it('should not POST a new analysis when the activity is not of type offline', function (done) {

            request.post('/api/offlinetraces/' + idActivity)
                .expect(400)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                // .attach('analysis', './test/resources/flux.yml')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    request.post('/api/offlinetraces/' + idActivity + '/kahoot')
                        .expect(400)
                        .set('Accept', 'application/json')
                        .set('X-Gleaner-User', 'username')
                        // .attach('analysis', './test/resources/flux.yml')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            done(err);
                        });
                });
        });

        it('should POST a new offlinetraces object', function (done) {

            request.post('/api/offlinetraces/' + idActivityOffline)
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .attach('offlinetraces', './test/resources/offlinetraces.csv')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.post('/api/offlinetraces/' + idActivityOffline  + '/kahoot')
                        .expect(200)
                        .set('Accept', 'application/json')
                        .set('X-Gleaner-User', 'username')
                        .attach('offlinetraceskahoot', './test/resources/results.xlsx')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            done();
                        });
                });
        });

        it('should GET offlinetraces', function (done) {
            request.get('/api/offlinetraces/' + idActivityOffline)
                .expect(200)
                .set('X-Gleaner-User', 'username')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 1);
                    should.equal(res.body[0].activityId, idActivityOffline.toString());
                    should.equal(res.body[0].name, 'offlinetraces.csv');
                    request.get('/api/offlinetraces/' + idActivityOffline + '/kahoot')
                        .expect(200)
                        .set('X-Gleaner-User', 'username')
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.length, 1);
                            should.equal(res.body[0].activityId, idActivityOffline.toString());
                            should.equal(res.body[0].name, 'results.xlsx');
                            done();
                        });
                });
        });

    });
};
