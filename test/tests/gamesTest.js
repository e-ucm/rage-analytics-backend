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

var idGame = new ObjectID('dummyGameId0');

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                     Test Games API                          **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Games tests', function () {
        beforeEach(function (done) {
            db.collection('games').insert(
                [{
                    title: 'Dummy2',
                    public: true
                },
                    {
                        _id: idGame,
                        title: 'Dummy',
                        authors: ['DummyUsername'],
                        developers: ['DummyUsername']
                    }], done);
        });
        afterEach(function (done) {
            db.collection('games').drop(done);
        });

        it('should POST games', function (done) {
            request.post('/api/games')
                .expect(200)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    done();
                });
        });

        it('should UPDATE a specific game', function (done) {
            request.put('/api/games/' + idGame)
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'DummyUsername')
                .expect('Content-Type', /json/)
                .send({
                    title: 'title2',
                    public: true
                }).end(function (err, res) {
                    should.not.exist(err);
                    should.equal(res.body._id, idGame);
                    should.equal(res.body.title, 'title2');
                    should.equal(res.body.public, true);
                    done();
                });
        });


        it('should UPDATE the author of a specific game', function (done) {
            request.put('/api/games/' + idGame)
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'DummyUsername')
                .expect('Content-Type', /json/)
                .send({
                    title: 'title3',
                    developers: 'username2'
                }).end(function (err, res) {

                    should.not.exist(err);
                    should(res.body.authors).containDeep(['DummyUsername']);
                    should(res.body.developers).containDeep(['username2', 'DummyUsername']);
                    should.equal(res.body.title, 'title3');

                    request.put('/api/games/' + idGame)
                        .expect(200)
                        .set('Accept', 'application/json')
                        .set('X-Gleaner-User', 'DummyUsername')
                        .expect('Content-Type', /json/)
                        .send({
                            title: 'title4',
                            developers: ['username6', 'username7']
                        }).end(function (err, res) {
                            should.not.exist(err);
                            should(res.body.authors).containDeep(['DummyUsername']);
                            should(res.body.developers)
                                .containDeep(['username2', 'DummyUsername',
                                    'username6', 'username7']);
                            should.equal(res.body.title, 'title4');

                            request.put('/api/games/' + idGame + '/remove')
                                .expect(200)
                                .set('Accept', 'application/json')
                                .set('X-Gleaner-User', 'username7')
                                .expect('Content-Type', /json/)
                                .send({
                                    developers: ['username2', 'username7']
                                }).end(function (err, res) {
                                    request.put('/api/games/' + idGame + '/remove')
                                        .expect(200)
                                        .set('Accept', 'application/json')
                                        .set('X-Gleaner-User', 'DummyUsername')
                                        .expect('Content-Type', /json/)
                                        .send({
                                            developers: ['username2', 'username7']
                                        }).end(function (err, res) {
                                            should.not.exist(err);
                                            should(res.body.authors).containDeep(['DummyUsername']);
                                            (res.body.developers).should.not
                                                .containDeep(['username2', 'username7']);
                                            should.equal(res.body.title, 'title4');

                                            request.get('/api/games/my')
                                                .expect(200)
                                                .set('X-Gleaner-User', 'username6')
                                                .set('Accept', 'application/json')
                                                .expect('Content-Type', /json/)
                                                .end(function (err, res) {
                                                    should.not.exist(err);
                                                    should.equal(res.body.length, 1);
                                                    done();
                                                });
                                        });
                                });
                        });
                });
        });

        it('should GET a public game', function (done) {
            request.get('/api/games/public')
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.equal(res.body.length, 1);
                    done();
                });
        });

        it('should GET my games', function (done) {
            request.get('/api/games/my')
                .expect(200)
                .set('X-Gleaner-User', 'DummyUsername')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.equal(res.body.length, 1);
                    done();
                });
        });

        it('should DELETE a game', function (done) {
            request.delete('/api/games/' + idGame)
                .expect(200)
                .set('X-Gleaner-User', 'DummyUsername')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);

                    request.get('/api/games/my')
                        .expect(200)
                        .set('X-Gleaner-User', 'DummyUsername')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should.equal(res.body.length, 0);
                            done();
                        });
                });
        });

    });
};
