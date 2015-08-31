'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var sessions = require('../lib/sessions');

/**
 * @api {get} /api/sessions/:gameId/:versionsId Returns all the Sessions of a given version of a game.
 * @apiName GetSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} gameId The Game id of the session.
 * @apiParam {String} versionId The Version id of the session.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b76cec185bf501"
 *              "gameId": "559a447831b76cec185bf513",
 *              "versionId": "559a447831b76cec185bf514",
 *              "start": "2015-07-06T09:00:52.630Z",
 *              "end": "2015-07-06T09:03:45.631Z"
 *          },
 *          {
 *              "_id": "559a447831b76cec185bf511"
 *              "gameId": "559a447831b76cec185bf513",
 *              "versionId": "559a447831b76cec185bf514",
 *              "start": "2015-07-06T09:03:52.636Z"
 *          }
 *      ]
 *
 */
router.get('/:gameId/:versionId', function (req, res) {
    restUtils.processResponse(sessions.getSessions(req.params.gameId, req.params.versionId), res);
});

/**
 * @api {get} /api/sessions/:id Returns the Session that ahs the given id.
 * @apiName GetSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} id The Session id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf501"
 *          "gameId": "559a447831b76cec185bf513",
 *          "versionId": "559a447831b76cec185bf514",
 *          "start": "2015-07-06T09:00:52.630Z",
 *          "end": "2015-07-06T09:03:45.631Z"
 *      }
 *
 */
router.get('/:id', function (req, res) {
    restUtils.processResponse(restUtils.findById(sessions), res);
});

/**
 * @api {post} /api/sessions/:gameId/:versionsId Starts or ends a new session depending on the event value.
 * @apiName postSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} gameId The Game id of the session.
 * @apiParam {String} versionId The Version id of the session.
 * @apiParam {String} name The session name.
 * @apiParam {String} event Determines if we should start or end a session. Allowed values: start, end.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "The Session Name"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf511"
 *          "gameId": "559a447831b76cec185bf513",
 *          "versionId": "559a447831b76cec185bf514",
 *          "name": "The Session Name",
 *          "start": "2015-07-06T09:01:52.636Z",
 *          "end": "2015-07-06T09:03:45.631Z"
 *      }
 *
 */
router.post('/:gameId/:versionId/:event', function (req, res) {

    switch (req.params.event) {
        case 'start':
            var username = req.headers['x-gleaner-user'];
            restUtils.processResponse(sessions.startSession(req.params.gameId, req.params.versionId, username, req.body.name), res);
            break;
        case 'end':
            username = req.headers['x-gleaner-user'];
            restUtils.processResponse(sessions.endSession(req.params.gameId, req.params.versionId, username), res);
            break;
        default:
            res.status(400).end();
            break;
    }
});

/**
 * @api {put} /api/sessions/:id Changes the name, students and/or teachers array of a session.
 * @apiName putSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} id The id of the session.
 * @apiParam {String} name The new name of the session
 * @apiParam {String or Array<String>} students Array with the username of the students that you want to add to the session.
 * @apiParam {String or Array<String>} teachers Array with the username of the teachers that you want to add to the session.
 *
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
 *          "gameId": "559a447831b76cec185bf513",
 *          "versionId": "559a447831b76cec185bf514",
 *          "start": "2015-07-06T09:01:52.636Z",
 *          "end": "2015-07-06T09:03:45.631Z",
 *          "name": "My New Name",
 *          "teachers": ["Some Teacher"],
 *          "students": ["Some Student"]
 *      }
 */
router.put('/:id', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.modifySession(req.params.id, username, req.body, true), res);
});

/**
 * @api {put} /api/sessions/:id/remove Removes students and/or teachers from a session.
 * @apiName putSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} id The id of the session.
 * @apiParam {String or Array<String>} students Array with the username of the students that you want to remove from the session.
 * @apiParam {String or Array<String>} teachers Array with the username of the teachers that you want to remove from the session.
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
 *          "gameId": "559a447831b76cec185bf513",
 *          "versionId": "559a447831b76cec185bf514",
 *          "start": "2015-07-06T09:01:52.636Z",
 *          "end": "2015-07-06T09:03:45.631Z",
 *          "name": "My New Name",
 *          "teachers": [],
 *          "students": []
 *      }
 */
router.put('/:id/remove', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.modifySession(req.params.id, username, req.body, false), res);
});

/**
 * @api {delete} /api/sessions/:id Deletes a session and all the results associated with it
 * @apiName deleteSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} id The id of the session.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      true
 */
router.delete('/:id', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.removeSession(req.params.id, username), res);
});

/**
 * @api {get} /api/sessions/:id/results Returns all the results of a session.
 * @apiName PostSessionResults
 * @apiGroup Sessions
 *
 * @apiParam {String} id The Session id.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              // TODO
 *          }
 *      }
 *
 */
router.get('/:id/results', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.results(req.params.id, username), res);
});

/**
 * @api {post} /sessions/:id/results/:resultId Updates a specific result from a session.
 * @apiName PostResult
 * @apiGroup Sessions
 *
 * @apiParam {String} id Game id.
 * @apiParam {String} resultId The Result id.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          // TODO
 *      }
 *
 */
router.post('/:id/results/:resultId', function (req, res) {
    if (req.body && req.body._id) {
        delete req.body._id;
    }
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.updateResult(req.params.id, req.params.resultId, req.body, username), res);
});

module.exports = router;