'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var groups = require('../lib/groups');

var ObjectID = require('mongodb').ObjectID;

/**
 * @api {get} /classes/:id/groups Return a list of the current groups
 * @apiName GetGroups
 * @apiGroup Groups
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [{
 *          "_id": "559a447831b76cec185bf501",
 *          "name": "Group1",
 *          "classId": "559a447831b76cec185bf501",
 *          "participants": {
 *              "assistants": ["Assistant1"]
 *              "teachers": ["Teacher1"]
 *              "students": ["Student1", "Student2"]
 *            }
 *      }, {
 *          "_id": "559a447831b76cec185bf502",
 *          "name": "Group2",
 *          "classId": "559a447831b76cec185bf501",
 *          "participants": {
 *              "assistants": ["Assistant1"]
 *              "teachers": ["Teacher2"]
 *              "students": ["Student3", "Student4"]
 *           }
 *      }]
 *
 */
router.get('/:id/groups', function (req, res) {
    restUtils.processResponse(groups.find({classId: new ObjectID(req.params.id)}), res);
});

/**
 * @api {get} /classes/groups/:id Returns a given group.
 * @apiName GetCourses
 * @apiGroup Courses
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf501",
 *          "name": "Group",
 *          "classId": "559a447831b76cec185bf501",
 *          "participants": {
 *              "assistants": ["Assistant"]
 *              "teachers": ["Teacher"]
 *              "students": ["Student1", "Student2"]
 *           }
 *      }
 *
 */
router.get('/groups/:id', restUtils.findById(groups));

/**
 * @api {post} /classes/:id/groups Creates new Group.
 * @apiName PostGroups
 * @apiGroup Groups
 *
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "Name",
 *          "classId": "559a447831b76cec185bf501",
 *          "participants": {
 *              "assistants": ["Assistant1"]
 *              "teachers": ["Teacher1"]
 *              "students": ["Student1", "Student2", "Student3"]
 *          }
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf501",
 *          "name": "Name",
 *          "classId": "559a447831b76cec185bf501",
 *          "participants": {
 *              "assistants": ["Assistant1"]
 *              "teachers": ["Teacher1"]
 *              "students": ["Student1", "Student2", "Student3"]
 *          }
 *      }
 *
 */
router.post('/:id/groups', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(groups.createGroup(username, req.params.id, req.body), res);
});

/**
 * @api {put} /classes/groups/:id Changes the name of a group and the participants.
 * @apiName PutCourses
 * @apiGroup Courses
 *
 * @apiParam {String} id The id of the course.
 * @apiParam {String} [name] The new name for the group
 * @apiParam {String[]} [participants.teachers] Array with the username of the teachers that you want add to the group.
 * @apiParam {String[]} [participants.assistants] Array with the username of the assistants that you want add to from the group.
 * @apiParam {String[]} [participants.students] Array with the username of the students that you want add to group.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "New Name",
 *          "participants": {
 *              "teachers": ["Teacher23"]
 *          }
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf511",
 *          "name": "New Name",
 *          "classId": "559a447831b76cec185bf501",
 *          "participants": {
 *              "assistants": ["Assistant1"]
 *              "teachers": ["Teacher1", "Teacher23"]
 *              "students": ["Student1", "Student2", "Student3"]
 *          }
 *      }
 */
router.put('/groups/:id', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(groups.modifyGroup(req.params.id, username, req.body, true), res);
});

/**
 * @api {put} /classes/groups/:id/remove Removes participants from a group.
 * @apiName PutCourse
 * @apiGroup Course
 *
 * @apiParam {String} id The id of the course.
 * @apiParam {String[]} [participants.teachers] Array with the username of the teachers that you want to remove from the group.
 * @apiParam {String[]} [participants.assistants] Array with the username of the assistants that you want to remove from the group.
 * @apiParam {String[]} [participants.students] Array with the username of the students that you want to remove from the group.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "teachers": ["Teacher1"],
 *          "assistants": ["Assistant1"]
 *      }
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf511",
 *          "title": "My Course",
 *          "teachers": [Teacher],
 *          "assistants": ["Some Assistant"],
 *      }
 */
router.put('/groups/:id/remove', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(groups.modifyGroup(req.params.id, username, req.body, false), res);
});

/**
 * @api {delete} /classes/groups/:id Deletes a group
 * @apiName DeleteGroup
 * @apiGroup Group
 *
 * @apiParam {String} id The id of the group.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "message": "Success."
 *      }
 */
router.delete('/groups/:id', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(groups.removeGroups(req.params.id, username), res);
});

module.exports = router;