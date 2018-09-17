'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var db = require('./db');
    var utils = require('./utils');
    var courses = new Collection(db, 'courses');
    var classes = new Collection(db, 'classes');

    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var courseSchema = {
        id: '/Course',
        type: 'object',
        properties: {
            title: { type: 'string'},
            teachers: {
                type: 'array',
                items: {type: 'string'}
            },
            assistants: {
                type: 'array',
                items: {type: 'string'}
            }
        },
        required: ['title'],
        additionalProperties: false
    };
    v.addSchema(courseSchema, '/CourseSchema');

    var participantsCourseSchema = {
        id: '/ParticipantsCourseSchema',
        type: 'object',
        properties: {
            teachers: {
                type: 'array',
                items: {type: 'string'}
            },
            assistants: {
                type: 'array',
                items: {type: 'string'}
            }
        },
        additionalProperties: false,
        minProperties: 1,
        maxProperties: 2
    };
    v.addSchema(participantsCourseSchema, '/ParticipantsCourseSchema');

    courses.sort = {
        _id: -1
    };

    /**
     * Returns the courses
     */
    courses.getCourses = function () {
        return courses.find();
    };

    /**
     * Creates a new course.
     * @Returns a promise with the course created
     */
    courses.createCourse = function (username, course) {
        course.teachers = [username];
        var validationObj = v.validate(course, courseSchema);
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'Course bad format: ' + validationObj.errors[0],
                status: 400
            };
        }
        return courses.insert(course);
    };

    courses.modifyCourse = function (id, username, body, add) {
        var validationObj = v.validate(body, courseSchema);
        validationObj = validationObj.errors.length > 0 ? v.validate(body, participantsCourseSchema): validationObj;
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'Course bad format: ' + validationObj.errors[0],
                status: 400
            };
        }
        return courses.find(courses.toObjectID(id), true)
            .then(function (course) {
                if (!course) {
                    throw {
                        message: 'Course does not exist',
                        status: 400
                    };
                }

                if (!course.teachers || course.teachers.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to modify this course.',
                        status: 401
                    };
                }

                if (body._id) {
                    delete body._id;
                }

                var update = {};
                utils.addToArrayHandler(update, body, 'teachers', add);
                utils.addToArrayHandler(update, body, 'assistants', add);

                if (add && body.title) {
                    update.$set = {};
                    update.$set.title = body.title;
                }

                return courses.findAndUpdate(id, update);
            });
    };

    courses.removeCourse = function (id, username) {
        return courses.findById(id)
            .then(function (courseRes) {
                if (!courseRes) {
                    throw {
                        message: 'Course does not exist',
                        status: 404
                    };
                }

                if (!courseRes.teachers || courseRes.teachers.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to delete this course.',
                        status: 401
                    };
                }

                return classes.find({courseId: id})
                    .then(function (classesRes) {
                        if (classesRes.length > 0) {
                            classesRes.forEach(function(classObj) {
                                classes.findAndUpdate(classObj._id, {
                                    $set: {courseId: null}
                                });
                            });
                        }

                        return courses.removeById(id).then(function (result, err) {
                            if (!err) {
                                return {
                                    message: 'Success.'
                                };
                            }
                        });
                    });
            });
    };

    return courses;
})();