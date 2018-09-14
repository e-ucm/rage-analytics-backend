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
    idClass = new ObjectID('dummyClasId0'),
    idGroup = new ObjectID('dummyGrouId0'),
    idGrouping = new ObjectID('dummyGrogId0');

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Sessions API                         **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Activities tests', function () {

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
                                                            name: 'name',
                                                            groups: [],
                                                            groupings: [],
                                                            allowAnonymous: true
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

        afterEach(function (done) {
            db.collection('games').drop(function () {
                db.collection('versions').drop(function () {
                    db.collection('classes').drop(function () {
                        db.collection('activities').drop(done);
                    });
                });
            });
        });

        it('should POST a new activity', function (done) {
            request.post('/api/activities')
                .expect(401)
                .send({
                    gameId: idGame,
                    versionId: idVersion,
                    classId: idClass,
                    offline: false
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    request.post('/api/activities')
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .send({
                            gameId: idGame,
                            versionId: idVersion,
                            classId: idClass,
                            offline: false
                        })
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res.body).be.Object();
                            should.equal(res.body.allowAnonymous, false);
                            should.equal(res.body.gameId, idGame);
                            should.equal(res.body.versionId, idVersion);
                            should.equal(res.body.classId, idClass);
                            should(res.body.created).be.String();
                            should.not.exist(res.body.start);
                            should.not.exist(res.body.end);
                            done();
                        });
                });
        });

        it('should GET activities', function (done) {
            request.get('/api/activities')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 2);
                    done();
                });
        });

        it('should GET class activities', function (done) {
            request.get('/api/classes/' + idClass + '/activities')
                .expect(401)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.get('/api/classes/' + idClass + '/activities')
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.length, 2);
                            done();
                        });
                });
        });

        it('should GET game activities', function (done) {
            request.get('/api/games/' + idGame + '/versions/' + idVersion + '/activities')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 2);
                    done();
                });
        });

        it('should GET my activities', function (done) {
            request.get('/api/activities/my')
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 1);
                    should.equal(res.body[0]._id, idActivity);
                    done();
                });
        });

        it('should GET my class activities', function (done) {
            request.get('/api/classes/' + idClass + '/activities/my')
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 1);
                    should.equal(res.body[0]._id, idActivity);
                    done();
                });
        });

        it('should GET my game activities', function (done) {
            request.get('/api/games/' + idGame + '/versions/' + idVersion + '/activities/my')
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 1);
                    should.equal(res.body[0]._id, idActivity);
                    done();
                });
        });

        it('should GET an activity', function (done) {
            request.get('/api/activities/' + idActivity)
                .expect(401)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.get('/api/activities/' + idActivity)
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body._id, idActivity);
                            done();
                        });
                });
        });

        it('should PUT (add) an activity', function (done) {
            request.put('/api/activities/' + idActivity)
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.put('/api/activities/' + idActivity)
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .send({
                            name: 'someSessionName',
                            allowAnonymous: true,
                            groups: [idGroup],
                            groupings: [idGrouping]
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.name, 'someSessionName');
                            should.equal(res.body.allowAnonymous, true);
                            should(res.body.groups).containDeep([idGroup.toString()]);
                            should(res.body.groupings).containDeep([idGrouping.toString()]);
                            done();
                        });
                });
        });

        it('should PUT (remove) an activity', function (done) {
            request.put('/api/activities/' + idActivity + '/remove')
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();

                    request.put('/api/activities/' + idActivity)
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .send({
                            name: 'someSessionName',
                            allowAnonymous: true,
                            groups: [idGroup],
                            groupings: [idGrouping]
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.name, 'someSessionName');
                            should.equal(res.body.allowAnonymous, true);
                            should(res.body.groups).containDeep([idGroup.toString()]);
                            should(res.body.groupings).containDeep([idGrouping.toString()]);
                            request.put('/api/activities/' + idActivity + '/remove')
                                .expect(200)
                                .set('X-Gleaner-User', 'Teacher1')
                                .send({
                                    groups: [idGroup],
                                    groupings: [idGrouping]
                                })
                                .end(function (err, res) {
                                    should.not.exist(err);
                                    should(res).be.an.Object();
                                    should(res.body.groups).not.containDeep([idGroup.toString()]);
                                    should(res.body.groupings).not.containDeep([idGrouping.toString()]);
                                    should.equal(res.body.groups.length, 0);
                                    should.equal(res.body.groupings.length, 0);
                                    done();
                                });
                        });
                });
        });

        it('should DELETE an activity', function (done) {
            request.delete('/api/activities/' + idActivity)
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    done();
                });
        });
    });
};
