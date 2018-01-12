'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var db = require('./db');
    var utils = require('./utils');
    var classes = new Collection(db, 'classes');
    var activityCollection = new Collection(db, 'activities');

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
        return classes.insert({
            name: name,
            created: new Date(),
            participants: {
                teachers: [username],
                students: [],
                assistants: []
            }
        });
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
                
                if (add) {
                    if (body.name && typeof body.name === 'string') {
                        update.$set = {};
                        update.$set.name = body.name;
                    }
                }

                return classes.findAndUpdate(classId, update);
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