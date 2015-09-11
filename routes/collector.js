'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var collector = require('../lib/collector');

/**
 * @api {post} /collector/start/:trackingCode Returns all the Sessions.
 * @apiDescription Note that this method expects an 'Authorization2' header with the following format
 *  <Authorization2, 'a:'> or <Authorization2, 'a:playerName'>.
 *  The first value will create a new anonymous player while the second will try to
 *  find the player with the given 'playerName'.
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
 *          authToken: <String>,        - Used as 'Authorization2' header for '/api/collector/track' requests.
 *          playerName: <String>
 *      }
 *
 */
router.post('/start/:trackingCode', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    var authorization = req.headers.authorization2;
    if(!authorization) {
        authorization = req.headers.authorization;
    }
    restUtils.processResponse(collector.start(req.params.trackingCode, authorization, username), res);
});

/**
 * @api {post} /api/collector/track Tracks data from the request body.
 * @apiDescription Note that this method expects an 'Authorization2' header with the following format
 *  <Authorization2, 'authToken'>.
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
    restUtils.processResponse(collector.track(req.headers.authorization2, req.body), res);
});

module.exports = router;