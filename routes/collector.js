'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var collector = require('../lib/collector');

/**
 * @api {post} /collector/start/:trackingCode Returns all the Sessions.
 * @apiDescription This method expects an 'Authorization' header with one of the following formats
 *  1.- <Authorization, 'a:'> or <Authorization, 'a:playerName'>. The first value will create a new anonymous player
 *  while the second will try to find the player with the given 'playerName'.
 *  2.- <Authorization, 'authToken'> This format is used when the user is already authenticated.
 *
 * @apiName postCollectorStart
 * @apiGroup Collector
 *
 * @apiParam {String} trackingCode The tracking code assigned to a given game.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          authToken: <String>,        - Used as 'Authorization' header for '/api/collector/track' requests.
 *          objectId: <String>,         - Used as Object.id in the following xAPI statements.
 *          actor: Object               - https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor
 *      }
 *
 * @apiError InvalidTrackingCode The 'trackingCode' is not valid.
 * @apiError PlayerNotFound The player couldn't be created or couldn't be found.
 *
 */
router.post('/start/:trackingCode', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(collector.start(req.params.trackingCode, req.headers.authorization, username), res);
});

/**
 * @api {post} /api/collector/track Tracks data from the request body.
 * @apiDescription Note that this method expects an 'Authorization2' header with the following format
 *  <Authorization, 'authToken'>.
 *  The 'authToken' can be obtained by issuing a request to '/api/collector/start/:trackingCode'.
 *
 * @apiName postCollectorTrack
 * @apiGroup Collector
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      true
 *
 */
router.post('/track', function (req, res) {
    restUtils.processResponse(collector.track(req.headers.authorization, req.body), res);
});

module.exports = router;