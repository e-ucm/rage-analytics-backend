'use strict';

module.exports = (function () {
    var Q = require('q');
    var Collection = require('easy-collections');
    var db = require('./db');
    var activities = new Collection(db, 'activities');
    var games = require('./games');
    var versions = require('./versions');
    var classes = require('./classes');
    var groups = require('./groups');
    var groupings = require('./groupings');
    var gameplays = require('./gameplays');
    var utils = require('./utils');
    var analysis = new Collection(db, 'analysis');
    var fs = require('fs');
    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var activityScheme = {
        id: '/Activity',
        type: 'object',
        properties: {
            trackingCode: { type: 'string'},
            name: { type: 'string'},
            gameId: { type: 'ID'},
            versionId: { type: 'ID'},
            classId: { type: 'ID'},
            allowAnonymous: { type: 'boolean'},
            groups: {
                type: 'array',
                items: {type: 'ID'}
            },
            groupings: {
                type: 'array',
                items: {type: 'ID'}
            },
            created: { type: 'date'},
            start: { type: 'date'},
            end: { type: 'date'},
            open: { type: 'boolean'},
            visible: { type: 'boolean'}
        },
        required: ['name', 'gameId', 'versionId', 'classId', 'allowAnonymous',
            'groups', 'groupings', 'created', 'open', 'visible'],
        additionalProperties: false
    };
    v.addSchema(activityScheme, '/Activity');

    var activitySchemePut = {
        id: '/ActivityPut',
        type: 'object',
        properties: {
            trackingCode: { type: 'string'},
            name: { type: 'string'},
            gameId: { type: 'string'},
            versionId: { type: 'string'},
            classId: { type: 'string'},
            allowAnonymous: { type: 'boolean'},
            groups: {
                type: 'array',
                items: {type: 'string'}
            },
            groupings: {
                type: 'array',
                items: {type: 'string'}
            },
            created: { type: 'date'},
            start: { type: 'date'},
            end: { type: 'date'},
            open: { type: 'boolean'},
            visible: { type: 'boolean'}
        },
        additionalProperties: false,
        minProperties: 1,
        maxProperties: 19
    };
    v.addSchema(activitySchemePut, '/ActivityPut');

    classes.preRemove(function(_id, next) {
        activities.remove({
            classId: _id
        }).then(function() {
            next();
        }).fail(function() {
            next();
        });
    });
    // Tasks to execute in the session analysis starts
    activities.startTasks = [];

    // Tasks to execute in the session analysis ends
    activities.endTasks = [];

    /**
     * Generates a 2 length random code
     */
    var token = function() {
        return Math.random().toString(36).substr(2);
    };

    activities.insert = function(object) {
        return Collection.prototype.insert.call(this, object).then(function(activity) {
            var set = {
                trackingCode: activity._id + token()
            };
            return activities.findAndModify(activity._id, set);
        });
    };

    /**
     * Returns the active activities for gameId:versionId
     */
    activities.getActiveGameActivities = function (gameId, versionId) {
        gameId = activities.toObjectID(gameId);
        versionId = activities.toObjectID(versionId);
        return activities.find({gameId: gameId, versionId: versionId, end: null}, true);
    };

    /**
     * Returns the active activities for classId
     */
    activities.getActiveClassActivities = function (classId) {
        classId = activities.toObjectID(classId);
        return activities.find({classId: classId, end: null}, true);
    };


    /**
     * Returns the activities for gameId:versionId
     */
    activities.getGameActivities = function (gameId, versionId) {
        gameId = activities.toObjectID(gameId);
        versionId = activities.toObjectID(versionId);
        return activities.find({gameId: gameId, versionId: versionId});
    };

    /**
     * Returns the activities for classId
     */
    activities.getClassActivities = function (classId) {
        classId = activities.toObjectID(classId);
        return activities.find({classId: classId});
    };

    /**
     * Returns the activities where a user participates
     */
    activities.getUserActivities = function (user) {
        return activities.find({
                $or: [
                    {teachers: user},
                    {students: user}
                ]
            }
        );
    };

    /**
     * Returns the activities where a user participates
     */
    activities.getUserActivitiesByGame = function (gameId, versionId, user) {
        gameId = activities.toObjectID(gameId);
        versionId = activities.toObjectID(versionId);
        return activities.find({
                $or: [
                    {gameId: gameId, versionId: versionId, teachers: user},
                    {gameId: gameId, versionId: versionId, students: user}
                ]
            }
        );
    };

    /**
     * Returns the activities where a user participates
     */
    activities.getUserActivitiesByClass = function (classId, user) {
        classId = activities.toObjectID(classId);
        return activities.find({
                $or: [
                    {classId: classId, teachers: user},
                    {classId: classId, students: user}
                ]
            }
        );
    };

    /**
     * Creates a new activity for the given gameId:versionId:classId
     * @Returns a promise with the session created
     */
    activities.createActivity = function (gameId, versionId, classId, username, name) {
        return getGameVersionAndClass(gameId, versionId, classId).then(function (result) {
            if (!name) {
                name = 'new Activity';
            }

            var activityObj = {
                name: name,
                gameId: result.game._id,
                versionId: result.version._id,
                classId: result.class._id,
                allowAnonymous: false,
                groups: [],
                groupings: [],
                created: new Date(),
                open: false,
                visible: false
            };

            var validationObj = v.validate(activityObj, activityScheme);
            if (validationObj.errors && validationObj.errors.length > 0) {
                throw {
                    message: 'Activity bad format: ' + validationObj.errors[0],
                    status: 400
                };
            } else {
                return activities.insert(activityObj);
            }
        });
    };

    /**
     * Launches the real time activity analyzer for a activity with the id.
     */
    activities.startActivity = function (username, activityId) {
        return activities.findById(activityId).then(function (activity) {
            if (!activity) {
                throw {
                    message: 'Activity does not exist',
                    status: 400
                };
            }
            return activities.findAndModify(activityId, {
                start: new Date(),
                end: null
            }).then(function (activity) {
                return startActivityAnalysis(activityId, activity.versionId)
                    .then(function () {
                        return activity;
                    }).fail(function (err) {
                        var update = {
                            $unset: {
                                start: '',
                                end: ''
                            }
                        };
                        return activities.findAndUpdate(activityId, update).then(function () {
                            throw err;
                        });
                    });
            });
        });
    };

    /**
     * Ends the real time activity analyzer for a activity with the id.
     */
    activities.endActivity = function (username, activityId) {
        return activities.findById(activityId).then(function (activity) {
            if (!activity) {
                throw {
                    message: 'Activity does not exist',
                    status: 400
                };
            }
            if (!activity.teachers || activity.teachers.indexOf(username) === -1) {
                throw {
                    message: 'You don\'t have permission to modify this activity.',
                    status: 401
                };
            }

            return activities.findAndModify(activityId, {end: new Date()})
                .then(function (activity) {
                    return endActivityAnalysis(activityId, activity.versionId).then(function () {
                        return activity;
                    });
                });
        });
    };

    /**
     * A promise with the results with the given activity
     */
    activities.results = function (activityId, username, esClient) {
        return activities.find(activities.toObjectID(activityId), true)
            .then(function (activity) {

                if (!activity) {
                    throw {
                        message: 'Activity does not exist',
                        status: 400
                    };
                }

                var hasPermission = false;

                if (activity.teachers && activity.teachers.indexOf(username) !== -1) {
                    hasPermission = true;
                }
                if (!hasPermission && activity.students && activity.students.indexOf(username) !== -1) {
                    hasPermission = true;
                }
                if (!hasPermission) {
                    throw {
                        message: 'You don\'t have permission to see this activity\'s results.',
                        status: 401
                    };
                }

                var deferred = Q.defer();
                esClient.search({
                    size: 200,
                    from: 0,
                    index: 'results-' + activityId,
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

    activities.updateResult = function (activityId, resultId, update, username, esClient) {
        return activities.find(activities.toObjectID(activityId), true)
            .then(function (activity) {
                if (!activity) {
                    throw {
                        message: 'Session does not exist',
                        status: 400
                    };
                }

                if (!activity.teachers || activity.teachers.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to modify this activity\'s results.',
                        status: 401
                    };
                }

                var deferred = Q.defer();
                esClient.update({
                    index: 'results-' + activityId,
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

    activities.modifyActivity = function (activityId, username, body, add) {
        return activities.isAuthorizedFor(activityId, username, add ? 'put' : 'remove', add ? ':activityId' : ':activityId/remove')
            .then(function (isAuthorized) {
                if (!isAuthorized) {
                    throw {
                        message: 'User not authorized to PUT (modify) this activity',
                        status: 401
                    };
                }

                return activities.find(activities.toObjectID(activityId), true)
                    .then(function (activity) {
                        if (!activity) {
                            throw {
                                message: 'Session does not exist',
                                status: 400
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

                        if (body.teachers) {
                            delete body.teachers;
                        }

                        if (body.students) {
                            delete body.students;
                        }

                        var update = {};
                        utils.addToArrayHandler(update, body, 'groups', add);
                        utils.addToArrayHandler(update, body, 'groupings', add);

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

                        return activities.findAndUpdate(activityId, update);
                    });
            });
    };

    activities.preRemove(function(_id, next) {
        var activityId = _id.toString();
        db.collection('gameplays_' + activityId).drop();
        next();
    });

    activities.removeActivity = function (activityId, username) {
        return activities.isAuthorizedFor(activityId, username, 'remove', ':activityId')
            .then(function (isAuthorized) {
                if (!isAuthorized) {
                    throw {
                        message: 'You don\'t have permission to delete this activity.',
                        status: 401
                    };
                }

                return activities.findById(activityId)
                    .then(function (activity) {
                        if (!activity) {
                            throw {
                                message: 'Activity does not exist',
                                status: 400
                            };
                        }

                        if (activity.end === null) {
                            throw {
                                message: 'You must end the session before deleting it',
                                status: 400
                            };
                        }

                    }).then(function () {
                        return activities.removeById(activityId).then(function (result, err) {
                            if (!err) {
                                return {
                                    message: 'Success.'
                                };
                            }
                        });
                    });
            });
    };

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

    var startActivityAnalysis = function (activityId, versionId) {
        return executeTasks(activityId, versionId, activities.startTasks);
    };

    var endActivityAnalysis = function (activityId, versionId) {
        return executeTasks(activityId, versionId, activities.endTasks);
    };

    var executeTasks = function (activityId, versionId, tasks) {
        var promises = [];
        for (var i = 0; i < tasks.length; i++) {
            promises.push(tasks[i].call(null, activityId, versionId));
        }
        return Q.all(promises);
    };

    var getAnalysisIndicesReplace = function(defaultConfig, versionId, activityId, user) {
        return analysis.findById(activityId, true).then(function(result) {
            if (!result) {
                // Use the default analysis files
                result = {};
                result.indicesPath = defaultConfig.analysisFolder + '/indices.json';
            }
            var data = fs.readFileSync(result.indicesPath, 'utf8');
            var returnObject = {indices: []};
            var obj = JSON.parse(data);
            if (obj.indices) {
                obj.indices.forEach(function(indice) {
                    returnObject.indices.push(indice.replace(obj.sessionKey, activityId));
                });
                if (user && obj.userKey && obj.query) {
                    if (obj.userKey) {
                        var string = JSON.stringify(obj.query);
                        var stringWithUser = string.replace(obj.userKey, user);
                        returnObject.query = JSON.parse(stringWithUser);
                    }
                }
            }
            return returnObject;
        });
    };

    activities.deleteAnalysisData = function (defaultConfig, activityId, esClient) {
        return activities.findById(activityId).then(function(result) {
            if (!result) {
                throw {
                    message: 'Activity not found',
                    status: 404
                };
            }
            console.log('pre removing');
            return getAnalysisIndicesReplace(defaultConfig, result.versionId, activityId).then(function (result) {
                var deferred = Q.defer();
                esClient.indices.delete({
                    index: result.indices
                }, function (error, response) {
                    if (error) {
                        deferred.reject(error);
                        return;
                    }

                    deferred.resolve(response);
                });
                return deferred.promise;
            });
        });
    };

    activities.deleteUserData = function (defaultConfig, activityId, userData, esClient) {
        return activities.findById(activityId, true).then(function(result) {
            if (!result) {
                throw {
                    message: 'Activity not found',
                    status: 404
                };
            }
            return getAnalysisIndicesReplace(defaultConfig, result.versionId, activityId, userData).then(function(result) {
                var deferred = Q.defer();

                if (!result.query) {
                    deferred.reject('doesn\'t exist query in indices.json');
                }

                esClient.deleteByQuery({
                    index: result.indices,
                    body: {
                        query: result.query
                    }
                }, function (error, response) {
                    if (error) {
                        deferred.reject(error);
                        return;
                    }

                    deferred.resolve(response);
                });
                return deferred.promise;
            });
        });

    };

    activities.getAttempts = function (username, activityId) {
        return activities.isAuthorizedFor(activityId, username, 'get', 'attempts')
            .then(function (isAuthorized) {
                if (isAuthorized) {
                    return gameplays.getAttempts(activityId);
                }
                throw {
                    status: 401,
                    message: 'Collaborator not authorized for this activity'
                };
            });
    };

    activities.getUserAttempts = function (username, activityId, ofUser) {
        var call = username === ofUser ? 'attempts/my' : 'attempts/:id';
        return activities.isAuthorizedFor(activityId, username, 'get', call)
            .then(function (isAuthorized) {
                if (isAuthorized) {
                    return gameplays.getAttempts(activityId, ofUser);
                }
                throw {
                    status: 401,
                    message: 'Collaborator not authorized for this activity'
                };
            });
    };

    var minTypes = {
        put: {
            ':activityId': 'assistant'
        },
        remove: {
            ':activityId': 'assistant',
            ':activityId/remove': 'assistant'
        },
        get: {
            'attempts': 'assistant',
            'attempts/my': 'student',
            'attempts/:id': 'assistant'
        }
    };

    activities.isAuthorizedFor = function(activityId, username, method, call) {
        var minType = minTypes[method][call];
        var ignoreStudents = minType !== 'student';
        var ignoreAssistants = ignoreStudents && minType !== 'assistant';

        return activities.findById(activityId).then(function (activity) {
            if (activity) {
                var typeComp = function (type) {
                    return getBestType(minType, type) === type;
                };
                if (activity.groupings && activity.groupings.length > 0) {
                    return groupings.getUserTypeForArray(activity.groupings, username, ignoreStudents, ignoreAssistants).then(typeComp);
                }
                if (activity.groups && activity.groups.length > 0) {
                    return groups.getUserTypeForArray(activity.groups, username, ignoreStudents, ignoreAssistants).then(typeComp);
                }
                return classes.getUserType(activity.classId, username).then(typeComp);
            }
        });
    };

    function getBestType(type1, type2) {
        if (type1 === 'teacher' || type2 === 'teacher') {
            return 'teacher';
        }
        if (type1 === 'assistant' || type2 === 'assistant') {
            return 'assistant';
        }
        if (type1 === 'student' || type2 === 'student') {
            return 'student';
        }
        return 'unauthorized';
    }

    return activities;
})();