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
    Q = require('q'),
    sessions = require('../../lib/sessions');

var idGame = new ObjectID('dummyGameId0'),
    idVersion = new ObjectID('dummyVersId0'),
    idSession = new ObjectID('dummySessId0'),
    trackingCode = '123';

module.exports = function (request, db, config) {

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
                    db.collection('sessions').drop(function () {
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
        var playerId;
        var animalName;
        var name = '57345599db69cf4200fa41d971088';
        var event = 'initialized';
        var target = 'testName';
        var timestamp = '2016-05-16T11:48:25Z';
        var type = 'type';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
                name: name,
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http://id.tincanapi.com/verb/' + event
            },
            object: {
                id: 'http://example.com/games/SuperMarioBros/Screens/' + target,
                definition: {
                    extensions: {
                        type: 'defType',
                        extensions: {
                            versionId: 'testVersionId',
                            gameplayId: 'testGameplayId'
                        }
                    },
                    type: 'https://rage.e-ucm.es/xapi/seriousgames/activities/' + type
                }
            },
            result: {
                extensions: {
                    ext1: '123',
                    '/ext2': '456',
                    'asdasd/asdasd3': 0,
                    '23.423.4756/ext3': '411'
                }
            },
            timestamp: timestamp
        };

        it('Testing the start collector with errored JWT', function (done) {
            request.post('/api/collector/start/' + trackingCode)
                .expect(400)
                .expect('Content-Type', /json/)
                .set('Authorization', 'Non JWT Compliant Format')
                .end(function (err, res) {
                    should.deepEqual(res.body, {
                        message: 'Authorization header found but the expected format ' +
                        'is \'Bearer JSON Web Token\' obtained from login in A2'
                    });
                    done();
                });
        });

        it('Testing the start collector', function (done) {
            request.post('/api/collector/start/' + trackingCode)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should(res.body).be.Object();
                    should(res.body.authToken).be.String();
                    should(res.body.objectId).be.String();
                    should.equal(res.body.objectId.indexOf('http'), 0);
                    should(res.body.actor).be.Object();
                    should(res.body.actor.name).be.String();
                    should(res.body.actor.account).be.Object();
                    should.equal(res.body.actor.account.name, 'Anonymous');
                    var expectedSession = 1;
                    should.equal(res.body.session, expectedSession);
                    should.equal(res.body.actor.account.homePage, config.a2.a2HomePage);
                    should(res.body.firstSessionStarted).be.a.String();
                    should(res.body.currentSessionStarted).be.a.String();
                    if (expectedSession === 1) {
                        should(res.body.firstSessionStarted).eql(res.body.currentSessionStarted);
                    }
                    authToken = res.body.authToken;
                    playerId = res.body.playerId;
                    animalName = res.body.actor.name;
                    statement.actor = res.body.actor;
                    done();
                });
        });

        var checkConsumerData = function(playerId, versionId, gameplayId, data, convertedTraces) {
            for (var i = 0; i < data.length; ++i) {
                var extensions = data[i].object.definition.extensions;
                should(data[i].actor.name).not.eql(playerId);
                should(data[i].actor.account.name).not.eql(playerId);
                should.equal(extensions.gameplayId, gameplayId);
                should.equal(extensions.versionId, versionId);
                should(extensions.firstSessionStarted).be.a.Date();
                should(extensions.currentSessionStarted).be.a.Date();
                should(extensions.session).be.a.Number();
                if (extensions.session === 1) {
                    should(extensions.firstSessionStarted).eql(extensions.currentSessionStarted);
                }

                should.equal(convertedTraces[i].gameplayId, gameplayId);
                should.equal(convertedTraces[i].versionId, versionId);
                should(convertedTraces[i].firstSessionStarted).be.a.Date();
                should(convertedTraces[i].currentSessionStarted).be.a.Date();
                should(convertedTraces[i].session).be.a.Number();
                if (convertedTraces[i].session === 1) {
                    should(convertedTraces[i].firstSessionStarted).eql(convertedTraces[i].currentSessionStarted);
                }
            }
        };

        it('Testing collector track', function (done) {
            var dataSource = require('../../lib/traces');

            dataSource.clearConsumers();
            dataSource.addConsumer({
                addTraces: function (playerId, versionId, gameplayId, data, convertedTraces) {
                    checkConsumerData(playerId, versionId, gameplayId, data, convertedTraces);
                }
            });
            request.post('/api/collector/track')
                .expect(200)
                .expect('Content-Type', /json/)
                .set('Authorization', authToken)
                .send([statement])
                .end(function (err, res) {
                    should(res.body).eql({message: 'Success.'});
                    done();
                });
        });

        it('Testing collector track fails ith the same status and message as the consumer', function (done) {
            var dataSource = require('../../lib/traces');

            var status = 700;
            var message = 'Provoked error!';

            dataSource.clearConsumers();
            dataSource.addConsumer({
                addTraces: function (playerId, versionId, gameplayId, data, convertedTraces) {
                    checkConsumerData(playerId, versionId, gameplayId, data, convertedTraces);
                    var deferred = Q.defer();
                    setTimeout(function () {
                        var err = new Error(message);
                        err.status = status;
                        deferred.reject(err);
                    }, 50);
                    return deferred.promise;
                }
            });
            request.post('/api/collector/track')
                .expect(status)
                .expect('Content-Type', /json/)
                .set('Authorization', authToken)
                .send([statement])
                .end(function (err, res) {
                    should(res.body).eql({message: message});
                    done();
                });
        });


        it('Testing collector track fails status 400 if consumer throws a non status error', function (done) {
            var dataSource = require('../../lib/traces');
            var message = 'Provoked error!';
            dataSource.clearConsumers();
            dataSource.addConsumer({
                addTraces: function (playerId, versionId, gameplayId, data, convertedTraces) {
                    checkConsumerData(playerId, versionId, gameplayId, data, convertedTraces);
                    var deferred = Q.defer();
                    setTimeout(function () {
                        var err = new Error(message);
                        deferred.reject(err);
                    }, 50);
                    return deferred.promise;
                }
            });
            request.post('/api/collector/track')
                .expect(400)
                .expect('Content-Type', /json/)
                .set('Authorization', authToken)
                .send([statement])
                .end(function (err, res) {
                    should(res.body).eql({message: message});
                    done();
                });
        });

        it('Testing collector track fails for a non array object ', function (done) {
            var dataSource = require('../../lib/traces');
            dataSource.clearConsumers();

            request.post('/api/collector/track')
                .expect(400)
                .expect('Content-Type', /json/)
                .set('Authorization', authToken)
                .send({})
                .end(function (err, res) {
                    should(res.body).eql({message: 'Statements must be an array!'});
                    request.post('/api/collector/track')
                        .expect(400)
                        .expect('Content-Type', /json/)
                        .set('Authorization', authToken)
                        .send(null)
                        .end(function (err, res) {
                            should(res.body).eql({message: 'Statements must be an array!'});
                            request.post('/api/collector/track')
                                .expect(400)
                                .expect('Content-Type', /json/)
                                .set('Authorization', authToken)
                                .send(undefined)
                                .end(function (err, res) {
                                    should(res.body).eql({message: 'Statements must be an array!'});
                                    request.post('/api/collector/track')
                                        .expect(400)
                                        .expect('Content-Type', /json/)
                                        .set('Authorization', authToken)
                                        .send()
                                        .end(function (err, res) {
                                            should(res.body).eql({message: 'Statements must be an array!'});
                                            done();
                                        });
                                });
                        });
                });
        });

        it('Testing collector track fails for a wrongly formatter statement (verb error) ', function (done) {
            var dataSource = require('../../lib/traces');
            dataSource.clearConsumers();

            var errStatement = {};
            request.post('/api/collector/track')
                .expect(400)
                .expect('Content-Type', /json/)
                .set('Authorization', authToken)
                .send([errStatement])
                .end(function (err, res) {
                    should(res.body).eql({
                        message: 'Statement ' + errStatement +
                        ' doesn\'t have a valid format. Error: Actor is missing for statement, ' + errStatement
                    });


                    var noVerbStatement = {
                        object: {
                            objectType: 'Activity',
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

                    request.post('/api/collector/track')
                        .expect(400)
                        .expect('Content-Type', /json/)
                        .set('Authorization', authToken)
                        .send([noVerbStatement])
                        .end(function (err, res) {
                            should(res.body).eql({
                                message: 'Statement ' + noVerbStatement +
                                ' doesn\'t have a valid format. Error: Actor is missing for statement, ' + noVerbStatement
                            });


                            var noVerbIdStatement = {
                                verb: {
                                    display: {
                                        'en-US': 'created'
                                    }
                                },
                                object: {
                                    objectType: 'Activity',
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

                            request.post('/api/collector/track')
                                .expect(400)
                                .expect('Content-Type', /json/)
                                .set('Authorization', authToken)
                                .send([noVerbIdStatement])
                                .end(function (err, res) {
                                    should(res.body).eql({message: 'Statement ' + noVerbIdStatement +
                                        ' doesn\'t have a valid format. Error: Actor is missing for statement, ' + noVerbIdStatement});

                                    var noUrlVerbIdStatement = {
                                        verb: {
                                            id: 'nourlId',
                                            display: {
                                                'en-US': 'created'
                                            }
                                        },
                                        object: {
                                            objectType: 'Activity',
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

                                    request.post('/api/collector/track')
                                        .expect(400)
                                        .expect('Content-Type', /json/)
                                        .set('Authorization', authToken)
                                        .send([noUrlVerbIdStatement])
                                        .end(function (err, res) {
                                            should(res.body).eql({
                                                message: 'Statement ' + noUrlVerbIdStatement +
                                                ' doesn\'t have a valid format. Error: Actor is missing for statement, ' + noUrlVerbIdStatement
                                            });


                                            done();
                                        });
                                });
                        });
                });
        });


        it('Testing collector track fails for a wrongly formatter statement (object error) ', function (done) {
            var dataSource = require('../../lib/traces');
            dataSource.clearConsumers();

            var noObjectErrStatement = {
                verb: {
                    id: 'http://adlnet.gov/expapi/verbs/created',
                    display: {
                        'en-US': 'created'
                    }
                }
            };
            request.post('/api/collector/track')
                .expect(400)
                .expect('Content-Type', /json/)
                .set('Authorization', authToken)
                .send([noObjectErrStatement])
                .end(function (err, res) {
                    should(res.body).eql({
                        message: 'Statement ' + noObjectErrStatement +
                        ' doesn\'t have a valid format. Error: Actor is missing for statement, ' + noObjectErrStatement
                    });


                    var noObjectIdStatement = {
                        verb: {
                            id: 'http://adlnet.gov/expapi/verbs/created',
                            display: {
                                'en-US': 'created'
                            }
                        },
                        object: {
                            objectType: 'Activity',
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

                    request.post('/api/collector/track')
                        .expect(400)
                        .expect('Content-Type', /json/)
                        .set('Authorization', authToken)
                        .send([noObjectIdStatement])
                        .end(function (err, res) {
                            should(res.body).eql({
                                message: 'Statement ' + noObjectIdStatement +
                                ' doesn\'t have a valid format. Error: Actor is missing for statement, ' + noObjectIdStatement
                            });


                            var noUrlOjbectIdStatement = {
                                verb: {
                                    id: 'http://adlnet.gov/expapi/verbs/created',
                                    display: {
                                        'en-US': 'created'
                                    }
                                },
                                object: {
                                    objectType: 'Activity',
                                    id: 'simplestatement',
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

                            request.post('/api/collector/track')
                                .expect(400)
                                .expect('Content-Type', /json/)
                                .set('Authorization', authToken)
                                .send([noUrlOjbectIdStatement])
                                .end(function (err, res) {
                                    should(res.body).eql({
                                        message: 'Statement ' + noUrlOjbectIdStatement +
                                        ' doesn\'t have a valid format. Error: Actor is missing for statement, ' + noUrlOjbectIdStatement
                                    });
                                    done();
                                });
                        });
                });
        });

        it('Testing collector track fails ' +
            'with the same status and message as the consumer that fails first', function (done) {
            var dataSource = require('../../lib/traces');

            var status1 = 700;
            var message1 = 'Provoked error 1!';

            var status2 = 900;
            var message2 = 'Provoked error 2!';
            var consumer2Called = false;
            var consumer2Failed = false;

            var firstConsumer = {
                addTraces: function (playerId, versionId, gameplayId, data, convertedTraces) {
                    checkConsumerData(playerId, versionId, gameplayId, data, convertedTraces);
                    consumer2Called = true;
                    var deferred = Q.defer();
                    setTimeout(function () {
                        var err = new Error(message1);
                        err.status = status1;
                        consumer2Failed = true;
                        deferred.reject(err);
                    }, 200);
                    return deferred.promise;
                }
            };
            var secondConsumer = {
                addTraces: function (playerId, versionId, gameplayId, data, convertedTraces) {
                    checkConsumerData(playerId, versionId, gameplayId, data, convertedTraces);
                    var deferred = Q.defer();
                    setTimeout(function () {
                        var err = new Error(message2);
                        err.status = status2;
                        deferred.reject(err);
                    }, 50);
                    return deferred.promise;
                }
            };

            dataSource.clearConsumers();
            dataSource.addConsumer(firstConsumer);
            dataSource.addConsumer(secondConsumer);
            request.post('/api/collector/track')
                .expect(status2)
                .expect('Content-Type', /json/)
                .set('Authorization', authToken)
                .send([statement, statement])
                .end(function (err, res) {
                    should(res.body).eql({message: message2});
                    should(consumer2Called).eql(true);
                    should(consumer2Failed).eql(false);
                    done();
                });
        });

        // Test collector sessions count

        var startNewSession = function (expectedSession, playerIdentifier, checkAnimalName, type) {
            request.post('/api/collector/start/' + trackingCode)
                .expect(200)
                .expect('Content-Type', /json/)
                .send({
                    anonymous: playerIdentifier
                })
                .end(function (err, res) {
                    should(res.body).be.Object();
                    should(res.body.authToken).be.String();
                    should(res.body.objectId).be.String();
                    should.equal(res.body.objectId.indexOf('http'), 0);
                    should(res.body.actor).be.Object();
                    if (checkAnimalName) {
                        should.equal(res.body.actor.name, checkAnimalName);
                    } else {
                        should(res.body.actor.name).be.String();
                    }
                    should(res.body.actor.account).be.Object();
                    if (!type) {
                        type = 'Anonymous';
                    }
                    should.equal(res.body.actor.account.name, type);
                    should.equal(res.body.session, expectedSession);
                    should.equal(res.body.actor.account.homePage, config.a2.a2HomePage);
                    authToken = res.body.authToken;
                    should(res.body.firstSessionStarted).be.a.String();
                    should(res.body.currentSessionStarted).be.a.String();
                    if (expectedSession === 1) {
                        should(res.body.firstSessionStarted).eql(res.body.currentSessionStarted);
                    }
                    statement.actor = res.body.actor;

                    var dataSource = require('../../lib/traces');
                    dataSource.clearConsumers();
                    var checkSessionCount = {
                        addTraces: function (playerId, versionId, gameplayId, data, convertedTraces) {
                            checkConsumerData(playerId, versionId, gameplayId, data, convertedTraces);

                            should(convertedTraces[0].session).eql(expectedSession);

                            var deferred = Q.defer();
                            setTimeout(function () {
                                deferred.resolve();
                            }, 100);
                            return deferred.promise;
                        }
                    };
                    dataSource.addConsumer(checkSessionCount);
                    var numStatementsSent = 5;
                    var checkSuccess = function (err, res) {
                        should(res.body).eql({
                            message: 'Success.'
                        });
                    };
                    for (var i = 0; i < numStatementsSent; ++i) {
                        request.post('/api/collector/track')
                            .expect(200)
                            .expect('Content-Type', /json/)
                            .set('Authorization', authToken)
                            .send([statement, statement, statement])
                            .end(checkSuccess);
                    }
                });
        };

        it('Testing the start collector with an anonymous user', function (done) {
            startNewSession(2, playerId, animalName);
            setTimeout(function () {
                startNewSession(3, playerId, animalName);
            }, 300);
            setTimeout(function () {
                startNewSession(1, '');
            }, 600);
            setTimeout(function () {
                startNewSession(4, playerId, animalName);
            }, 900);
            setTimeout(function () {
                startNewSession(1, '');
            }, 1200);
            setTimeout(function () {
                startNewSession(5, playerId, animalName);
            }, 1500);
            setTimeout(done, 1800);
        });

        // Test Non anonymous users login and session count

        var startNewIdentifiedSession = function (expectedSession, playerIdentifier) {
            request.post('/api/collector/start/' + trackingCode)
                .expect(200)
                .expect('Content-Type', /json/)
                .set('x-gleaner-user', playerIdentifier)
                .set('Authorization', 'Bearer 1234')
                .end(function (err, res) {

                    should(res.body).be.Object();
                    should(res.body.authToken).be.String();
                    should(res.body.objectId).be.String();
                    should.equal(res.body.objectId.indexOf('http'), 0);
                    should(res.body.actor).be.Object();
                    should(res.body.actor.account).be.Object();
                    // Identified actor has actor.account.name === actor.name
                    should.equal(res.body.actor.account.name, res.body.actor.name);
                    should.equal(res.body.session, expectedSession);
                    should.equal(res.body.actor.account.homePage, config.a2.a2HomePage);
                    authToken = res.body.authToken;
                    should(res.body.firstSessionStarted).be.a.String();
                    should(res.body.currentSessionStarted).be.a.String();
                    if (expectedSession === 1) {
                        should(res.body.firstSessionStarted).eql(res.body.currentSessionStarted);
                    }
                    statement.actor = res.body.actor;

                    var dataSource = require('../../lib/traces');
                    dataSource.clearConsumers();
                    var checkSessionCount = {
                        addTraces: function (playerId, versionId, gameplayId, data, convertedTraces) {
                            checkConsumerData(playerId, versionId, gameplayId, data, convertedTraces);

                            should(convertedTraces[0].session).eql(expectedSession);
                            var deferred = Q.defer();
                            setTimeout(function () {
                                deferred.resolve();
                            }, 100);
                            return deferred.promise;
                        }
                    };
                    dataSource.addConsumer(checkSessionCount);
                    var numStatementsSent = 5;
                    var checkSuccess = function (err, res) {
                        should(res.body).eql({
                            message: 'Success.'
                        });
                    };
                    for (var i = 0; i < numStatementsSent; ++i) {
                        request.post('/api/collector/track')
                            .expect(200)
                            .expect('Content-Type', /json/)
                            .set('Authorization', authToken)
                            .send([statement])
                            .end(checkSuccess);
                    }
                });
        };

        it('Testing the start collector with an identified user', function (done) {
            startNewIdentifiedSession(1, 'dan');
            setTimeout(function () {
                startNewIdentifiedSession(2, 'dan');
            }, 300);
            setTimeout(function () {
                startNewSession(1, '');
            }, 600);
            setTimeout(function () {
                startNewIdentifiedSession(3, 'dan');
            }, 900);
            setTimeout(function () {
                startNewSession(6, playerId, animalName);
            }, 1200);
            setTimeout(function () {
                startNewIdentifiedSession(4, 'dan');
            }, 1500);
            setTimeout(done, 1800);
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
