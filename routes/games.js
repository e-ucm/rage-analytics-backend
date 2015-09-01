'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var games = require('../lib/games'),
    versions = require('../lib/versions'),
    sessions = require('../lib/sessions');

/**
 * @api {get} /games Returns all the games.
 * @apiName GetGames
 * @apiGroup Games
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b7acec185bf513",
 *              "title": "My Game"
 *          }
 *      ]
 *
 */
router.get('/', restUtils.find(games));

/**
 * @api {post} /games Adds a new game.
 * @apiName PostGames
 * @apiGroup Games
 *
 * @apiParam {String} title The title of the game.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "title": "My Game"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b7acec185bf513",
 *          "title": "My Game"
 *      }
 *
 */
router.post('/', restUtils.insert(games));

/**
 * @api {post} /games/:id Changes the game title.
 * @apiName PostGame
 * @apiGroup Games
 *
 * @apiParam {String} id Game id.
 * @apiParam {Object} title The new game title.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "title": "New title"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b7acec185bf513",
 *          "title": "New title"
 *      }
 *
 */
router.post('/:id', restUtils.findAndModify(games));

/**
 * @api {delete} /games/:id Removes the game.
 * @apiName DeleteGame
 * @apiGroup Games
 *
 * @apiParam {String} id Game id.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      true
 *
 */
router.delete('/:id', restUtils.deleteById(games));

/**
 * @api {get} /games/:gameId/versions Returns all the versions of a given game.
 * @apiName GetVersions
 * @apiGroup Games
 *
 * @apiParam {String} gameId Game id.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b76cec185bf513",
 *              "gameId": "559a447831b7acec185bf513"
 *          }
 *      ]
 *
 */
router.get('/:gameId/versions', restUtils.find(versions, function (req, callback) {
    // Creates a Query for the 'find' operation
    callback({
        gameId: games.toObjectID(req.params.gameId)
    });
}));

/**
 * @api {post} /games/:gameId/versions Adds a new version for a specific game.
 * @apiName PostVersions
 * @apiGroup Games
 *
 * @apiParam {String} gameId Game id.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf513",
 *          "gameId": "559a447831b7acec185bf513"
 *      }
 *
 */
router.post('/:gameId/versions', restUtils.insert(versions, function (req) {
    // Saves the 'gameId' inside the generated 'version' document
    req.body.gameId = games.toObjectID(req.params.gameId);
}));

/**
 * @api {get} /games/:gameId/versions/:id Returns a version for a specific game.
 * @apiName GetVersions
 * @apiGroup Games
 *
 * @apiParam {String} gameId Game id.
 * @apiParam {String} id Version id.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf513",
 *          "gameId": "559a447831b7acec185bf513"
 *      }
 *
 */
router.get('/:gameId/versions/:id', restUtils.findById(versions));

/**
 * @api {post} /games/:gameId/versions/:id Adds a new name for a specific version.
 * @apiName PutVersions
 * @apiGroup Games
 *
 * @apiParam {String} gameId Game id.
 * @apiParam {String} id Version id.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "New name"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "name": "New name",
 *          "_id": "559a447831b76cec185bf513",
 *          "gameId": "559a447831b7acec185bf513"
 *      }
 *
 */
router.post('/:gameId/versions/:id', restUtils.findAndModify(versions, function (req) {
    // Ensures that the 'gameId' attribute cannot be changed in a 'version'
    if (req.body && req.body.gameId) {
        delete req.body.gameId;
    }
}));

/**
 * @api {get} /games/:gameId/versions/:versionsId/sessions Returns all the Sessions of a given version of a game.
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
 *              "created": "2015-07-06T09:00:50.630Z",
 *              "start": "2015-07-06T09:00:52.630Z",
 *              "end": "2015-07-06T09:03:45.631Z"
 *          },
 *          {
 *              "_id": "559a447831b76cec185bf511"
 *              "gameId": "559a447831b76cec185bf513",
 *              "versionId": "559a447831b76cec185bf514",
 *              "created": "2015-07-06T09:00:50.630Z",
 *              "start": "2015-07-06T09:03:52.636Z",
 *              "end": "2015-07-06T09:03:58.631Z"
 *          }
 *      ]
 *
 */
router.get('/:gameId/versions/:versionId/sessions', function (req, res) {
    restUtils.processResponse(sessions.getSessions(req.params.gameId, req.params.versionId), res);
});

/**
 * @api {post} /games/:gameId/versions/:versionsId/sessions Creates new Session for a given version of a game.
 * @apiName PostSessions
 * @apiGroup Sessions
 *
 * @apiParam {String} gameId The Game id of the session.
 * @apiParam {String} versionId The Version id of the session.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "New name"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "gameId": "55e433c773415f105025d2d4",
 *          "versionId": "55e433c773415f105025d2d5",
 *          "name": "New name",
 *          "created": "2015-08-31T12:55:05.459Z",
 *          "teachers": [
 *              "user"
 *          ],
 *          "_id": "55e44ea9f1448e1067e64d6c"
 *      }
 *
 */
router.post('/:gameId/versions/:versionId/sessions', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(sessions.createSession(req.params.gameId, req.params.versionId, username, req.body.name), res);
});

module.exports = router;