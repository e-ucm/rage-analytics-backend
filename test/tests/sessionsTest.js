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
    idSession = new ObjectID('dummySessId0'),
    idClass = new ObjectID('dummyClasId0'),
    dataSession = '64756d6d7944617461496430';

module.exports = function (request, db, esClient) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Sessions API                         **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Sessions tests', function () {

        beforeEach(function (done) {
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
                            db.collection('classes').insert(
                                {
                                    _id: idClass,
                                    versionId: idVersion
                                }, function () {
                                    db.collection('sessions').insert(
                                        [{
                                            _id: idSession,
                                            gameId: idGame,
                                            versionId: idVersion,
                                            classId: idClass,
                                            name: 'name',
                                            allowAnonymous: true,
                                            teachers: ['Teacher1'],
                                            students: ['Student1']
                                        }, {
                                            _id: dataSession,
                                            gameId: idGame,
                                            versionId: idVersion,
                                            classId: idClass
                                        }], function () {
                                            db.collection('analysis').insert(
                                                {
                                                    _id: idVersion,
                                                    realtimePath: './test/resources/realtime.jar',
                                                    fluxPath: './test/resources/flux.yml',
                                                    indicesPath: './test/resources/correct_indices/indices.json',
                                                    created: new Date()
                                                }, done);
                                        });
                                });
                        });
                });
        });

        afterEach(function (done) {
            db.collection('games').drop(function () {
                db.collection('versions').drop(function () {
                    db.collection('classes').drop(function () {
                        db.collection('sessions').drop(function() {
                            db.collection('analysis').drop(done);
                        });
                    });
                });
            });
        });

        after(function (done) {
            esClient.indices.delete({index: '*'}, done);
        });

        it('should POST a new session', function (done) {
            request.post('/api/games/' + idGame + '/versions/' + idVersion + '/classes/' + idClass + '/sessions')
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.equal(res.body.allowAnonymous, false);
                    should.equal(res.body.gameId, idGame);
                    should.equal(res.body.versionId, idVersion);
                    should(res.body.created).be.String();
                    should.not.exist(res.body.start);
                    should.not.exist(res.body.end);
                    done();
                });
        });

        it('should GET sessions', function (done) {
            request.get('/api/games/' + idGame + '/versions/' + idVersion + '/classes/' + idClass + '/sessions')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 2);
                    done();
                });
        });

        it('should GET my sessions', function (done) {
            request.get('/api/games/' + idGame + '/versions/' + idVersion + '/classes/' + idClass + '/sessions/my')
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 1);
                    done();
                });
        });

        it('should GET a session', function (done) {
            request.get('/api/sessions/' + idSession)
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body._id, idSession);
                    done();
                });
        });

        it('should DELETE the session data', function (done) {
            this.timeout(10000);
            esClient.index({
                id: 1,
                index: 'trazas_' + dataSession,
                type: 'data',
                body: {
                    title: 'mydata'
                }
            }, function () {
                esClient.index({
                    id: 1,
                    index: dataSession,
                    type: 'data',
                    body: {
                        title: 'mydata'
                    }
                }, function () {
                    esClient.index({
                        id: 1,
                        index: 'tk_' + dataSession,
                        type: 'data',
                        body: {
                            title: 'mydata'
                        }
                    }, function () {
                        request.delete('/api/sessions/data/' + dataSession)
                            .expect(200)
                            .end(function (err, res) {
                                should.not.exist(err);
                                should(res).be.Object();
                                esClient.exists({
                                    index: 'trazas' + dataSession,
                                    type: 'data',
                                    id: 1
                                }, function (err, res) {
                                    should.not.exist(err);
                                    should.equal(res, false);
                                    esClient.exists({
                                        index: dataSession,
                                        type: 'data',
                                        id: 1
                                    }, function (err, res) {
                                        should.not.exist(err);
                                        should.equal(res, false);
                                        esClient.exists({
                                            index: 'tk_' + dataSession,
                                            type: 'data',
                                            id: 1
                                        }, function (err, res) {
                                            should.not.exist(err);
                                            should.equal(res, false);
                                            done();
                                        });
                                    });
                                });
                            });
                    });
                });
            });
        });

        var username = 'userDummy';
        it('should DELETE the user data from the session', function (done) {
            this.timeout(10000);
            esClient.index({
                id: 1,
                index: 'trazas_' + dataSession,
                type: 'data',
                body: {
                    title: 'mydata',
                    user: username
                }
            }, function () {
                esClient.index({
                        id: 2,
                        index: 'trazas_' + dataSession,
                        type: 'data',
                        body: {
                            title: 'mydata',
                            user: 'noUserDummy'
                        }
                    }, function () {
                        esClient.index({
                            id: 1,
                            index: dataSession,
                            type: 'data',
                            body: {
                                title: 'mydata',
                                user: username
                            }
                        }, function () {
                            esClient.index({
                                id: 2,
                                index: 'tk_' + dataSession,
                                type: 'data',
                                body: {
                                    title: 'mydata',
                                    user: 'noUserDummy'
                                }
                            }, function () {
                                request.delete('/api/sessions/data/' + dataSession + '/' + username)
                                    .expect(200)
                                    .end(function (err, res) {
                                        should.not.exist(err);
                                        should(res).be.Object();
                                        esClient.exists({
                                            index: 'trazas' + dataSession,
                                            type: 'data',
                                            id: 1
                                        }, function (err, res) {
                                            should.not.exist(err);
                                            should.equal(res, false);
                                            esClient.exists({
                                                index: 'trazas_' + dataSession,
                                                type: 'data',
                                                id: 2
                                            }, function (err, res) {
                                                should.not.exist(err);
                                                should.equal(res, true);
                                                done();
                                            });
                                        });
                                    });
                            });
                        });
                    });
            });
        });

        it('should PUT (add) a session', function (done) {
            request.put('/api/sessions/' + idSession)
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.put('/api/sessions/' + idSession)
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .send({
                            name: 'someSessionName',
                            allowAnonymous: true,
                            teachers: ['Teacher1', 'Teacher2'],
                            students: ['Student2']
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.name, 'someSessionName');
                            should.equal(res.body.allowAnonymous, true);
                            should(res.body.teachers).containDeep(['Teacher1', 'Teacher2']);
                            should(res.body.students).containDeep(['Student1', 'Student2']);
                            done();
                        });
                });
        });

        it('should PUT (remove) a session', function (done) {
            request.put('/api/sessions/' + idSession + '/remove')
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.put('/api/sessions/' + idSession + '/remove')
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .send({
                            teachers: ['Teacher2'],
                            students: ['Student1']
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.an.Object();
                            should(res.body.students).not.containDeep(['Student1']);
                            should(res.body.teachers).containDeep(['Teacher1']);
                            should.equal(res.body.teachers.length, 1);
                            should.equal(res.body.students.length, 0);
                            done();
                        });
                });
        });
    });
};
