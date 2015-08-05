'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var collector = require('../lib/collector');

/**
 * @api {post} /api/collector/start/:trackingCode Returns all the Sessions.
 * @apiName postCollectorStart
 * @apiGroup Collector
 *
 * @apiParam {String} trackingCode The tracking code assigned to a given game.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      authorization token
 *
 */
router.post('/start/:trackingCode', function (req, res) {
    restUtils.processResponse(collector.start(req.params.trackingCode, req.headers.authorization2), res);
});

/**
 * @api {post} /api/collector/track Tracks data from the request body.
 * @apiName postCollectorTrack
 * @apiGroup Collector
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          ...data to be tracked...
 *      }
 *
 */
router.post('/track', function (req, res) {
    restUtils.processResponse(collector.track(req.headers.authorization2, req.body), res);
});

module.exports = router;