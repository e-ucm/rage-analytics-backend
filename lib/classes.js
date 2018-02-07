'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var db = require('./db');
    var utils = require('./utils');
    var classes = new Collection(db, 'classes');
    var courses = new Collection(db, 'courses');
    var activityCollection = new Collection(db, 'activities');

    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var classSchema = {
        id: '/Class',
        type: 'object',
        properties: {
            name: { type: 'string'},
            created: { type: 'date'},
            courseId: { type: 'string'},
            groups: {
                type: 'array',
                items: {type: 'string'}
            },
            groupings: {
                type: 'array',
                items: {type: 'string'}
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
            courseId: { type: 'string'},
            groups: {
                type: 'array',
                items: {type: 'string'}
            },
            groupings: {
                type: 'array',
                items: {type: 'string'}
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
            }
        },
        additionalProperties: false,
        minProperties: 1
    };
    v.addSchema(classSchemaPut, '/ClassPut');

    classes.sort = {
        _id: -1
    };

    /**
     * Returns the classes for gameId:versionId
     */
    classes.getClasses = function () {
        return classes.find();
    };


    /**
     * Returns the classes where a user participates
     */
    classes.getUserClasses = function (user) {
        return classes.find({
                $or: [
                    { 'participants.teachers': user},
                    { 'participants.students': user},
                    { 'participants.assistants': user}
                ]
            }
        );
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
            groupings: []
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

                    if (body.courseId === ''){
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
                                update.$set.courseId = body.courseId;
                                return classes.findAndUpdate(classId, update);
                            });
                    }
                    return classes.findAndUpdate(classId, update);
                });
        }
    };

    classes.getUserType = function(classId, username, ignoreStudents, ignoreAssistants, ignoreTeachers) {
        return classes.findOne(classId).then(function (classRes) {
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