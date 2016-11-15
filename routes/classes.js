'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var classes = require('../lib/classes'),
    sessions = require('../lib/sessions');

/**
 * @api {get} /classes Returns all the classes.
 * @apiName GetClasses
 * @apiGroup Classes
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b7acec185bf513",
 *              "versionId": "559a447831b76cec185bf514",
 *              "created": "2015-07-06T09:00:50.630Z",
 *              "name": "My Class",
 *              "authors": ["someTeacher"],
 *              "teachers": ["someTeacher"]
 *              "students": ["someStudent"]
 *          }
 *      ]
 *
 */
router.get('/', restUtils.find(classes));

/**
 * @api {get} /classes/:id Returns a given class.
 * @apiName GetClasses
 * @apiGroup Classes
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *
 *      {
 *          "_id": "559a447831b76cec185bf501"
 *          "versionId": "559a447831b76cec185bf514",
 *          "created": "2015-07-06T09:00:50.630Z",
 *          "name": "Some Class Name",
 *          "authors": ["someTeacher"],
 *          "teachers": ["someTeacher", "Ben"]
 *          "students": ["someStudent"]
 *      }
 *
 */
router.get('/:id', restUtils.findById(classes));

/**
 * @api {put} /classes/:classId Changes the name and/or teachers array of a class.
 * @apiName PutClasses
 * @apiGroup Classes
 *
 * @apiParam {String} sessionId The id of the session.
 * @apiParam {String} [name] The new name of the session
 * @apiParam {String[]} [students] Array with the username of the students that you want to add to the session. Also can be a String
 * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to add to the session. Also can be a String
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "My New Name",
 *          "teachers": ["Some Teacher"],
 *          "students": ["Some Student"]
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf511"
 *          "versionId": "559a447831b76cec185bf514",
 *          "created": "2015-07-06T09:00:50.630Z",
 *          "name": "My New Name",
 *          "authors": ["someTeacher"],
 *          "teachers": ["someTeacher", "Some Teacher"],
 *          "students": ["Some Student"]
 *      }
 */
router.put('/:classId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.modifyClass(req.params.classId, username, req.body, true), res);
});

/**
 * @api {put} /classes/:classId/remove Removes students and/or teachers from a class.
 * @apiName PutClasses
 * @apiGroup Classes
 *
 * @apiParam {String} classId The id of the class.
 * @apiParam {String[]} [students] Array with the username of the students that you want to remove from the session. Also can be a String
 * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to remove from the session. Also can be a String
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "teachers": ["Some Teacher"],
 *          "students": ["Some Student"]
 *      }
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf511"
 *          "versionId": "559a447831b76cec185bf514",
 *          "created": "2015-07-06T09:00:50.630Z",
 *          "name": "My Class Name",
 *          "authors": ["someTeacher"],
 *          "teachers": ["someTeacher"],
 *          "students": []
 *      }
 */
router.put('/:classId/remove', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.modifyClass(req.params.classId, username, req.body, false), res);
});


/**
 * @api {delete} /classes/:classId Deletes a class and all the sessions associated with it
 * @apiName DeleteClasses
 * @apiGroup Classes
 *
 * @apiParam {String} classId The id of the session.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "message": "Success."
 *      }
 */
router.delete('/:classId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.removeClass(req.params.classId, username), res);
});

module.exports = router;