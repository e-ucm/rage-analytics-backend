'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var courses = require('../lib/courses');

/**
 * @api {get} /courses Return a list of the current courses
 * @apiName GetCourses
 * @apiGroup Courses
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [{
 *          "_id": "559a447831b76cec185bf501",
 *          "title": "Course1",
 *          "teachers": ["Teacher"],
 *           "assistants": ["Assistants"]
 *      }, {
 *          "_id": "559a447831b76cec185bf556",
 *          "title": "Course2",
 *          "teachers": ["Teacher"]
 *      }]
 *
 */
router.get('/', restUtils.find(courses));

/**
* @api {get} /courses/:id Returns a given course.
* @apiName GetCourses
* @apiGroup Courses
*
* @apiSuccess(200) Success.
*
* @apiSuccessExample Success-Response:
*      HTTP/1.1 200 OK
*      {
*          "_id": "559a447831b76cec185bf501",
*          "title": "Course1",
*          "teachers": ["Teacher"],
*          "assistants": ["Assistants"]
*      }
*
*/
router.get('/:id', restUtils.findById(courses));

/**
 * @api {post} /courses Creates new Course.
 * @apiName PostCourses
 * @apiGroup Courses
 *
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "title": "New course"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf501",
 *          "title": "New course",
 *          "teachers": ["Teacher"],
 *          "assistants": [],
 *      }
 *
 */
router.post('/', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(courses.createCourse(username, req.body), res);
});

/**
 * @api {put} /courses/:id Changes the title of a course and the assistants and teachers.
 * @apiName PutCourses
 * @apiGroup Courses
 *
 * @apiParam {String} id The id of the course.
 * @apiParam {String} [title] The new title of the course
 * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to remove from the course.
 * @apiParam {String[]} [assistants] Array with the username of the assistants that you want to remove from the course.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "title": "New Title",
 *          "teachers": ["Some Teacher"],
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf511",
 *          "title": "New Title",
 *          "teachers": ["Some Teacher"],
 *          "assistants": [],
 *      }
 */
router.put('/:id', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(courses.modifyCourse(req.params.id, username, req.body, true), res);
});

/**
 * @api {put} /courses/:id/remove Removes teachers and/or assistants from a class.
 * @apiName PutCourse
 * @apiGroup Course
 *
 * @apiParam {String} id The id of the course.
 * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to remove from the course.
 * @apiParam {String[]} [assistants] Array with the username of the assistants that you want to remove from the course.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "teachers": ["Some Teacher"],
 *          "assistants": ["Some Assistant"]
 *      }
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf511",
 *          "title": "My Course",
 *          "teachers": ["Some Teacher"],
 *          "assistants": ["Some Assistant"],
 *      }
 */
router.put('/:id/remove', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(courses.modifyCourse(req.params.id, username, req.body, false), res);
});

/**
 * @api {delete} /courses/:id Deletes a course
 * @apiName DeleteCourse
 * @apiGroup Course
 *
 * @apiParam {String} id The id of the course.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "message": "Success."
 *      }
 */
router.delete('/:id', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(courses.removeCourse(req.params.id, username), res);
});

module.exports = router;