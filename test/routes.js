'use strict';

var request = require('supertest'),
    should = require('should'),
    Q = require('q');

var sessions = require('../lib/sessions');

var idCreated,
    versionCreated, versionCreated2,
    trackingCode, trackingCode2,
    sessionId;

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

    it('should POST two initial games', function (done) {
        request.post('/api/games')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, res) {
                should.not.exist(err);
                should(res).be.an.Object();
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


    });

    it('should GET an initial game', function (done) {
        request.get('/api/games')
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                should.equal(res.body.length, 2);
                done();
            });
    });

    it('should UPDATE a specific game', function (done) {
        request.post('/api/games/' + idCreated)
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send({
                title: 'title2'
            }).end(function (err, res) {
                should.not.exist(err);
                should.equal(res.body._id, idCreated);
                should.equal(res.body.title, 'title2');
                done();
            });
    });

    it('should POST a two new game versions', function (done) {
        request.post('/api/games/' + idCreated + '/versions')
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                should(res.body).be.an.Object();
                versionCreated2 = res.body._id;
                trackingCode2 = res.body.trackingCode;
                should.not.exist(err);
                request.post('/api/games/' + idCreated + '/versions')
                    .expect(200)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        should(res.body).be.an.Object();
                        versionCreated = res.body._id;
                        trackingCode = res.body.trackingCode;
                        request.get('/api/games/' + idCreated + '/versions')
                            .expect(200)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .end(function (err, res) {
                                should.not.exist(err);
                                should.equal(res.body.length, 2);
                                done();
                            });
                    });

            });
    });

    it('should GET a specific game version', function (done) {
        request.get('/api/games/' + idCreated + '/versions/' + versionCreated)
            .expect(200)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                should(res.body).be.an.Object();
                should.equal(res.body._id, versionCreated);
                should.equal(res.body.gameId, idCreated);
                should.equal(res.body.trackingCode, trackingCode);
                request.get('/api/games/' + idCreated + '/versions/' + versionCreated2)
                    .expect(200)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        should(res.body).be.an.Object();
                        should.equal(res.body._id, versionCreated2);
                        should.equal(res.body.gameId, idCreated);
                        should.equal(res.body.trackingCode, trackingCode2);
                        done();
                    });
            });
    });

    var testCollector = function () {
        var deferred = Q.defer();

        var dataSource = require('../lib/traces');

        dataSource.add = function () {
            return true;
        };

        var statement = {
            "actor": {
                "objectType": "Agent",
                "mbox": "mailto:user@example.com",
                "name": "Project Tin Can API"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/created",
                "display": {
                    "en-US": "created"
                }
            },
            "object": {
                "id": "http://example.adlnet.gov/xapi/example/simplestatement",
                "definition": {
                    "name": {
                        "en-US": "simple statement"
                    },
                    "description": {
                        "en-US": "A simple Experience API statement. Note that the LRS does not need to have any prior information about the Actor (learner), the verb, or the Activity/object."
                    }
                }
            }
        };

        request.post('/api/collector/start/' + trackingCode)
            .expect(200)
            .expect('Content-Type', /json/)
            .set('Authorization2', 'a:')
            .end(function (err, res) {
                should(res.body).be.an.Object();
                should(res.body.authToken).be.a.String();
                should(res.body.playerName).be.a.String();

                var authToken = res.body.authToken;

                request.post('/api/collector/track')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .set('Authorization2', authToken)
                    .send([statement])
                    .end(function (err, res) {
                        should.equal(res.body, true);
                        deferred.resolve(true);
                    });
            });
        return deferred.promise;
    };

    it('should POST a new session', function (done) {
        request.post('/api/games/' + idCreated + '/versions/' + versionCreated + '/sessions')
            .expect(200)
            .set('Accept', 'application/json')
            .set('X-Gleaner-User', 'username')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                should(res.body).be.an.Object();
                should(res.body.allowAnonymous).equal(false);
                should.equal(res.body.gameId, idCreated);
                should.equal(res.body.versionId, versionCreated);
                should(res.body.created).be.a.String();
                should.not.exist(res.body.start);
                should.not.exist(res.body.end);
                sessionId = res.body._id;
                request.get('/api/games/' + idCreated + '/versions/' + versionCreated + '/sessions')
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

    var starts = 0;
    var ends = 0;

    it('should POST (start/end) a session', function (done) {
        sessions.startTasks = [];
        sessions.endTasks = [];
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

        request.post('/api/sessions/' + sessionId + '/event/start')
            .expect(200)
            .expect('Content-Type', /json/)
            .set('X-Gleaner-User', 'username')
            .end(function (err, res) {
                should.not.exist(err);
                should(res.body).be.an.Object();
                should.equal(res.body.gameId, idCreated);
                should.equal(res.body.versionId, versionCreated);
                should(res.body.start).be.a.String();
                should.equal(res.body.end, null);
                should(res.body.created).not.equal(res.body.start);
                sessionId = res.body._id;

                testCollector().then(function () {
                    request.post('/api/sessions/whatever' + versionCreated + '/event/start')
                        .expect(400)
                        .set('X-Gleaner-User', 'username')
                        .end(function (err, res) {
                            should.not.exist(err);
                            should.equal(res.text, 'Session does not exist');
                            request.post('/api/sessions/' + sessionId + '/event/end')
                                .expect(401)
                                .set('X-Gleaner-User', 'anotherInvalidUsername')
                                .end(function (err, res) {
                                    should.not.exist(err);
                                    should(res).be.an.Object();
                                    should.equal(res.text, "You don't have permission to modify this session.");
                                    done();
                                });
                        });

                });
            });


    });

    it('should PUT (add) a session', function (done) {
        request.put('/api/sessions/' + sessionId)
            .expect(401)
            .set('X-Gleaner-User', 'notAllowedUsername')
            .end(function (err, res) {
                should.not.exist(err);
                should(res).be.an.Object();
                request.put('/api/sessions/' + sessionId)
                    .expect(200)
                    .set('X-Gleaner-User', 'username')
                    .send({
                        name: 'someSessionName',
                        allowAnonymous: true,
                        teachers: ['teacher', 'anotherTeacher', 'someOtherTeacher'],
                        students: ['firstStudent']
                    })
                    .end(function (err, res) {
                        should.not.exist(err);
                        should(res).be.an.Object();
                        should.equal(res.body.name, 'someSessionName');
                        should(res.body.allowAnonymous).equal(true);
                        should(res.body.teachers).containDeep(['teacher', 'anotherTeacher']);
                        should(res.body.students).containDeep(['firstStudent']);
                        should(res.body.teachers.length).equal(4);
                        should(res.body.students.length).equal(1);
                        request.put('/api/sessions/' + sessionId)
                            .expect(200)
                            .set('X-Gleaner-User', 'username')
                            .send({
                                name: 'anotherSessionName',
                                invalidKey: 'someValue',
                                teachers: 'anotherTeacher',
                                students: 'secondStudent'
                            })
                            .end(function (err, res) {
                                should.not.exist(err);
                                should(res).be.an.Object();
                                should.not.exist(res.body.invalidKey);
                                should(res.body.allowAnonymous).equal(true);
                                should.equal(res.body.name, 'anotherSessionName');
                                should(res.body.teachers).containDeep(['teacher', 'anotherTeacher']);
                                should(res.body.students).containDeep(['firstStudent', 'secondStudent']);
                                should(res.body.teachers.length).equal(4);
                                should(res.body.students.length).equal(2);
                                done();
                            });
                    });
            });

    });

    it('should GET a session', function (done) {
        request.post('/api/games/' + idCreated + '/versions/' + versionCreated + '/sessions')
            .expect(200)
            .set('Accept', 'application/json')
            .set('X-Gleaner-User', 'username')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                var sessId = res.body._id;
                request.get('/api/sessions/' + sessId)
                    .expect(200)
                    .end(function (err, res) {
                        should.not.exist(err);
                        should(res).be.an.Object();
                        should(res.body._id).equal(sessId);
                        done();
                    });
            });

    });

    it('should PUT (remove) a session', function (done) {
        request.put('/api/sessions/' + sessionId + '/remove')
            .expect(401)
            .set('X-Gleaner-User', 'notAllowedUsername')
            .end(function (err, res) {
                should.not.exist(err);
                should(res).be.an.Object();
                request.put('/api/sessions/' + sessionId + '/remove')
                    .expect(200)
                    .set('X-Gleaner-User', 'username')
                    .send({
                        teachers: ['teacher', 'anotherTeacher'],
                        students: ['firstStudent']
                    })
                    .end(function (err, res) {
                        should.not.exist(err);
                        should(res).be.an.Object();
                        should(res.body.teachers).not.containDeep(['teacher', 'anotherTeacher']);
                        should(res.body.teachers).containDeep(['someOtherTeacher']);
                        should(res.body.students).not.containDeep(['firstStudent']);
                        should(res.body.students).containDeep(['secondStudent']);
                        should(res.body.teachers.length).equal(2);
                        should(res.body.students.length).equal(1);
                        request.put('/api/sessions/' + sessionId + '/remove')
                            .expect(200)
                            .set('X-Gleaner-User', 'username')
                            .send({
                                teachers: 'someOtherTeacher',
                                students: 'secondStudent'
                            })
                            .end(function (err, res) {
                                should.not.exist(err);
                                should(res).be.an.Object();
                                should.not.exist(res.body.invalidKey);
                                should(res.body.teachers).containDeep(['username']);
                                should(res.body.teachers.length).equal(1);
                                should(res.body.students.length).equal(0);
                                request.post('/api/sessions/' + sessionId + '/event/end')
                                    .expect(200)
                                    .set('X-Gleaner-User', 'username')
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

    it('should DELETE a session', function (done) {
        request.delete('/api/sessions/' + sessionId)
            .expect(401)
            .set('X-Gleaner-User', 'anotherInvalidUsername')
            .end(function (err, res) {
                should.not.exist(err);
                should(res).be.an.Object();
                should.equal(res.text, "You don't have permission to delete this session.");
                request.delete('/api/sessions/' + sessionId)
                    .expect(200)
                    .set('X-Gleaner-User', 'username')
                    .end(function (err, res) {
                        should.not.exist(err);
                        should(res).be.an.Object();
                        request.get('/api/sessions/' + idCreated + '/' + versionCreated)
                            .expect(200)
                            .expect('Content-Type', /json/)
                            .set('X-Gleaner-User', 'username')
                            .end(function (err, res) {
                                for (var session in res.body) {
                                    should(sessionId).not.equal(session._id);
                                }
                                done();
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
                request.get('/api/games')
                    .expect(200)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        should.not.exist(err);
                        should(idCreated).not.equal(res.body[0]._id);
                        done();
                    });
            });
    });

})
;