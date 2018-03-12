'use strict';

module.exports = (function () {
    var Q = require('q');
    var Collection = require('easy-collections');
    var async = require('async');
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
            name: { type: 'string'},
            allowAnonymous: { type: 'boolean'},
            groups: {
                type: 'array',
                items: {type: 'ID'}
            },
            groupings: {
                type: 'array',
                items: {type: 'ID'}
            },
            visible: { type: 'boolean'}
        },
        additionalProperties: false,
        minProperties: 1
    };
    v.addSchema(activitySchemePut, '/ActivityPut');

    var minTypes = {
        post: {
            '/activities/:activityId/event/:event': {
                type: 'teacher',
                error: 'Not authorized to event this activity'
            }
        },
        put: {
            '/activities/:activityId': {
                type: 'teacher',
                error: 'Not authorized to modify this activity'
            },
            '/activities/:activityId/remove': {
                type: 'teacher',
                error: 'Not authorized to modify (remove) this activity'
            },
            '/activities/:activityId/results/resultId': {
                type: 'teacher',
                error: 'Not authorized to modify this result'
            }
        },
        delete: {
            '/activities/:activityId': {
                type: 'teacher',
                error: 'Not authorized to delete this activity'
            },
            '/activities/data/:activityId': {
                type: 'teacher',
                error: 'Not authorized to delete the data of this activity'
            },
            '/activities/data/:activityId/:user': {
                type: 'teacher',
                error: 'Not authorized to delete this user data'
            }
        },
        get: {
            '/activities/:activityId': {
                type: 'student',
                error: 'Not authorized to get this activity'
            },
            '/activities/:activityId/results': {
                type: 'student',
                error: 'Not authorized to get this activity results'
            },
            '/activities/:activityId/attempts': {
                type: 'assistant',
                error: 'Not authorized to get all attempts for this activity'
            },
            '/activities/:activityId/attempts/my': {
                type: 'student',
                error: 'Not authorized to get your attempts for this activity'
            },
            '/activities/:activityId/attempts/:username': {
                type: 'assistant',
                error: 'Not authorized to get this user attempts'
            }
        }
    };

    activities.isAuthorizedFor = function(activityId, username, method, call) {
        var deferred = Q.defer();

        if (!minTypes[method] || !minTypes[method][call] || !minTypes[method][call].type) {
            return 'unauthorized';
        }

        var minType = minTypes[method][call].type;
        var ignoreStudents = minType !== 'student';
        var ignoreAssistants = ignoreStudents && minType !== 'assistant';

        activities.findById(activityId).then(function (activity) {
            if (activity) {
                var typeComp = function (type) {
                    if (getBestType(minType, type) === type) {
                        deferred.resolve(activity);
                    } else {
                        deferred.reject({
                            status: 401,
                            message: minTypes[method][call].error
                        });
                    }
                };
                if (activity.groupings && activity.groupings.length > 0) {
                    return groupings.getUserTypeForArray(activity.groupings, username, ignoreStudents, ignoreAssistants).then(typeComp);
                }
                if (activity.groups && activity.groups.length > 0) {
                    return groups.getUserTypeForArray(activity.groups, username, ignoreStudents, ignoreAssistants).then(typeComp);
                }
                return classes.getUserType(activity.classId, username).then(typeComp);
            }
            deferred.reject({
                status: 404,
                message: 'Activity not found'
            });
        });
        return deferred.promise;
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

    var extractId = function (object) {
        return object._id;
    };

    var getUserActivities = function (user, otherfilters) {
        otherfilters = otherfilters || {};

        var deferred = Q.defer();
        async.parallel({
            classes: function (callback) {
                return classes.getUserClasses(user)
                    .then(function (classes) {
                        callback(null, classes.map(extractId));
                    }).fail(callback);
            },
            g: function (callback) {
                var r = { groups: [], groupings: [] };
                return groups.getUserGroups(user)
                    .then(function (groups) {
                        r.groups = groups.map(extractId);
                        if (r.groups.length > 0) {
                            return groupings.getGroupGroupings(r.groups)
                                .then(function (groupings) {
                                    r.groupings = groupings.map(extractId);
                                    return callback(null, r);
                                }).fail(callback);
                        }
                        return callback(null, r);
                    }).fail(callback);
            }
        }, function (err, results) {
            if (err) {
                return deferred.reject(err);
            }
            var query = {
                $or: [
                    { classId: { $in: results.classes }, groups: { $size: 0 }, groupings: { $size: 0 } },
                    { groups: { $in: results.g.groups }, groupings: { $size: 0 } },
                    { groupings: { $in: results.g.groupings } }
                ]
            };

            for (var i = 0; i < query.$or.length; i++) {
                query.$or[i] = Object.assign(query.$or[i], otherfilters);
            }

            activities.find(query).then(function (activities) {
                deferred.resolve(activities);
            }).fail(function (err) {
                deferred.reject(err);
            });
        });

        return deferred.promise;
    };

    /**
     * Returns the activities where a user participates
     */
    activities.getUserActivities = function (user) {
        return getUserActivities(user);
    };

    /**
     * Returns the activities for a game (and version) where a user participates
     */
    activities.getUserActivitiesByGame = function (gameId, versionId, user) {
        gameId = activities.toObjectID(gameId);
        versionId = activities.toObjectID(versionId);
        return getUserActivities(user, { gameId: gameId, versionId: versionId });
    };

    /**
     * Returns the activities for a class where a user participates
     */
    activities.getUserActivitiesByClass = function (classId, user) {
        classId = activities.toObjectID(classId);
        return getUserActivities(user, { classId: classId });
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
                groups: result.class.groups,
                groupings: result.class.groupings,
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
    activities.startActivity = function (activityId) {
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
                        return activities.findAndUpdate(activityId, { $set: { open: true } });
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
    activities.endActivity = function (activityId) {
        return activities.findById(activityId).then(function (activity) {
            if (!activity) {
                throw {
                    message: 'Activity does not exist',
                    status: 400
                };
            }

            return activities.findAndModify(activityId, {end: new Date(), open: false})
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

    activities.modifyActivity = function (activityId, body, add) {

        return activities.find(activities.toObjectID(activityId), true)
            .then(function (activity) {
                if (!activity) {
                    throw {
                        message: 'Activity does not exist',
                        status: 400
                    };
                }

                var validationObj = v.validate(body, activitySchemePut);
                if (validationObj.errors && validationObj.errors.length > 0) {
                    throw {
                        message: 'Activity bad format: ' + validationObj.errors[0],
                        status: 400
                    };
                }

                if (body.groups) {
                    body.groups = body.groups.map(classes.toObjectID);
                }

                if (body.groupings) {
                    body.groupings = body.groupings.map(classes.toObjectID);
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
    };

    activities.preRemove(function(_id, next) {
        var activityId = _id.toString();
        db.collection('gameplays_' + activityId).drop();
        next();
    });

    activities.removeActivity = function (activityId) {
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
                        message: 'You must end the activity before deleting it',
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

    activities.getAttempts = function (activityId) {
        return gameplays.getAttempts(activityId);
    };

    activities.getUserAttempts = function (activityId, ofUser) {
        return gameplays.getAttempts(activityId, ofUser);
    };

    return activities;
})();