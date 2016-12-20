'use strict';

module.exports = (function () {
    var Q = require('q');
    var Collection = require('easy-collections');
    var db = require('./db');
    var sessions = new Collection(db, 'sessions');
    var games = require('./games');
    var versions = require('./versions');
    var classes = require('./classes');
    var utils = require('./utils');

    classes.preRemove(function(_id, next) {
        sessions.remove({
            classId: _id
        }).then(function() {
            next();
        }).fail(function() {
            next();
        });
    });
    // Tasks to execute in the session analysis starts
    sessions.startTasks = [];

    // Tasks to execute in the session analysis ends
    sessions.endTasks = [];

    /**
     * Returns the active session for gameId:versionId
     */
    sessions.getActiveSession = function (gameId, versionId, classId) {
        gameId = sessions.toObjectID(gameId);
        versionId = sessions.toObjectID(versionId);
        classId = sessions.toObjectID(classId);
        return sessions.find({gameId: gameId, versionId: versionId, classId: classId, end: null}, true);
    };

    /**
     * Returns the sessions for gameId:versionId
     */
    sessions.getSessions = function (gameId, versionId, classId) {
        gameId = sessions.toObjectID(gameId);
        versionId = sessions.toObjectID(versionId);
        classId = sessions.toObjectID(classId);
        return sessions.find({gameId: gameId, versionId: versionId, classId: classId});
    };

    /**
     * Returns the sessions where a user participates
     */
    sessions.getUserSessions = function (gameId, versionId, classId, user) {
        gameId = sessions.toObjectID(gameId);
        versionId = sessions.toObjectID(versionId);
        classId = sessions.toObjectID(classId);
        return sessions.find({
                $or: [
                    {gameId: gameId, versionId: versionId, classId: classId, teachers: user},
                    {gameId: gameId, versionId: versionId, classId: classId, students: user}
                ]
            }
        );
    };

    /**
     * Creates a new session for the given gameId:versionId.
     * @Returns a promise with the session created
     */
    sessions.createSession = function (gameId, versionId, classId, username, name) {
        return getGameVersionAndClass(gameId, versionId, classId).then(function (result) {
            return sessions.getActiveSession(result.game._id, result.version._id, result.class._id).then(function (session) {
                var teachersArray = result.version.teachers || [];
                if (teachersArray.indexOf(username) === -1) {
                    teachersArray.push(username);
                }
                return sessions.insert({
                    gameId: result.game._id,
                    versionId: result.version._id,
                    classId: result.class._id,
                    name: name,
                    allowAnonymous: false,
                    created: new Date(),
                    students: result.class.students,
                    teachers: teachersArray
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
                return startSessionAnalysis(sessionId, session.versionId)
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
                    return endSessionAnalysis(sessionId, session.versionId).then(function () {
                        return session;
                    });
                });
        });
    };

    /**
     * A promise with the results with the given session
     */
    sessions.results = function (sessionId, username, esClient) {
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

                var deferred = Q.defer();
                esClient.search({
                    size: 200,
                    from: 0,
                    index: 'results-' + sessionId,
                    type: 'results'
                }, function (error, response) {
                    if (error) {
                        if (response.error && response.error.type === 'index_not_found_exception') {
                            return deferred.resolve([]);
                        }
                        return deferred.reject(new Error(error));
                    }

                    var data = [];

                    if (response.hits && response.hits.hits.length) {
                        response.hits.hits.forEach(function (document) {
                            if (document._source) {
                                document._source._id = document._id;
                                data.push(document._source);
                            }
                        });
                    }

                    deferred.resolve(data);
                });
                return deferred.promise;
            });
    };

    sessions.updateResult = function (sessionId, resultId, update, username, esClient) {
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

                var deferred = Q.defer();
                esClient.update({
                    index: 'results-' + sessionId,
                    type: 'results',
                    id: resultId,
                    body: {
                        doc: update
                    }
                }, function (error, response) {
                    if (error) {
                        return deferred.reject(new Error(error));
                    }

                    var data = [];

                    if (response.hits && response.hits.hits.length) {
                        response.hits.hits.forEach(function (document) {
                            if (document._source) {
                                data.push(document._source);
                            }
                        });
                    }

                    deferred.resolve(data);
                });
                return deferred.promise;
            });
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

                if (body.classId) {
                    delete body.classId;
                }

                if (body.start) {
                    delete body.start;
                }

                if (body.end) {
                    delete body.end;
                }

                var update = {};
                utils.addToArrayHandler(update, body, 'teachers', add);
                utils.addToArrayHandler(update, body, 'students', add);

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

                return sessions.removeById(sessionId).then(function (result, err) {
                    if (!err) {
                        return {
                            message: 'Success.'
                        };
                    }
                });
            });
    };


    sessions.preRemove(function (_id, next) {

        // TODO remove elasticsearch index results-sessionId, traces-sessionId and opaque-values-sessionId
    });

    var getGameVersionAndClass = function (gameId, versionId, classId) {
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
                return classes.findById(classId).then(function (classRes) {
                    if (!classRes) {
                        throw {
                            message: 'Class does not exist',
                            status: 400
                        };
                    }
                    return {
                        game: game,
                        version: version,
                        class: classRes
                    };
                });
            });
        });
    };

    var startSessionAnalysis = function (sessionId, versionId) {
        return executeTasks(sessionId, versionId, sessions.startTasks);
    };

    var endSessionAnalysis = function (sessionId, versionId) {
        return executeTasks(sessionId, versionId, sessions.endTasks);
    };

    var executeTasks = function (sessionId, versionId, tasks) {
        var promises = [];
        for (var i = 0; i < tasks.length; i++) {
            promises.push(tasks[i].call(null, sessionId, versionId));
        }
        return Q.all(promises);
    };

    return sessions;
})();