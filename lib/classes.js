'use strict';

module.exports = (function () {
    var Q = require('q');
    var Collection = require('easy-collections');
    var async = require('async');
    var db = require('./db');
    var utils = require('./utils');
    var classes = new Collection(db, 'classes');
    var courses = new Collection(db, 'courses');
    var groups = require('./groups');
    var groupings = require('./groupings');
    var activityCollection = new Collection(db, 'activities');

    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var classSchema = {
        id: '/Class',
        type: 'object',
        properties: {
            name: { type: 'string'},
            created: { type: 'date'},
            courseId: { anyOf: [
                {
                    type: 'ID'
                },
                {
                    type: 'null'
                }]
            },
            groups: {
                type: 'array',
                items: {type: 'ID'}
            },
            groupings: {
                type: 'array',
                items: {type: 'ID'}
            },
            participants: {
                type: 'object',
                properties: {
                    students: {
                        type: 'array',
                        required: true,
                        items: {type: 'string'}
                    },
                    assistants: {
                        type: 'array',
                        required: true,
                        items: {type: 'string'}
                    },
                    teachers: {
                        type: 'array',
                        required: true,
                        items: {type: 'string'}
                    }
                }
            },
            externalId: {
                type: 'array',
                required: false,
                items: {
                    type: 'object',
                    properties: {
                        domain: {
                            type: 'string',
                            required: true
                        },
                        id: {
                            type: 'string',
                            required: true
                        }
                    }
                }
            }
        },
        required: ['name', 'created', 'groups', 'groupings'],
        additionalProperties: false
    };
    v.addSchema(classSchema, '/ClassSchema');

    var classSchemaPut = {
        id: '/ClassPut',
        type: 'object',
        properties: {
            name: { type: 'string'},
            courseId: { anyOf: [
                {
                    type: 'ID'
                },
                {
                    type: 'null'
                }]
            },
            groups: {
                type: 'array',
                items: {type: 'ID'}
            },
            groupings: {
                type: 'array',
                items: {type: 'ID'}
            },
            participants: {
                type: 'object',
                properties: {
                    students: { anyOf: [
                        {
                            type: 'array',
                            items: {type: 'string'}
                        },
                        {
                            type: 'string'
                        }
                    ]},
                    assistants: { anyOf: [
                        {
                            type: 'array',
                            items: {type: 'string'}
                        },
                        {
                            type: 'string'
                        }
                    ]},
                    teachers: { anyOf: [
                        {
                            type: 'array',
                            items: {type: 'string'}
                        },
                        {
                            type: 'string'
                        }
                    ]}
                }
            },
            externalId: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        domain: {
                            type: 'string',
                            required: true
                        },
                        id: {
                            type: 'string',
                            required: true
                        }
                    }
                }
            }
        },
        additionalProperties: false,
        minProperties: 1
    };
    v.addSchema(classSchemaPut, '/ClassPut');

    classes.sort = {
        _id: -1
    };



    var minTypes = {
        post: {
            '/classes/': {
                type: 'teacher',
                error: 'Not authorized create a new class'
            },
            '/activities/': {
                type: 'teacher',
                error: 'Not authorized create a new activity for this class'
            },
            '/activities/bundle': {
                type: 'teacher',
                error: 'Not authorized create a new activity for this class'
            },
            '/classes/:classId/groups': {
                type: 'teacher',
                error: 'Not authorized create a new group for this class'
            },
            '/classes/:classId/groupings': {
                type: 'teacher',
                error: 'Not authorized create a new grouping for this class'
            }
        },
        get: {
            '/classes/': {
                type: 'admin',
                error: 'Not authorized to get all the classes'
            },
            '/classes/my': {
                type: 'student',
                error: 'Not authorized to get your classes'
            },
            '/classes/:classId': {
                type: 'student',
                error: 'Not authorized to get this class'
            },
            '/classes/:classId/activities': {
                type: 'assistant',
                error: 'Not authorized to get all the activities for the class'
            },
            '/classes/:classId/activities/my': {
                type: 'student',
                error: 'Not authorized to get your activities for this class'
            },
            '/classes/:classId/groups': {
                type: 'student',
                error: 'Not authorized to get all the groups for this class'
            },
            '/classes/:classId/groupings': {
                type: 'student',
                error: 'Not authorized to get all the groupings for this class'
            }
        },
        put: {
            '/classes/:classId': {
                type: 'teacher',
                error: 'Not authorized to modify this class'
            },
            '/classes/:classId/remove': {
                type: 'teacher',
                error: 'Not authorized to modify (remove) this class'
            }
        },
        delete: {
            '/classes/:classId': {
                type: 'teacher',
                error: 'Not authorized to delete this class'
            }
        }
    };

    classes.isAuthorizedFor = function(classId, username, method, call) {
        return isAuthorizedForCommon({ _id: classes.toObjectID(classId) }, username, method, call);
    };

    classes.isAuthorizedForExternal = function(domain, externalId, username, method, call) {
        return isAuthorizedForCommon({ externalId: { $elemMatch: { domain: domain, id: externalId } } }, username, method, call);
    };

    var isAuthorizedForCommon = function(query, username, method, call) {
        var deferred = Q.defer();

        if (!minTypes[method] || !minTypes[method][call] || !minTypes[method][call].type) {
            return 'unauthorized';
        }

        var minType = minTypes[method][call].type;
        var ignoreStudents = minType !== 'student';
        var ignoreAssistants = ignoreStudents && minType !== 'assistant';

        try {
            classes.find(query, true)
                .then(function (classReq) {
                    if (classReq) {
                        var typeComp = function (type) {
                            if (getBestType(minType, type) === type) {
                                deferred.resolve(classReq);
                            } else {
                                deferred.reject({
                                    status: 401,
                                    message: minTypes[method][call].error
                                });
                            }
                        };
                        if (classReq.groupings && classReq.groupings.length > 0) {
                            return groupings.getUserTypeForArray(classReq.groupings, username, ignoreStudents, ignoreAssistants).then(typeComp);
                        }
                        if (classReq.groups && classReq.groups.length > 0) {
                            return groups.getUserTypeForArray(classReq.groups, username, ignoreStudents, ignoreAssistants).then(typeComp);
                        }
                        typeComp(getUserType(classReq, username));
                    } else {
                        deferred.reject({
                            status: 404,
                            message: 'Class not found'
                        });
                    }
                })
            .fail(function(error) {
                deferred.reject(error);
            });
        }catch (exception) {
            deferred.reject(exception);
        }

        return deferred.promise;
    };

    function getBestType(type1, type2) {
        if (type1 === 'admin' || type2 === 'admin') {
            return 'admin';
        }
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

    /**
     * Returns the classes for gameId:versionId
     */
    classes.getClasses = function () {
        return classes.find();
    };
    var extractId = function (object) {
        return object._id;
    };

    var getUserClasses = function (user, otherfilters) {
        otherfilters = otherfilters || {};

        var deferred = Q.defer();
        async.parallel({
            g: function (callback) {
                var r = {groups: [], groupings: []};
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
                    {'participants.teachers': user, groups: {$size: 0}, groupings: {$size: 0}},
                    {'participants.students': user, groups: {$size: 0}, groupings: {$size: 0}},
                    {'participants.assistants': user, groups: {$size: 0}, groupings: {$size: 0}},
                    {groups: {$in: results.g.groups}, groupings: {$size: 0}},
                    {groupings: {$in: results.g.groupings}}
                ]
            };

            for (var i = 0; i < query.$or.length; i++) {
                query.$or[i] = Object.assign(query.$or[i], otherfilters);
            }

            classes.find(query).then(function (classes) {
                deferred.resolve(classes);
            }).fail(function (err) {
                deferred.reject(err);
            });
        });

        return deferred.promise;
    };

    /**
     * Returns the classes where a user participates
     */
    classes.getUserClasses = function (user) {
        return getUserClasses(user);
    };


    /**
     * Creates a new class for the given gameId:versionId.
     * @Returns a promise with the class created
     */
    classes.createClass = function (username, name) {
        var classObj = {
            name: name,
            created: new Date(),
            participants: {
                teachers: [username],
                students: [],
                assistants: []
            },
            groups: [],
            groupings: [],
            externalId: []
        };

        var validationObj = v.validate(classObj, classSchema);
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'Course bad format: ' + validationObj.errors[0],
                status: 400
            };
        } else {
            return classes.insert(classObj);
        }
    };

    classes.removeClass = function (classId, username) {
        return classes.findById(classId)
            .then(function (classRes) {
                if (!classRes) {
                    throw {
                        message: 'Class does not exist',
                        status: 400
                    };
                }

                if (!classRes.participants || !classRes.participants.teachers || classRes.participants.teachers.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to delete this class.',
                        status: 401
                    };
                }

                return classes.removeById(classId).then(function (result, err) {
                    if (!err) {
                        return {
                            message: 'Success.'
                        };
                    }
                });
            });
    };

    classes.modifyClass = function (classId, username, body, add) {
        var validationObj = v.validate(body, classSchemaPut);
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'Course bad format: ' + validationObj.errors[0],
                status: 400
            };
        } else {
            return classes.find(classes.toObjectID(classId), true)
                .then(function (classRes) {
                    if (!classRes) {
                        throw {
                            message: 'Class does not exist',
                            status: 400
                        };
                    }

                    if (!classRes.participants || !classRes.participants.teachers || classRes.participants.teachers.indexOf(username) === -1) {
                        throw {
                            message: 'You don\'t have permission to modify this class.',
                            status: 401
                        };
                    }

                    if (body._id) {
                        delete body._id;
                    }

                    if (body.versionId) {
                        delete body.versionId;
                    }

                    if (body.groups) {
                        body.groups = body.groups.map(classes.toObjectID);
                    }

                    if (body.groupings) {
                        body.groupings = body.groupings.map(classes.toObjectID);
                    }

                    var update = {};
                    utils.addToArrayHandler(update, body, 'participants.teachers', add);
                    utils.addToArrayHandler(update, body, 'participants.students', add);
                    utils.addToArrayHandler(update, body, 'participants.assistants', add);

                    utils.addToArrayHandler(update, body, 'groups', add);
                    utils.addToArrayHandler(update, body, 'groupings', add);

                    if (add) {
                        if (body.name && typeof body.name === 'string') {
                            if (!update.$set) {
                                update.$set = {};
                            }
                            update.$set.name = body.name;
                        }
                    }

                    if (body.externalId) {
                        update.$set.externalId = body.externalId;
                    }

                    if (body.courseId === null) {
                        if (!update.$set) {
                            update.$set = {};
                        }
                        update.$set.courseId = undefined;
                        return classes.findAndUpdate(classId, update);
                    }
                    if (body.courseId) {
                        return courses.findById(body.courseId)
                            .then(function (course) {
                                if (!course) {
                                    throw {
                                        message: 'Course does not exist',
                                        status: 400
                                    };
                                }
                                if (!update.$set) {
                                    update.$set = {};
                                }
                                update.$set.courseId = course._id;
                                return classes.findAndUpdate(classId, update);
                            });
                    }
                    return classes.findAndUpdate(classId, update);
                });
        }
    };

    var getUserType = function(classRes, username, ignoreStudents, ignoreAssistants, ignoreTeachers) {
        if (classRes) {
            if (!ignoreTeachers && classRes.participants.teachers.indexOf(username) !== -1) {
                return 'teacher';
            }
            if (!ignoreAssistants && classRes.participants.assistants.indexOf(username) !== -1) {
                return 'assistant';
            }
            if (!ignoreStudents && classRes.participants.students.indexOf(username) !== -1) {
                return 'student';
            }
        }
        return 'unauthorized';
    };

    classes.getUserType = function(classId, username, ignoreStudents, ignoreAssistants, ignoreTeachers) {
        return classes.findById(classId).then(function (classRes) {
            return getUserType(classRes, username, ignoreStudents, ignoreAssistants, ignoreTeachers);
        });
    };

    classes.preRemove(function(_id, next) {
        activityCollection.remove({
            classesId: _id
        }).then(function () {
            next();
        }).fail(function() {
            next();
        });
    });

    return classes;
})();