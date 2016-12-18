'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var lti = require('../lib/lti');

/**
 * @api {get} lti/key/:id Returns a lti object with the id.
 * @apiName GetLti
 * @apiGroup Lti
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b7acec185bf513",
 *              "secret": "42231831hf384hf1gf478393",
 *              "classId": "1543j413o459046k42h39843"
 *          }
 *      ]
 *
 */
router.get('/key/:id', restUtils.findById(lti));

/**
 * @api {get} lti/keyid/:gameId/:versionId/:classId Return the lti object that satisfy.
 * @apiName GetLti
 * @apiGroup Lti
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b7acec185bf513",
 *              "secret": "42231831hf384hf1gf478393",
 *              "classId": "classId"
 *          }
 *      ]
 *
 */
router.get('/keyid/:gameId/:versionId/:classId', function (req, res) {
    var query  = {
        gameId: req.params.gameId,
        versionId: req.params.versionId === 'undefined' ? { $exists: false } : req.params.versionId,
        classId: req.params.classId === 'undefined' ? { $exists: false } : req.params.classId
    };
    restUtils.processResponse(lti.getLtiByQuery(query), res);
});

/**
 * @api {post} /lti Adds a new lti object.
 * @apiName PostLti
 * @apiGroup Lti
 *
 * @apiParam {String} secret The title of the game.
 * @apiParam {String} [sessionId] if the lti object is generate for a session.
 * @apiParam {String} [classId] if the lti object is generate for a class.
 * @apiParam {String} [versionId] if the lti object is generate for a game.
 * @apiParam {String} [gameId] if the lti object is generate for a game.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "secret": "MySecrete",
 *          "classId": "1543j413o459046k42h39843"
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b7acec185bf513",
 *          "secret": "MySecrete"
 *          "classId": "1543j413o459046k42h39843",
 *      }
 *
 */
router.post('/', restUtils.insert(lti));

module.exports = router;