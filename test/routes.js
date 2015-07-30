'use strict';

var request = require('supertest'),
    should = require('should'),
    Q = require('q');

var sessions = require('../lib/sessions');

var idCreated,
    versionCreated;

describe('Games, versions and sessions tests', function () {

    before(function (done) {
        var app = require('../app');
        app.listen(app.config.port, function (err) {
            if (err) {
                done(err);
            } else {
                request = request(app);
                setTimeout(function () {
                    done();
                    /**
                     * Give it 200ms so that the connection with MongoDB is established.
                     */
                }, 200);
            }
        });
    });

    after(function (done) {
        require('../lib/db').db.dropDatabase(done);
    });

    it('should POST an initial game', function (done) {
        request.post('/api/games')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, res) {
                should.not.exist(err);
                should(res).be.an.Object();
                idCreated = res.body._id;
                done();
            });
    });

    it('should GET an initial game', function (done) {
        request.get('/api/games')
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                should.equal(res.body.length, 1);
                done();
            });
    });

    it('should UPDATE a specific game', function (done) {
        request.post('/api/games/' + idCreated)
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send({
                title: 'title'
            }).end(function (err, res) {
                should.not.exist(err);
                should.equal(res.body._id, idCreated);
                should.equal(res.body.title, 'title');
                done();
            });
    });

    it('should POST a specific game version', function (done) {
        request.post('/api/games/' + idCreated + '/versions')
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                should(res.body).be.an.Object();
                versionCreated = res.body._id;
                request.get('/api/games/' + idCreated + '/versions')
                    .expect(200)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        should.equal(res.body.length, 1);
                        done();
                    });
            });
    });

    it('should POST (start/end) a session', function (done) {
        var starts = 0;
        var ends = 0;
        sessions.startTasks.push(function () {
            starts++;
            return Q.fcall(function () {
                return true;
            });
        });

        sessions.endTasks.push(function () {
            ends = 2;
            return Q.fcall(function () {
                return true;
            });
        });

        request.post('/api/sessions?gameId=' + idCreated + '&versionId=' + versionCreated + '&event=start')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                should(res).be.an.Object();
                should.equal(res.body.gameId, idCreated);
                should.equal(res.body.versionId, versionCreated);
                request.post('/api/sessions?gameId=' + idCreated + '&versionId=' + versionCreated + '&event=start')
                    .expect(400)
                    .end(function (err, res) {
                        should.not.exist(err);
                        should.equal(res.text, 'A session for this version already exists');
                        request.post('/api/sessions?gameId=whatever&versionId=' + versionCreated + '&event=start')
                            .expect(400)
                            .end(function (err, res) {
                                should.not.exist(err);
                                should.equal(res.text, 'Game does not exist');
                                request.post('/api/sessions?gameId=' + idCreated + '&versionId=' + versionCreated + '&event=end')
                                    .expect(200)
                                    .end(function (err, res) {
                                        should.not.exist(err);
                                        should(res).be.an.Object();
                                        should.equal(starts, 1);
                                        should.equal(ends, 2);
                                        done();
                                    });
                            });
                    });
            });
    });

    it('should UPDATE a specific game version', function (done) {
        request.post('/api/games/' + idCreated + '/versions/' + versionCreated)
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send({
                name: 'test_name'
            }).end(function (err, res) {
                should.not.exist(err);
                should(res.body).be.an.Object();
                should.equal(res.body._id, versionCreated);
                should.equal(res.body.name, 'test_name');
                done();
            });
    });

    it('should DELETE a specific game', function (done) {
        request.delete('/api/games/' + idCreated)
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                should.equal(res.body, true);
                request.get('/api/games/' + idCreated + '/versions/' + versionCreated)
                    .expect(200)
                    .set('Accept', 'application/json')
                    .end(function (err, res) {
                        should.not.exist(err);
                        should.not.exist(res.body);
                        done();
                    });
            });
    });

});