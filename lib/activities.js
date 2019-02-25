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
    var kibana = require('./kibana/kibana');
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
            offline: { type: 'boolean'},
            name: { type: 'string'},
            gameId: { type: 'ID'},
            versionId: { type: 'ID'},
            classId: { type: 'ID'},
            rootId: { type: 'ID', required: false},
            parentId: { type: 'ID', required: false},
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
            visible: { type: 'boolean'},
            classBond: { type: 'boolean'}
        },
        required: ['name', 'classId', 'allowAnonymous',
            'groups', 'groupings', 'created', 'open', 'visible', 'offline'],
        additionalProperties: false
    };
    v.addSchema(activityScheme, '/Activity');

    var activitySchemePut = {
        id: '/ActivityPut',
        type: 'object',
        properties: {
            name: { type: 'string'},
            offline: { type: 'boolean'},
            allowAnonymous: { type: 'boolean'},
            groups: {
                type: 'array',
                items: { type: 'ID'}
            },
            groupings: {
                type: 'array',
                items: { type: 'ID'}
            },
            visible: { type: 'boolean'},
            parentId: { type: 'ID' },
            rootId: { type: 'ID' }
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
            },
            '/collector/start/:trackingCode': {
                type: function(activity) {
                    return activity.allowAnonymous ? 'unauthorized' : 'student';
                },
                error: 'Not authorized to join this activity'
            },
            '/collector/track': {
                type: function(activity) {
                    return activity.allowAnonymous ? 'unauthorized' : 'student';
                },
                error: 'Not authorized to send traces to this activity'
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
            deferred.reject({
                status: 400,
                message: 'Permission definition not found for this class'
            });
            return deferred.promise;
        }

        var minType = minTypes[method][call].type;
        var ignoreStudents = minType !== 'student';
        var ignoreAssistants = ignoreStudents && minType !== 'assistant';

        activities.findById(activityId).then(function (activity) {
            if (activity) {
                if (typeof minType === 'function') {
                    minType = minType(activity);
                }
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
    activities.createActivity = function (gameId, versionId, classId, username, name, rootId, parentId, offline, classBond, allowAnonymous, esClient) {
        return getGameVersionAndClass(gameId, versionId, classId).then(function (result) {
            var deferred = Q.defer();

            if (!name) {
                name = 'new Activity';
            }

            var activityObj = {
                name: name,
                gameId: result.game._id,
                versionId: result.version._id,
                classId: result.class._id,
                rootId: rootId,
                offline: offline,
                groups: result.class.groups,
                groupings: result.class.groupings,
                created: new Date(),
                open: false,
                visible: false,
                allowAnonymous: allowAnonymous,
                classBond: classBond
            };

            var validationObj = v.validate(activityObj, activityScheme);
            if (validationObj.errors && validationObj.errors.length > 0) {
                throw {
                    message: 'Activity bad format: ' + validationObj.errors[0],
                    status: 400
                };
            } else {
                activities.insert(activityObj)
                    .then(function(activity) {
                        activities.setParent(activity._id, parentId, esClient)
                            .then(function() {
                                deferred.resolve(activity);
                            })
                            .fail(function(error) {
                                deferred.reject(error);
                            });
                    })
                    .fail(function(error) {
                        deferred.reject(error);
                    });
            }

            return deferred.promise;
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

    activities.modifyActivity = function (activityId, body, add, esClient) {

        return activities.find(activities.toObjectID(activityId), true)
            .then(function (activity) {
                if (!activity) {
                    throw {
                        message: 'Activity does not exist',
                        status: 400
                    };
                }

                var deferred = Q.defer();
                var prepromise = null;

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

                    if (body.parentId && body.parentId !== null) {
                        prepromise = activities.setParent(activity._id, body.parentId, esClient);

                        if (!update.$set) {
                            update.$set = {};
                        }

                        update.$set.parentId = activities.toObjectID(body.parentId);
                    }
                }else {
                    if (typeof body.parentId !== 'undefined') {
                        prepromise = activities.setParent(activity._id, body.parentId, esClient);

                        if (!update.$unset) {
                            update.$unset = {};
                        }

                        update.$unset.parentId = '';
                    }
                    if (typeof body.rootId !== 'undefined') {
                        if (!update.$unset) {
                            update.$unset = {};
                        }

                        update.$unset.rootId = '';
                    }
                }

                var updateFunction = function() {
                    if (Object.keys(update).length > 0) {
                        console.log('find and update ' + activityId + ' ' + JSON.stringify(update, null, 4));
                        activities.findAndUpdate(activityId, update)
                            .then(function(result) {
                                deferred.resolve(result);
                            })
                            .fail(function(error) {
                                deferred.reject(error);
                            });
                    }else {
                        deferred.reject({
                            message: 'Nothing to update',
                            status: 400
                        });
                    }
                };

                if (prepromise) {
                    prepromise
                        .then(function(result) {
                            updateFunction();
                        })
                        .fail(function(error) {
                            console.info(error);
                            deferred.reject(error);
                        });
                }else {
                    updateFunction();
                }

                return deferred.promise;
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

    activities.createRequiredStorage = function(config, activity, user, esClient) {
        var deferred = Q.defer();
        console.log('Activities.kibana.createIndex() -> Started');

        if (activity.rootId && activity.rootId !== '') {
            console.log('Activities.createRequiredStorage() -> Just adding the IndexObject!');
            kibana.getIndexObject(activity._id.toString(), esClient)
                .then(function(indexObject) { return kibana.insertIndexObject(activity.rootId, indexObject, esClient); })
                .then(function() {
                    console.log('Activities.createRequiredStorage() -> Success, resolving!');
                    return deferred.resolve();
                })
                .catch(function(error) {
                    console.log('Activities.createRequiredStorage() -> ERROR!');
                    return deferred.reject(error);
                });
        } else {
            kibana.createIndex(config, activity._id.toString(), activity.gameId, user, esClient)
                .then(function(ret) {
                    console.log('Activities.createRequiredStorage() -> Success, resolving!');
                    return deferred.resolve(ret);
                })
                .fail(function(error) {
                    console.log('Activities.createRequiredStorage() -> ERROR!');
                    return deferred.reject(error);
                });
        }

        return deferred.promise;
    };

    activities.setParent = function (activityId, parentId, esClient) {
        var deferred = Q.defer();
        console.log('Activities.setParent(' + activityId + ', ' + parentId + ') -> Started!');

        var switchParent = function(activity, originalParent, newParent) {
            activities.switchParent(activity, originalParent, newParent, esClient)
                .then(function(result) {
                    console.log('Activities.setParent(' + activityId + ', ' + parentId + ') -> Completed!');
                    deferred.resolve(result);
                })
                .fail(function(error) {
                    console.log('Activities.setParent(' + activityId + ', ' + parentId + ') -> ERROR');
                    deferred.reject(error);
                });
        };

        if (parentId && activityId.toString() === parentId.toString()) {
            deferred.reject({
                message: 'Can not set an activity as its own parent.',
                status: 400
            });
        } else {
            activities.findById(activityId)
                .then(function (activity) {
                    if (!activity) {
                        return deferred.reject({
                            message: 'Activity does not exist',
                            status: 400
                        });
                    }

                    if (activity.rootId && activity.rootId.toString() === activity._id.toString()) {
                        return deferred.reject({
                            message: 'Can not change the parent of a root activity.',
                            status: 400
                        });
                    }

                    if (activity.parentId) {
                        activities.findById(activity.parentId)
                            .then(function(originalParent) {
                                if (parentId) {
                                    activities.findById(parentId)
                                        .then(function(newParent) {
                                            console.log('Activities.setParent(' + activityId + ', ' + parentId + ') -> 11!');
                                            switchParent(activity, originalParent, newParent);
                                        });
                                }else {
                                    console.log('Activities.setParent(' + activityId + ', ' + parentId + ') -> 10!');
                                    switchParent(activity, originalParent, null);
                                }
                            });
                    } else {
                        if (parentId) {
                            activities.findById(parentId)
                                .then(function(newParent) {
                                    console.log('Activities.setParent(' + activityId + ', ' + parentId + ') -> 01');
                                    switchParent(activity, null, newParent);
                                });
                        }else {
                            console.log('Activities.setParent(' + activityId + ', ' + parentId + ') -> 00!');
                            deferred.resolve();
                        }
                    }
                });
        }

        return deferred.promise;
    };

    activities.switchParent = function(child, originalParent, newParent, esClient) {
        console.log('Activities.switchParent() -> Started!');
        var deferred = Q.defer();

        var setRootId = function(rootActivity) {
            console.log('Activities.switchParent() -> setting RootId');
            activities.setRoot(child, rootActivity ? (rootActivity.rootId ? rootActivity.rootId : rootActivity._id) : null, esClient)
                .then(function() {
                    console.log('Activities.switchParent() -> Completed!');
                    deferred.resolve();
                })
                .fail(function(error) {
                    console.log('Activities.switchParent() -> Error!');
                    deferred.resolve(error);
                });
        };

        var setNewParent = function() {
            console.log('Activities.switchParent() -> setting newParent');
            if (newParent) {
                activities.relate(newParent, child, esClient)
                    .then(function() {
                        console.log('Activities.switchParent() -> related');
                        setRootId(newParent);
                    })
                    .fail(function(error) {
                        console.log('Activities.switchParent() -> not related');
                        deferred.reject(error);
                    });
            }else {
                console.log('Activities.switchParent() -> setting newParent -> Noparent');
                setRootId(null);
            }
        };

        if (originalParent) {
            activities.unrelate(originalParent, child, esClient)
                .then(function() {
                    setNewParent();
                })
                .fail(function(error) {
                    deferred.reject(error);
                });
        }else {
            setNewParent();
        }

        return deferred.promise;
    };

    activities.relate = function(parent, child, esClient) {
        console.log('Activities.relate() -> Started');
        var deferred = Q.defer();

        var mainFunction = function() {
            activities.setRoot(child, parent.rootId, esClient)
                .then(function() {
                    child.rootId = parent.rootId;
                    activities.addParentToChildMultiLevel(parent, child, esClient)
                        .then(function() {
                            activities.addChildToParentMultiLevel(parent, child, esClient)
                                .then(function() {
                                    console.log('Activities.relate() -> completed');
                                    deferred.resolve();
                                })
                                .fail(function(error) {
                                    console.log('Activities.relate() -> ERROR');
                                    deferred.reject(error);
                                });
                        })
                        .fail(function(error) {
                            console.log('Activities.relate() -> ERROR');
                            deferred.reject(error);
                        });
                })
                .fail(function(error) {
                    deferred.reject(error);
                });

        };

        if (!parent.rootId) {
            console.log('Activities.relate() -> Setting Parent Root');
            activities.setRoot(parent, parent._id, esClient)
                .then(function() {
                    parent.rootId = parent._id;
                    mainFunction();
                })
                .fail(function(error) {
                    console.log('Activities.relate() -> ERROR');
                    deferred.reject(error);
                });
        }else {
            mainFunction();
        }

        return deferred.promise;
    };

    activities.unrelate = function(parent, child, esClient) {
        console.log('Activities.unrelate() -> Started');
        var deferred = Q.defer();

        var unrelate = function() {
            activities.deleteMultiLevelObject(child, esClient)
                .then(function() {
                    activities.removeChildFromParentMultiLevel(parent, child, esClient)
                    .then(function() {
                        console.log('Activities.unrelate() -> completed');
                        deferred.resolve();
                    })
                    .fail(function(error) {
                        console.log('Activities.unrelate() -> ERROR');
                        deferred.reject(error);
                    });
                })
                .fail(function(error) {

                    console.log('Activities.unrelate() -> ERROR');
                    deferred.reject(error);
                });
        };

        activities.getMultiLevelObject(child, esClient)
            .then(function(mlobject) {
                console.info(mlobject);
                console.log('Activities.unrelate() -> Checking if children.');
                if (!mlobject.children || mlobject.children.length <= 0) {
                    unrelate();
                }else {
                    deferred.reject({message: 'Unable to change the parent of a node that have childs', status: 400});
                }
            })
            .fail(function(error) {
                deferred.reject(error);
            });


        return deferred.promise;
    };

    activities.addParentToChildMultiLevel = function(parent, child, esClient) {
        console.log('Activities.addParentToChildMultiLevel() -> Started');
        var deferred = Q.defer();

        activities.getMultiLevelObject(child, esClient)
            .then(function(mlobject) {
                mlobject.parentId = parent._id.toString();

                activities.setMultiLevelObject(child, mlobject, esClient)
                    .then(function() {
                        deferred.resolve();
                    })
                    .fail(function(error) {
                        deferred.reject(error);
                    });

            })
            .fail(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    activities.addChildToParentMultiLevel = function(parent, child, esClient) {
        console.log('Activities.addChildToParentMultiLevel() -> Started');
        var deferred = Q.defer();

        activities.getMultiLevelObject(parent, esClient)
            .then(function(mlobject) {
                console.info(mlobject);

                if (mlobject.children) {
                    if (!mlobject.children.includes(child._id.toString())) {
                        mlobject.children.push(child._id.toString());
                    }
                }else {
                    mlobject.children = [child._id.toString()];
                }

                activities.setMultiLevelObject(parent, mlobject, esClient)
                    .then(function() {
                        deferred.resolve();
                    })
                    .fail(function(error) {
                        deferred.reject(error);
                    });

            })
            .fail(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    activities.removeChildFromParentMultiLevel = function(parent, child, esClient) {
        console.log('Activities.removeChildFromParentMultiLevel() -> Started');
        var deferred = Q.defer();

        activities.getMultiLevelObject(parent, esClient)
            .then(function(mlobject) {
                if (mlobject.children) {
                    var index = mlobject.children.indexOf(child._id.toString());
                    if (index > -1) {
                        mlobject.children.splice(index, 1);
                    }
                }

                if (!mlobject.parentId && mlobject.children.length == 0) {
                    activities.deleteMultiLevelIndex(parent, esClient)
                        .then(function() {
                            activities.setRoot(parent, null, esClient)
                                .then(function() {
                                    parent.rootId = null;
                                    deferred.resolve();
                                })
                                .fail(function(error) {
                                    deferred.reject(error);
                                });
                        })
                        .fail(function(error) {
                            deferred.reject(error);
                        });
                }else {
                    activities.setMultiLevelObject(parent, mlobject, esClient)
                        .then(function() {
                            deferred.resolve();
                        })
                        .fail(function(error) {
                            deferred.reject(error);
                        });
                }
            })
            .fail(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    activities.getMultiLevelObject = function(activity, esClient) {
        console.log('Activities.getMultiLevelObject() -> Started');
        var deferred = Q.defer();

        if (activity.rootId) {
            esClient.search({
                size: 200,
                from: 0,
                index: 'analytics-' + activity.rootId.toString(),
                type: 'analytics',
                q: '_id:' + activity._id.toString()
            }, function (error, response) {
                if (error) {
                    console.log('Activities.getMultiLevelObject() -> error, continue anyway');
                    deferred.resolve({children: []});
                }else {
                    if (response.hits && response.hits.hits && response.hits.hits.length) {
                        deferred.resolve(response.hits.hits[0]._source);
                    }else {
                        deferred.resolve({children: []});
                    }
                }
            });
        }else {
            console.log('Activities.getMultiLevelObject() -> NO ROOT');
            deferred.resolve({children: []});
        }

        return deferred.promise;
    };

    activities.setMultiLevelObject = function(activity, mlobject, esClient) {
        console.log('Activities.setMultiLevelObject() -> Started');
        var deferred = Q.defer();

        console.log('Activities.setMultiLevelObject() -> ADDING to analytics-' + activity.rootId.toString());
        esClient.index({
            index: 'analytics-' + activity.rootId.toString(),
            type: 'analytics',
            id: activity._id.toString(),
            body: JSON.stringify(mlobject)
        }, function (error, response) {
            if (error) {
                console.log('Activities.setMultiLevelObject() -> ERROR');
                deferred.reject(error);
            }else {
                console.log('Activities.setMultiLevelObject() -> Completed!');
                deferred.resolve();
            }
        });

        return deferred.promise;
    };

    activities.deleteMultiLevelObject = function(activity, esClient) {
        console.log('Activities.deleteMultiLevelObject() -> Started');
        var deferred = Q.defer();

        esClient.delete({
            index: 'analytics-' + activity.rootId.toString(),
            type: 'analytics',
            id: activity._id.toString()
        }, function (error, response) {
            if (error) {
                console.log('Activities.deleteMultiLevelObject() -> ERROR');
                console.info(error);
                deferred.reject(error);
            } else {
                console.log('Activities.deleteMultiLevelObject() -> Completed!');
                deferred.resolve();
            }
        });

        return deferred.promise;
    };

    activities.deleteMultiLevelIndex = function(activity, esClient) {
        console.log('Activities.deleteMultiLevelIndex() -> Started');
        var deferred = Q.defer();

        esClient.indices.delete({
            index: 'analytics-' + activity.rootId.toString()
        }, function (error, response) {
            if (error) {
                deferred.reject(error);
            }else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    };

    activities.setRoot = function(activity, rootId, esClient) {
        console.log('Activities.setRoot() -> Started');
        return activities.findAndModify(activity._id, { rootId: rootId });
    };

    var getGameVersionAndClass = function (gameId, versionId, classId) {
        if (gameId && versionId) {
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
        }
        return classes.findById(classId).then(function (classRes) {
            if (!classRes) {
                throw {
                    message: 'Class does not exist',
                    status: 400
                };
            }
            return {
                game: {},
                version: {},
                class: classRes
            };
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

    activities.offspring = function (activityId) {
        return activities.find({rootId: activities.toObjectID(activityId)}, false);
    };

    activities.children = function (activityId) {
        return activities.find({parentId: activities.toObjectID(activityId)}, false);
    };

    return activities;
})();