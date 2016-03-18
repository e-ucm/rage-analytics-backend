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
    idVersion = new ObjectID('dummyVersId0');

module.exports = function(request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Versions API                         **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Versions tests', function () {

        beforeEach(function (done) {
            db.collection('games').insert(
                {
                    _id: idGame,
                    title: 'Dummy'
                }, function () {
                    db.collection('versions').insert(
                        [{
                            _id: idVersion,
                            gameId: idGame
                        }, {
                            gameId: idGame
                        }], done);
                });
        });

        afterEach(function (done) {
            db.collection('games').drop(function () {
                db.collection('versions').drop(done);
            });
        });

        it('should POST a new game version', function (done) {
            request.post('/api/games/' + idGame + '/versions')
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    done();
                });
        });

        it('should GET the game versions', function (done) {
            request.get('/api/games/' + idGame + '/versions')
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.equal(res.body.length, 2);
                    done();
                });
        });

        it('should GET a specific game version', function (done) {
            request.get('/api/games/' + idGame + '/versions/' + idVersion)
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.equal(res.body._id, idVersion);
                    should.equal(res.body.gameId, idGame);
                    done();
                });
        });

        it('should UPDATE a specific game version', function (done) {
            request.post('/api/games/' + idGame + '/versions/' + idVersion)
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .send({
                    name: 'test_name'
                }).end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.equal(res.body._id, idVersion);
                    should.equal(res.body.name, 'test_name');
                    done();
                });
        });
    });
};

