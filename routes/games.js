'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var games = require('../lib/games'),
    versions = require('../lib/versions');

/**
 * @api {get} /games Returns all the games.
 * @apiName GetGames
 * @apiGroup Games
 * *
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
 * @apiName PostUser
 * @apiGroup Users
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
 * @api {post} /api/games/:id Changes the game title.
 * @apiName PutGame
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
 * @api {delete} /api/games/:id Removes the game.
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
 * @api {get} /api/games/:gameId/versions Returns all the versions of a given game.
 * @apiName GetVersions
 * @apiGroup Games
 *
 * @apiParam {String} id Game id.
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
 * @api {post} /api/games/:gameId/versions Adds a new version for a specific game.
 * @apiName PostVersions
 * @apiGroup Games
 *
 * @apiParam {String} id Game id.
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
 * @api {get} /api/games/:gameId/versions Returns a version for a specific game.
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
 * @api {post} /api/games/:gameId/versions Adds a new name for a specific version.
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

module.exports = router;