'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils'),
    request = require('request');

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
 *              "title": "My Game",
 *              "author": "developer",
 *              "public": "false"
 *          }
 *      ]
 *
 */
router.get('/', restUtils.find(games));

/**
 * @api {get} /games/public Returns all the public games.
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
 *              "title": "My Game",
 *              "author": "developer",
 *              "public": "true"
 *          }
 *      ]
 *
 */
router.get('/public', restUtils.find(games, function (req, callback) {
    // Creates a Query for the 'find' operation
    callback({
        public: true
    });
}));

/**
 * @api {post} /games Adds a new game.
 * @apiName PostGames
 * @apiGroup Games
 *
 * @apiHeader {String} x-gleaner-user.
 *
 * @apiParam {String} [title] The title of the game.
 * @apiParam {Boolean} [public] If other people can see the game.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "title": "My Game",
 *          "public": "true"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b7acec185bf513",
 *          "title": "My Game"
 *          "author": "x-gleaner-user",
 *          "public": "true"
 *      }
 *
 */
router.post('/', restUtils.insert(games, function (req) {
    var author = req.headers['x-gleaner-user'];
    if (author) {
        req.body.author = author;
    }
}));

/**
 * @api {post} /games/:id Changes the game title and/or the field public.
 * @apiName PostGame
 * @apiGroup Games
 *
 * @apiParam {String} id Game id.
 * @apiParam {Object} [title] The new game title.
 * @apiParam {Boolean} [public] If other people can see the game.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "title": "New title",
 *          "public" "false",
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b7acec185bf513",
 *          "title": "New title",
 *          "author": "developer",
 *          "public": "false"
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
 * @api {get} /games/:id/:versionId Returns the game with the given id.
 *              This route is mainly used as the Object.id of the xAPI statements.
 * @apiName GetGame
 * @apiGroup Games
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *          {
 *              "_id": "559a447831b7acec185bf513",
 *              "title": "My Game",
 *              "author": "developer",
 *              "public": "false"
 *          }
 *
 */
router.get('/:id/:versionId', restUtils.findById(games));

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
 * @api {post} /games/:gameId/versions/:id Adds a new name or link for a specific version.
 * @apiName PutVersions
 * @apiGroup Games
 *
 * @apiParam {String} gameId Game id.
 * @apiParam {String} id Version id.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "New name",
 *          "link": "New Link"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "name": "New name",
 *          "link": "New Link",
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
 * @api {get} /games/:gameId/versions/:versionsId/sessions/my Returns all the Sessions of a given version of a game where the user participates.
 * @apiName GetSessions
 * @apiGroup Sessions
 *
 *  @apiHeader {String} x-gleaner-user.
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
router.get('/:gameId/versions/:versionId/sessions/my', function (req, res) {
    restUtils.processResponse(sessions.getUserSessions(req.params.gameId, req.params.versionId, req.headers['x-gleaner-user']), res);
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

/**
 * @api {get} /games/my Return all sessions with the userId in the students or teacher array.
 * @apiName getSessions
 * @apiGroup Sessions
 *
 * @apiHeader {String} x-gleaner-user.
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
 *          "name": "Name",
 *          "teachers": ["x-gleaner-user"],
 *          "students": ["Some Student"]
 *      }
 */
router.get('/my', restUtils.find(games, function (req, callback) {
    var user = req.headers['x-gleaner-user'];
    // Creates a Query for the 'find' operation
    callback({
        author: user.toString()
    });
}));

/**
 * @api {get} /statements Returns all statements.
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
 *          "statements": [
 *          {
 *              "id": "e5efec39-3992-401d-be17-86d24c3f1e76",
 *              "actor": {
 *              "objectType": "Agent",
 *              "name": "s",
 *              "account": {
 *                  "homePage": "http://www.gleaner.com/",
 *                  "name": "s"
 *              }
 *          },
 *          "verb": {
 *              "id": "http://www.gleaner.com/started_game",
 *              "display": {
 *                  "es-ES": "started_game",
 *                  "en-US": "started_game"
 *              }
 *          },
 *          "object": {
 *              "id": "http://www.gleaner.com/games/lostinspace/none",
 *              "objectType": "Activity",
 *              "definition": {
 *                  "type": "http://www.gleaner.com/objects/none",
 *                  "extensions": {
 *                      "event": "game_start",
 *                      "gameplayId": "55e57b03553dded764546f03"
 *                  }
 *              }
 *          },
 *          "stored": "2015-09-10T11:01:04Z"
 *      }
 *
 */
router.get('/statements', function (req, res, next) {

    var options = {
        uri: req.app.config.lrs.uri + '/statements',
        method: 'GET',
        json: true,
        headers: {
            Authorization: 'Basic ' + new Buffer(req.app.config.lrs.username + ':' + req.app.config.lrs.password)
                .toString('base64'),
            'X-Experience-API-Version': '1.0.1'
        }
    };

    request(options, function (err, response, body) {
        if (err) {
            next(err);
        } else {
            if (!body) {
                body = {statements: []};
            }
            res.json(body);
        }
    });
});

module.exports = router;