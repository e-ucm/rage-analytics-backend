'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var sessions = require('../lib/sessions');

/**
 * @api {get} /api/sessions/:id Returns the Session that has the given id.
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
 *          "created": "2015-07-06T09:00:50.630Z",
 *          "start": "2015-07-06T09:00:52.630Z",
 *          "end": "2015-07-06T09:03:45.631Z",
 *          "name": "Some Session Name",
 *          "allowAnonymous": false,
 *          "teachers": ["Ben"],
 *          "students": ["Alice", "Dan"]
 *      }
 *
 */
router.get('/:id', restUtils.findById(sessions));

/**
 * @api {put} /sessions/:sessionId Changes the name, students and/or teachers array of a session.
 * @apiName putSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} sessionId The id of the session.
 * @apiParam {String} [name] The new name of the session
 * @apiParam {Boolean} [allowAnonymous] Whether this session should process data from anonymous users or not.
 * @apiParam {String[]} [students] Array with the username of the students that you want to add to the session. Also can be a String
 * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to add to the session. Also can be a String
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "My New Name",
 *          "allowAnonymous": true,
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
 *          "created": "2015-07-06T09:00:50.630Z",
 *          "start": "2015-07-06T09:01:52.636Z",
 *          "end": "2015-07-06T09:03:45.631Z",
 *          "name": "My New Name",
 *          "allowAnonymous": true,
 *          "teachers": ["Some Teacher"],
 *          "students": ["Some Student"]
 *      }
 */
router.put('/:sessionId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.modifySession(req.params.sessionId, username, req.body, true), res);
});

/**
 * @api {put} /sessions/:sessionId/remove Removes students and/or teachers from a session.
 * @apiName putSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} sessionId The id of the session.
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
 *          "gameId": "559a447831b76cec185bf513",
 *          "versionId": "559a447831b76cec185bf514",
 *          "created": "2015-07-06T09:00:50.630Z",
 *          "start": "2015-07-06T09:01:52.636Z",
 *          "end": "2015-07-06T09:03:45.631Z",
 *          "name": "My New Name",
 *          "teachers": [],
 *          "students": []
 *      }
 */
router.put('/:sessionId/remove', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.modifySession(req.params.sessionId, username, req.body, false), res);
});

/**
 * @api {delete} /sessions/:sessionId Deletes a session and all the results associated with it
 * @apiName deleteSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} sessionId The id of the session.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      true
 */
router.delete('/:sessionId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.removeSession(req.params.sessionId, username), res);
});

/**
 * @api {get} /sessions/:sessionId/results Returns all the results of a session.
 * @apiName PostSessionResults
 * @apiGroup Sessions
 *
 * @apiParam {String} sessionId The Session id.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "var": {
 *                  "score": 276,
 *                  "hasPickedValuableItem": true,
 *                  "timeSpentInLevel": 1820000,
 *                  "alias": "somePlayerAlias"
 *              },
 *              "zone": "zone6",
 *              "interact": {
 *                  "tutorialButton": 2,
 *                  "helpButton": 9
 *              },
 *              "choice": {
 *                  "preferredFood": {
 *                      "pizza": 4
 *                  },
 *                  "favouriteItem": {
 *                      "healthPotion": 9,
 *                      "rusticSword": 4
 *                  }
 *              }
 *          }
 *      ]
 *
 */
router.get('/:sessionId/results', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.results(req.params.sessionId, username), res);
});

/**
 * @api {post} /sessions/:sessionId/results/:resultId Updates a specific result from a session.
 * @apiName PostResult
 * @apiGroup Sessions
 *
 * @apiParam {String} sessionId Game id.
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
router.post('/:sessionId/results/:resultId', function (req, res) {
    if (req.body && req.body._id) {
        delete req.body._id;
    }
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.updateResult(req.params.sessionId, req.params.resultId, req.body, username), res);
});

/**
 * @api {post} /sessions/:sessionId/:event Starts or ends a session depending on the event value.
 * @apiName postSessions
 * @apiGroup Sessions
 *
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
 *          "name": "The Session Name",
 *          "created": "2015-07-06T09:00:50.630Z",
 *          "start": "2015-07-06T09:01:52.636Z",
 *          "end": "2015-07-06T09:03:45.631Z",
 *          "name": "Some Session Name",
 *          "allowAnonymous": false,
 *          "teachers": ["Ben"],
 *          "students": ["Alice", "Dan"]
 *      }
 *
 */
router.post('/:sessionId/:event', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    switch (req.params.event) {
        case 'start':
            restUtils.processResponse(sessions.startSession(username, req.params.sessionId), res);
            break;
        case 'end':
            restUtils.processResponse(sessions.endSession(username, req.params.sessionId), res);
            break;
        default:
            res.status(400).end();
            break;
    }
});

module.exports = router;