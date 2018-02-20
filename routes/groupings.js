'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var groupings = require('../lib/groupings');

/**
 * @api {get} /classes/:id/groupings Return a list of the current groupings
 * @apiName GetGroupings
 * @apiGroup Groupings
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [{
 *          "_id": "559a447831b76cec185bf501",
 *          "name": "Grouping1",
 *          "classId": "559a447831b76cec185bf501",
 *          "teachers": ["Teacher1"]
 *          "groups": ["559a447834376cec185bf501"]
 *      }, {
 *          "_id": "559a447831b76cec185bf502",
 *          "name": "Group2",
 *          "classId": "559a447831b76cec185bf501",
 *          "teachers": ["Teacher2"]
 *          "groups": ["559a447834376cec185bf501", "559a44783176f4sec185bf501"]
 *      }]
 *
 */
router.get('/:id/groupings', function (req, res) {
    restUtils.processResponse(groupings.find({classId: req.params.id}), res);
});

/**
 * @api {get} /classes/groupings/:id Returns a given grouping.
 * @apiName GetGroupings
 * @apiGroup Groupings
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf501",
 *          "name": "Grouping1",
 *          "classId": "559a447831b76cec185bf501",
 *          "teachers": ["Teacher1"]
 *          "groups": ["559a447834376cec185bf501"]
 *      }
 *
 */
router.get('/groupings/:id', restUtils.findById(groupings));

/**
 * @api {post} /classes/:id/groupings Creates new Grouping.
 * @apiName PostGroupings
 * @apiGroup Groupings
 *
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "Name",
 *          "classId": "559a447831b76cec185bf501",
 *          "teachers": ["Teacher1"]
 *          "groups": ["559a447834376cec185bf501"]
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
 *          "teachers": ["Teacher1"]
 *          "groups": ["559a447834376cec185bf501"]
 *      }
 *
 */
router.post('/:id/groupings', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(groupings.createGroupings(username, req.params.id, req.body), res);
});

/**
 * @api {put} /classes/groupings/:id Changes the name of a grouping and the groups.
 * @apiName PutGroupings
 * @apiGroup Groupings
 *
 * @apiParam {String} id The id of the course.
 * @apiParam {String} [name] The new name for the group
 * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to add to the grouping.
 * @apiParam {String[]} [groups] Array with the id of the groups that you want to add to the grouping.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "New Name",
 *          "teachers: []
 *          "groups": ["559a447834376ce3485bf503"]
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
 *          "teachers": ["Teacher1"]
 *          "groups": ["559a447834376ce3485bf503", "559a447834376cec185bf501"]
 *      }
 */
router.put('/groupings/:id', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(groupings.modifyGroupings(req.params.id, username, req.body, true), res);
});

/**
 * @api {put} /classes/groupings/:id/remove Removes group from a grouping.
 * @apiName PutGroupings
 * @apiGroup Groupings
 *
 * @apiParam {String} id The id of the course.
 * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to add to the grouping.
 * @apiParam {String[]} [groups] Array with the id of the groups that you want to add to the grouping.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "New Name",
 *          "teachers: []
 *          "groups": ["559a447834376ce3485bf503"]
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
 *          "teachers": ["Teacher1"]
 *          "groups": ["559a447834376ce3485bf503", "559a447834376cec185bf501"]
 *      }
 */
router.put('/groupings/:id/remove', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(groupings.modifyGroupings(req.params.id, username, req.body, false), res);
});

/**
 * @api {delete} /classes/grouping/:id Deletes a group
 * @apiName DeleteGrouping
 * @apiGroup Grouping
 *
 * @apiParam {String} id The id of the grouping.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "message": "Success."
 *      }
 */
router.delete('/groupings/:id', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(groupings.removeGroupings(req.params.id, username), res);
});

module.exports = router;