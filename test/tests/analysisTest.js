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
    ObjectID = require('mongodb').ObjectId,
    AdmZip = require('adm-zip'),
    fs = require('fs');

var idGame = new ObjectID('dummyGameId0'),
    idVersion = new ObjectID('dummyVersId0'),
    idAnalysis = idVersion;

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Analysis API                         **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Analysis tests', function () {

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
                            done();
                        });
                });
        });

        afterEach(function (done) {
            db.collection('games').drop(function () {
                db.collection('versions').drop(function () {
                    done();
                });
            });
        });

        after(function (done) {
            db.collection('analysis').drop(done);
        });

        it('should not POST a new analysis when the uploaded file is not a zip', function (done) {

            request.post('/api/analysis/' + idVersion)
                .expect(400)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .attach('analysis', './test/resources/flux.yml')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    done(err);
                });
        });


        it('should not POST an empty zip file', function (done) {
            // Creating archives
            var zip = new AdmZip();

            // Or write everything to disk
            var zipPath = './realtime.zip';
            zip.writeZip(zipPath);
            request.post('/api/analysis/' + idVersion)
                .expect(400)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .attach('analysis', zipPath)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    fs.unlink(zipPath, function (err) {
                        done(err);
                    });
                });
        });


        it('should not POST an empty zip file with a missing realtime.jar',
            function (done) {
                // Creating archives
                var zip = new AdmZip();

                zip.addFile('flux.yml', fs.readFileSync('./test/resources/flux.yml'), '',
                    parseInt('0644', 8) << 16);

                // Or write everything to disk
                var zipPath = './realtime.zip';
                zip.writeZip(zipPath);
                request.post('/api/analysis/' + idVersion)
                    .expect(400)
                    .set('Accept', 'application/json')
                    .set('X-Gleaner-User', 'username')
                    .attach('analysis', zipPath)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        fs.unlink(zipPath, function (err) {
                            done(err);
                        });
                    });
            });

        it('should not POST an empty zip file with a missing flux.yml',
            function (done) {
                // Creating archives
                var zip = new AdmZip();

                zip.addFile('realtime.jar', fs.readFileSync('./test/resources/realtime.jar'), '',
                    parseInt('0644', 8) << 16);

                // Or write everything to disk
                var zipPath = './realtime.zip';
                zip.writeZip(zipPath);
                request.post('/api/analysis/' + idVersion)
                    .expect(400)
                    .set('Accept', 'application/json')
                    .set('X-Gleaner-User', 'username')
                    .attach('analysis', zipPath)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        fs.unlink(zipPath, function (err) {
                            done(err);
                        });
                    });
            });

        it('should not POST an empty zip file with a missing indices.json',
            function (done) {
                // Creating archives
                var zip = new AdmZip();

                zip.addFile('flux.yml', fs.readFileSync('./test/resources/flux.yml'), '',
                    parseInt('0644', 8) << 16);
                zip.addFile('realtime.jar', fs.readFileSync('./test/resources/realtime.jar'), '',
                    parseInt('0644', 8) << 16);

                // Or write everything to disk
                var zipPath = './realtime.zip';
                zip.writeZip(zipPath);
                request.post('/api/analysis/' + idVersion)
                    .expect(400)
                    .set('Accept', 'application/json')
                    .set('X-Gleaner-User', 'username')
                    .attach('analysis', zipPath)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        fs.unlink(zipPath, function (err) {
                            done(err);
                        });
                    });
            });

        it('should not POST an analysis with indices.json without key field',
            function (done) {
                // Creating archives
                var zip = new AdmZip();

                zip.addFile('flux.yml', fs.readFileSync('./test/resources/flux.yml'), '',
                    parseInt('0644', 8) << 16);
                zip.addFile('realtime.jar', fs.readFileSync('./test/resources/realtime.jar'), '',
                    parseInt('0644', 8) << 16);
                zip.addFile('indices.json', fs.readFileSync('./test/resources/no_key_indices/indices.json'), '',
                    parseInt('0644', 8) << 16);

                // Or write everything to disk
                var zipPath = './realtime.zip';
                zip.writeZip(zipPath);
                request.post('/api/analysis/' + idVersion)
                    .expect(400)
                    .set('Accept', 'application/json')
                    .set('X-Gleaner-User', 'username')
                    .attach('analysis', zipPath)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        fs.unlink(zipPath, function (err) {
                            done(err);
                        });
                    });
            });

        it('should not POST an analysis if there are not necessary files',
            function (done) {
                // Creating archives
                var zip = new AdmZip();

                zip.addFile('flux.yml', fs.readFileSync('./test/resources/flux.yml'), '',
                    parseInt('0644', 8) << 16);
                zip.addFile('realtime.jar', fs.readFileSync('./test/resources/realtime.jar'), '',
                    parseInt('0644', 8) << 16);
                zip.addFile('indices.json', fs.readFileSync('./test/resources/no_key_indices/indices.json'), '',
                    parseInt('0644', 8) << 16);
                zip.addFile('extra_file', fs.readFileSync('./test/resources/extra_file'), '',
                    parseInt('0644', 8) << 16);

                // Or write everything to disk
                var zipPath = './realtime.zip';
                zip.writeZip(zipPath);
                request.post('/api/analysis/' + idVersion)
                    .expect(400)
                    .set('Accept', 'application/json')
                    .set('X-Gleaner-User', 'username')
                    .attach('analysis', zipPath)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        fs.unlink(zipPath, function (err) {
                            done(err);
                        });
                    });
            });

        it('should not POST an analysis with indices.json that contains indices without the key ',
            function (done) {
                // Creating archives
                var zip = new AdmZip();

                zip.addFile('flux.yml', fs.readFileSync('./test/resources/flux.yml'), '',
                    parseInt('0644', 8) << 16);
                zip.addFile('realtime.jar', fs.readFileSync('./test/resources/realtime.jar'), '',
                    parseInt('0644', 8) << 16);
                zip.addFile('indices.json', fs.readFileSync('./test/resources/bad_indices/indices.json'), '',
                    parseInt('0644', 8) << 16);

                // Or write everything to disk
                var zipPath = './realtime.zip';
                zip.writeZip(zipPath);
                request.post('/api/analysis/' + idVersion)
                    .expect(400)
                    .set('Accept', 'application/json')
                    .set('X-Gleaner-User', 'username')
                    .attach('analysis', zipPath)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        fs.unlink(zipPath, function (err) {
                            done(err);
                        });
                    });
            });

        it('should POST a new analysis', function (done) {
            // Creating archives
            var zip = new AdmZip();

            // Add file directly

            zip.addFile('flux.yml', fs.readFileSync('./test/resources/flux.yml'), '',
                parseInt('0644', 8) << 16);
            zip.addFile('realtime.jar', fs.readFileSync('./test/resources/realtime.jar'), '',
                parseInt('0644', 8) << 16);
            zip.addFile('indices.json', fs.readFileSync('./test/resources/correct_indices/indices.json'), '',
                parseInt('0644', 8) << 16);

            // Or write everything to disk
            var zipPath = './realtime.zip';
            zip.writeZip(zipPath);
            request.post('/api/analysis/' + idVersion)
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .attach('analysis', zipPath)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should(res.body.created).be.String();
                    should(res.body.realtimePath).be.String();
                    should(res.body.fluxPath).be.String();
                    should(res.body.indicesPath).be.String();
                    fs.unlink(zipPath, function (err) {
                        done(err);
                    });
                });
        });

        it('should GET an analysis', function (done) {
            request.get('/api/analysis/' + idVersion)
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body._id, idAnalysis);
                    done();
                });
        });

        it('should DELETE an analysis', function (done) {
            request.del('/api/analysis/' + idVersion)
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.message, 'Success.');
                    done();
                });
        });
    });
};
