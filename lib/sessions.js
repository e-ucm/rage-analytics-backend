'use strict';

module.exports = (function () {
    var Q = require('q');
    var Collection = require('easy-collections');
    var db = require('./db');
    var sessions = new Collection(db, 'sessions');
    var games = require('./games');
    var versions = require('./versions');


    // Tasks to execute in the session analysis starts
    sessions.startTasks = [];

    // Tasks to execute in the session analysis ends
    sessions.endTasks = [];

    /**
     * Returns the active session for gameId:versionId
     */
    sessions.getActiveSession = function (gameId, versionId) {
        gameId = sessions.toObjectID(gameId);
        versionId = sessions.toObjectID(versionId);
        return sessions.find({gameId: gameId, versionId: versionId, end: null}, true);
    };

    /**
     * Returns the sessions for gameId:versionId
     */
    sessions.getSessions = function (gameId, versionId) {
        gameId = sessions.toObjectID(gameId);
        versionId = sessions.toObjectID(versionId);
        return sessions.find({gameId: gameId, versionId: versionId});
    };

    /**
     * Returns the sessions where a user participates
     */
    sessions.getUserSessions = function (gameId, versionId, user) {
        gameId = sessions.toObjectID(gameId);
        versionId = sessions.toObjectID(versionId);
        return sessions.find({
                $or: [
                    {gameId: gameId, versionId: versionId, teachers: user},
                    {gameId: gameId, versionId: versionId, students: user}
                ]
            }
        );
    };

    /**
     * Creates a new session for the given gameId:versionId.
     * @Returns a promise with the session created
     */
    sessions.createSession = function (gameId, versionId, username, name) {
        return getGameVersion(gameId, versionId).then(function (result) {
            return sessions.getActiveSession(result.game._id, result.version._id).then(function (session) {
                return sessions.insert({
                    gameId: result.game._id,
                    versionId: result.version._id,
                    name: name,
                    allowAnonymous: false,
                    created: new Date(),
                    teachers: [username]
                });
            });
        });
    };

    /**
     * Launches the real time session analyzer for a session with the id.
     */
    sessions.startSession = function (username, sessionId) {
        return sessions.findById(sessionId).then(function (session) {
            if (!session) {
                throw {
                    message: 'Session does not exist',
                    status: 400
                };
            }
            return sessions.findAndModify(sessionId, {
                start: new Date(),
                end: null
            }).then(function (session) {
                return startSessionAnalysis(sessionId)
                    .then(function () {
                        return session;
                    }).fail(function (err) {
                        var update = {
                            $unset: {
                                start: '',
                                end: ''
                            }
                        };
                        return sessions.findAndUpdate(sessionId, update).then(function () {
                            throw err;
                        });
                    });
            });
        });
    };

    /**
     * Ends the real time session analyzer for a session with the id.
     */
    sessions.endSession = function (username, sessionId) {
        return sessions.findById(sessionId).then(function (session) {
            if (!session) {
                throw {
                    message: 'Session does not exist',
                    status: 400
                };
            }
            if (!session.teachers || session.teachers.indexOf(username) === -1) {
                throw {
                    message: 'You don\'t have permission to modify this session.',
                    status: 401
                };
            }

            return sessions.findAndModify(sessionId, {end: new Date()})
                .then(function (session) {
                    return endSessionAnalysis(sessionId).then(function () {
                        return session;
                    });
                });
        });
    };

    /**
     * A promise with the results with the given session
     */
    sessions.results = function (sessionId, username) {
        return sessions.find(sessions.toObjectID(sessionId), true)
            .then(function (session) {
                if (!session) {
                    throw {
                        message: 'Session does not exist',
                        status: 400
                    };
                }

                var hasPermission = false;

                if (session.teachers && session.teachers.indexOf(username) !== -1) {
                    hasPermission = true;
                }
                if (!hasPermission && session.students && session.students.indexOf(username) !== -1) {
                    hasPermission = true;
                }
                if (!hasPermission) {
                    throw {
                        message: 'You don\'t have permission to see this session\'s results.',
                        status: 401
                    };
                }

                var sessionResults = new Collection(require('./db'), 'session' + sessionId.toString());
                return sessionResults.find();
            });
    };

    sessions.updateResult = function (sessionId, resultId, update, username) {
        return sessions.find(sessions.toObjectID(sessionId), true)
            .then(function (session) {
                if (!session) {
                    throw {
                        message: 'Session does not exist',
                        status: 400
                    };
                }

                if (!session.teachers || session.teachers.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to modify this session\'s results.',
                        status: 401
                    };
                }

                var sessionResults = new Collection(require('./db'), 'session' + sessionId.toString());
                return sessionResults.findAndModify(resultId, update);
            });
    };

    var addToArrayHandler = function (update, object, stringKey, add) {
        if (object[stringKey]) {
            if (add) {
                if (!update.$addToSet) {
                    update.$addToSet = {};
                }
                if (Array.isArray(object[stringKey])) {
                    update.$addToSet[stringKey] = {
                        $each: object[stringKey]
                    };
                } else if (typeof object[stringKey] === 'string') {
                    update.$addToSet[stringKey] = object[stringKey];
                }
            } else {
                if (!update.$pull) {
                    update.$pull = {};
                }
                if (Array.isArray(object[stringKey])) {
                    update.$pull[stringKey] = {
                        $in: object[stringKey]
                    };
                } else if (typeof object[stringKey] === 'string') {
                    update.$pull[stringKey] = object[stringKey];
                }
            }
            delete object[stringKey];
        }
    };

    sessions.modifySession = function (sessionId, username, body, add) {
        return sessions.find(sessions.toObjectID(sessionId), true)
            .then(function (session) {
                if (!session) {
                    throw {
                        message: 'Session does not exist',
                        status: 400
                    };
                }

                if (!session.teachers || session.teachers.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to modify this session.',
                        status: 401
                    };
                }

                if (body._id) {
                    delete body._id;
                }

                if (body.gameId) {
                    delete body.gameId;
                }

                if (body.versionId) {
                    delete body.versionId;
                }

                if (body.start) {
                    delete body.start;
                }

                if (body.end) {
                    delete body.end;
                }

                var update = {};
                addToArrayHandler(update, body, 'teachers', add);
                addToArrayHandler(update, body, 'students', add);

                if (add) {
                    if (body.name && typeof body.name === 'string') {
                        update.$set = {};
                        update.$set.name = body.name;
                    }
                    if (body.allowAnonymous === false || body.allowAnonymous === true) {
                        if (!update.$set) {
                            update.$set = {};
                        }
                        update.$set.allowAnonymous = body.allowAnonymous;
                    }
                }

                return sessions.findAndUpdate(sessionId, update);
            });
    };

    sessions.removeSession = function (sessionId, username) {
        return sessions.findById(sessionId)
            .then(function (session) {
                if (!session) {
                    throw {
                        message: 'Session does not exist',
                        status: 400
                    };
                }

                if (!session.teachers || session.teachers.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to delete this session.',
                        status: 401
                    };
                }

                if (!session.end) {
                    throw {
                        message: 'You must end the session before deleting it',
                        status: 400
                    };
                }

                var sesionIdentifier = sessionId.toString();
                db.collection('sessions' + sesionIdentifier).drop();
                db.collection('session_opaque_values_' + sesionIdentifier).drop();

                return sessions.removeById(sessionId);
            });
    };

    var getGameVersion = function (gameId, versionId) {
        return games.findById(gameId).then(function (game) {
            if (!game) {
                throw {
                    message: 'Game does not exist',
                    status: 400
                };
            }
            return versions.findById(versionId).then(function (version) {
                if (!version) {
                    throw {
                        message: 'Version does not exist',
                        status: 400
                    };
                }
                return {
                    game: game,
                    version: version
                };
            });
        });
    };

    var startSessionAnalysis = function (sessionId) {
        return executeTaks(sessionId, sessions.startTasks);
    };

    var endSessionAnalysis = function (sessionId) {
        return executeTaks(sessionId, sessions.endTasks);
    };

    var executeTaks = function (sessionId, tasks) {
        var promises = [];
        for (var i = 0; i < tasks.length; i++) {
            promises.push(tasks[i].call(null, sessionId));
        }
        return Q.all(promises);
    };

    return sessions;
})();