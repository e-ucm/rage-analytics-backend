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
    versionTrackingCode = idVersion + Math.random().toString(36).substr(2),
    idActivity = new ObjectID('dummySessId0'),
    activityTrackingCode = idActivity + Math.random().toString(36).substr(2),
    idClass = new ObjectID('dummyClasId0');

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Attempts API                         **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Attempts tests', function () {

        beforeEach(function (done) {
            db.collection('games').insert(
                {
                    _id: idGame,
                    title: 'Dummy'
                }, function () {
                    db.collection('versions').insert(
                        {
                            _id: idVersion,
                            gameId: idGame,
                            trackingCode: versionTrackingCode
                        }, function () {
                            db.collection('classes').insert(
                                {
                                    _id: idClass,
                                    participants: {
                                        teachers: ['Teacher1'],
                                        assistants: ['Assistant1'],
                                        students: ['Student1']
                                    }
                                }, function () {
                                    db.collection('activities').insert(
                                        [{
                                            _id: idActivity,
                                            trackingCode: activityTrackingCode,
                                            gameId: idGame,
                                            versionId: idVersion,
                                            classId: idClass,
                                            name: 'name',
                                            allowAnonymous: true,
                                            groups: [],
                                            groupings: []
                                        }, {
                                            gameId: idGame,
                                            versionId: idVersion,
                                            classId: idClass
                                        }], done);
                                });
                        });
                });
        });

        afterEach(function (done) {
            db.collection('games').drop(function () {
                db.collection('versions').drop(function () {
                    db.collection('classes').drop(function () {
                        db.collection('activities').drop(function () {
                            db.collection('authtokens').drop(function () {
                                db.collection('gameplays_' + idActivity).drop(done);
                            });
                        });
                    });
                });
            });
        });

        it('should POST (start) a new anonymous attempt', function (done) {
            request.post('/api/collector/start/' + activityTrackingCode)
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.exist(res.body.authToken);
                    var authToken = res.body.authToken;
                    should.exist(res.body.actor);
                    should.exist(res.body.playerId);
                    should.exist(res.body.objectId);
                    should.equal(res.body.session, 1);
                    should.equal(res.body.firstSessionStarted, res.body.currentSessionStarted);

                    request.get('/api/activities/' + idActivity + '/attempts')
                        .set('X-Gleaner-User', 'Teacher1')
                        .expect(200)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res.body).be.Array();
                            should.equal(res.body.length, 1);
                            should.equal(res.body[0].playerType, 'anonymous');
                            should.equal(res.body[0].attempts.length, 1);
                            should.equal(res.body[0].attempts[0].authToken, authToken);
                            should.not.exist(res.body[0].attempts[0].end);
                            done();
                        });
                });
        });

        it('should POST (start) a new user attempt', function (done) {
            request.post('/api/collector/start/' + activityTrackingCode)
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.exist(res.body.authToken);
                    var authToken = res.body.authToken;
                    should.exist(res.body.actor);
                    should.exist(res.body.playerId);
                    should.exist(res.body.objectId);
                    should.equal(res.body.session, 1);
                    should.equal(res.body.firstSessionStarted, res.body.currentSessionStarted);

                    request.get('/api/activities/' + idActivity + '/attempts')
                        .set('X-Gleaner-User', 'Teacher1')
                        .expect(200)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res.body).be.Array();
                            should.equal(res.body.length, 1);
                            should.equal(res.body[0].playerType, 'identified');
                            should.equal(res.body[0].attempts.length, 1);
                            should.equal(res.body[0].attempts[0].authToken, authToken);
                            should.not.exist(res.body[0].attempts[0].end);
                            done();
                        });
                });
        });

        it('should POST (end) an attempt', function (done) {
            request.post('/api/collector/start/' + activityTrackingCode)
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.exist(res.body.authToken);
                    var authToken = res.body.authToken;
                    should.exist(res.body.actor);
                    should.exist(res.body.playerId);
                    should.exist(res.body.objectId);
                    should.equal(res.body.session, 1);
                    should.equal(res.body.firstSessionStarted, res.body.currentSessionStarted);

                    request.post('/api/collector/end')
                        .expect(200)
                        .set('Authorization', authToken)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);

                            request.get('/api/activities/' + idActivity + '/attempts')
                                .set('X-Gleaner-User', 'Teacher1')
                                .expect(200)
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .end(function (err, res) {
                                    should.not.exist(err);
                                    should(res.body).be.Array();
                                    should.equal(res.body.length, 1);
                                    should.equal(res.body[0].playerType, 'anonymous');
                                    should.equal(res.body[0].attempts.length, 1);
                                    should.equal(res.body[0].attempts[0].authToken, authToken);
                                    should.exist(res.body[0].attempts[0].end);
                                    // TODO should(res.body[0].attempts[0].end).be.Date();
                                    done();
                                });
                        });
                });
        });

        it('should GET attempts', function (done) {
            request.post('/api/collector/start/' + activityTrackingCode)
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    request.get('/api/activities/' + idActivity + '/attempts')
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res.body).be.Array();
                            should(res.body.length).be.greaterThanOrEqual(1);
                            should(res.body[0].attempts.length).be.greaterThanOrEqual(1);
                            done();
                        });
                });
        });

        it('should GET my attempts', function (done) {
            request.post('/api/collector/start/' + activityTrackingCode)
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'Student1')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    request.get('/api/activities/' + idActivity + '/attempts/my')
                        .expect(200)
                        .set('Accept', 'application/json')
                        .set('X-Gleaner-User', 'Student1')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res.body).be.Object();
                            should(res.body.attempts.length).be.greaterThanOrEqual(1);
                            done();
                        });
                });
        });

        it('should GET any user attempts', function (done) {
            request.post('/api/collector/start/' + activityTrackingCode)
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    request.get('/api/activities/' + idActivity + '/attempts/username')
                        .expect(200)
                        .set('Accept', 'application/json')
                        .set('X-Gleaner-User', 'Teacher1')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res.body).be.Object();
                            should(res.body.attempts.length).be.greaterThanOrEqual(1);
                            done();
                        });
                });
        });
    });
};
