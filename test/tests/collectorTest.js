'use strict';

var should = require('should'),
    ObjectID = require('mongodb').ObjectId,
    Q = require('q'),
    sessions = require('../../lib/sessions');

var idGame = new ObjectID('dummyGameId0'),
    idVersion = new ObjectID('dummyVersId0'),
    idSession = new ObjectID('dummySessId0'),
    trackingCode = '123';

module.exports = function(request, db, config) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Tracker                              **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Collector tests', function () {

        before(function (done) {
            db.collection('games').insert(
                {
                    _id: idGame,
                    title: 'Dummy',
                    public: true
                }, function () {
                    db.collection('versions').insert(
                        {
                            _id: idVersion,
                            gameId: idGame,
                            trackingCode: trackingCode
                        }, function () {
                            db.collection('sessions').insert(
                                {
                                    _id: idSession,
                                    gameId: idGame,
                                    versionId: idVersion,
                                    name: 'name',
                                    allowAnonymous: true,
                                    teachers: ['Teacher1'],
                                    students: ['Student1']
                                }, done);
                        });
                });
        });

        after(function (done) {
            db.collection('games').drop(function () {
                db.collection('versions').drop(function () {
                    db.collection('sessions').drop(function() {
                        db.db.dropDatabase(done);
                    });
                });
            });
        });

        var starts = 0;
        var ends = 0;


        it('Testing session start', function (done) {
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
            request.post('/api/sessions/' + idSession + '/event/start')
                .expect(200)
                .expect('Content-Type', /json/)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.equal(res.body.gameId, idGame);
                    should.equal(res.body.versionId, idVersion);
                    should(res.body.start).be.String();
                    should.equal(res.body.end, null);
                    done();
                });
        });

        var authToken;
        var statement = {
            actor: {
                objectType: 'Agent',
                mbox: 'mailto:user@example.com',
                name: 'Project Tin Can API'
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/created',
                display: {
                    'en-US': 'created'
                }
            },
            object: {
                id: 'http://example.adlnet.gov/xapi/example/simplestatement',
                definition: {
                    name: {
                        'en-US': 'simple statement'
                    },
                    description: {
                        'en-US': 'A simple Experience API statement. Note that the LRS does not need to have any prior ' +
                        'information about the Actor (learner), the verb, or the Activity/object.'
                    }
                }
            }
        };

        it('Testing the start collector', function (done) {
            request.post('/api/collector/start/' + trackingCode)
                .expect(200)
                .expect('Content-Type', /json/)
                .set('Authorization', 'a:')
                .end(function (err, res) {
                    should(res.body).be.Object();
                    should(res.body.authToken).be.String();
                    should(res.body.objectId).be.String();
                    should.equal(res.body.objectId.indexOf('http'), 0);
                    should(res.body.actor).be.Object();
                    should(res.body.actor.name).be.String();
                    should(res.body.actor.account).be.Object();
                    should.equal(res.body.actor.account.name, 'Anonymous');
                    should.equal(res.body.actor.account.homePage, config.a2.a2HomePage);
                    authToken = res.body.authToken;
                    done();
                });
        });

        it('Testing collector track', function (done) {
            var dataSource = require('../../lib/traces');

            dataSource.clearConsumers();
            dataSource.addConsumer({
                addTraces: function (playerId, versionId, gameplayId, data) {
                    for (var i = 0; i < data.length; ++i) {
                        var extensions = data[i].object.definition.extensions;
                        should.equal(extensions.gameplayId, gameplayId);
                        should.equal(extensions.versionId, versionId);
                    }
                }
            });
            request.post('/api/collector/track')
                .expect(200)
                .expect('Content-Type', /json/)
                .set('Authorization', authToken)
                .send([statement])
                .end(function (err, res) {
                    should.equal(res.body, true);
                    done();
                });
        });

        it('Testing the end collector', function (done) {
            request.post('/api/sessions/' + idSession + '/event/end')
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    done();
                });
        });
    });
};
