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
 * @api {post} /api/sessions Starts or ends a new session depending on the event value.
 * @apiName postSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} gameId The Game id of the session.
 * @apiParam {String} versionId The Version id of the session.
 * @apiParam {String} event Determines if we should start or end a session. Allowed values: start, end.
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
 *          "end": "2015-07-06T09:03:45.631Z"
 *      }
 *
 */
router.post('/:gameId/:versionId/:event', function (req, res) {
    switch (req.params.event) {
        case 'start':
        case 'start/':
            restUtils.processResponse(sessions.startSession(req.params.gameId, req.params.versionId), res);
            break;
        case 'end':
        case 'end/':
            restUtils.processResponse(sessions.endSession(req.params.gameId, req.params.versionId), res);
            break;
        default:
            res.status(400).end();
            break;
    }
});

/**
 * @api {get} /api/sessions/:id/results Adds all the results of a session.
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
    restUtils.processResponse(sessions.results(req.params.id), res);
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
    restUtils.processResponse(sessions.updateResult(req.params.id, req.params.resultId, req.body), res);
});

module.exports = router;