'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var db = require('./db');
    var utils = require('./utils');
    var groups = new Collection(db, 'groups');
    var groupings = new Collection(db, 'groupings');
    var classes = new Collection(db, 'classes');
    var activities = new Collection(db, 'activities');

    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var groupSchema = {
        id: '/GroupSchema',
        type: 'object',
        properties: {
            name: { type: 'string'},
            classId: { type: 'string'},
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
        required: ['name', 'classId', 'participants'],
        additionalProperties: false
    };
    var participantsGroupSchema = {
        id: '/ParticipantsGroupSchema',
        type: 'object',
        properties: {
            name: { type: 'string'},
            participants: {
                type: 'object',
                properties: {
                    students: {
                        type: 'array',
                        items: {type: 'string'}
                    },
                    assistants: {
                        type: 'array',
                        items: {type: 'string'}
                    },
                    teachers: {
                        type: 'array',
                        items: {type: 'string'}
                    }
                }
            }
        },
        additionalProperties: false,
        minProperties: 1
    };
    v.addSchema(groupSchema, '/GroupSchema');
    v.addSchema(participantsGroupSchema, '/ParticipantsGroupSchema');

    groups.sort = {
        _id: -1
    };

    /**
     * Returns the groups
     */
    groups.getGroups = function (classId) {
        return groups.find({classId: groups.toObjectID(classId)});
    };

    /**
     * Creates a new group.
     * @Returns a promise with the group created
     */
    groups.createGroup = function (username, classId, group) {

        if (group.participants) {
            if (!group.participants.teachers) {
                group.participants.teachers = [];
            }

            if (group.participants.teachers.indexOf(username) < 0) {
                group.participants.teachers.push(username);
            }
        }
        group.classId = classId;

        var validationObj = v.validate(group, groupSchema);
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'Course bad format: ' + validationObj.errors[0],
                status: 400
            };
        } else {
            return groups.insert(group);
        }
    };

    groups.modifyGroup = function (id, username, body, add) {
        var validationObj = v.validate(body, groupSchema);
        validationObj = validationObj.errors.length > 0 ? v.validate(body, participantsGroupSchema): validationObj;
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'Course bad format: ' + validationObj.errors[0],
                status: 400
            };
        } else {
            return groups.find(groups.toObjectID(id), true)
                .then(function (group) {
                    if (!group) {
                        throw {
                            message: 'Group does not exist',
                            status: 400
                        };
                    }

                    if (!group.participants.teachers || group.participants.teachers.indexOf(username) === -1) {
                        throw {
                            message: 'You don\'t have permission to modify this group.',
                            status: 401
                        };
                    }

                    if (body._id) {
                        delete body._id;
                    }

                    var update = {};
                    utils.addToArrayHandler(update, body, 'participants.teachers', add);
                    utils.addToArrayHandler(update, body, 'participants.assistants', add);
                    utils.addToArrayHandler(update, body, 'participants.students', add);

                    if (add && body.name) {
                        update.$set = {};
                        update.$set.name = body.name;
                    }

                    return groups.findAndUpdate(id, update);
                });
        }
    };

    groups.removeGroups = function (id, username) {
        return groups.findById(id)
            .then(function (groupRes) {
                if (!groupRes) {
                    throw {
                        message: 'Course does not exist',
                        status: 404
                    };
                }

                if (!groupRes.participants.teachers || groupRes.participants.teachers.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to delete this class.',
                        status: 401
                    };
                }

                return classes.findById(groupRes.classId).then(function (classObj) {
                    if (classObj.groups && classObj.groups.length > 0) {
                        var updateGroups = {};
                        utils.addToArrayHandler(updateGroups, {groups: [id]}, 'groups', false);
                        classes.findAndUpdate(classObj._id, updateGroups);
                    }

                    return activities.find({classId: groupRes.classId})
                        .then(function (activitiesRes) {
                            if (activitiesRes.length > 0) {
                                activitiesRes.forEach(function(activityObj) {
                                    var updateGroups = {};
                                    utils.addToArrayHandler(updateGroups, {groups: [id]}, 'groups', false);

                                    activities.findAndUpdate(activityObj._id, updateGroups);
                                });
                            }

                            return groupings.find({classId: groupRes.classId})
                                .then(function (groupingsRes) {
                                    if (groupingsRes.length > 0) {
                                        groupingsRes.forEach(function(classObj) {
                                            var updateGroups = {};
                                            utils.addToArrayHandler(updateGroups, {groups: [id]}, 'groups', false);

                                            groupingsRes.findAndUpdate(classObj._id, updateGroups);
                                        });
                                    }

                                    return groups.removeById(id).then(function (result, err) {
                                        if (!err) {
                                            return {
                                                message: 'Success.'
                                            };
                                        }
                                    });
                                });
                        });
                });


            });
    };

    return groups;
})();
