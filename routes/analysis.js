'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var analysis = require('../lib/analysis');

/**
 * @api {get} /api/analysis/:id Returns the Analysis that has the given id.
 * @apiName GetAnalysis
 * @apiGroup Analysis
 *
 * @apiParam {String} id The Version id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf501",
 *          "realtimePath": "/analysis/559a447831b76cec185bf514/realtime.jar",
 *          "fluxPath": "/analysis/559a447831b76cec185bf514/flux.yml",
 *          "created": "2015-07-06T09:00:50.630Z"
 *      }
 *
 */
router.get('/:id', restUtils.findById(analysis));

/**
 * @api {post} /analysis/:versionId/ Adds a new Analysis for a given versionId
 * @apiName PostAnalysis
 * @apiGroup Analysis
 *
 * @apiParam {String} versionId The id of the version of the game.
 * @apiParamExample {} Request-Example:
 *      A zip file with a 'realtime.jar' (analysis) and 'flux.yml' (configuration) files, e.g.:
 *      analysis.zip -> /
 *
 *                  realtime.jar    // A jar file with the analysis topology in a correct Storm & Flux format.
 *                  flux.yml        // A configuration file for the analysis. More info. about the Storm-Flux
 *                                  // specification: https://github.com/apache/storm/blob/master/external/flux/README.md
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf501",
 *          "realtimePath": "/analysis/559a447831b76cec185bf514/realtime.jar",
 *          "fluxPath": "/analysis/559a447831b76cec185bf514/flux.yml",
 *          "created": "2015-07-06T09:00:50.630Z"
 *      }
 */
router.post('/:versionId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(analysis.createAnalysis(req.params.versionId, username, req, res), res);
});

/**
 * @api {delete} /analysis/:versionId Deletes the analysis of a given version of a game
 * @apiName DeleteAnalysis
 * @apiGroup Analysis
 *
 * @apiParam {String} versionId The id of the version of te game.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "message": "Success."
 *      }
 */
router.delete('/:versionId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(analysis.removeAnalysis(req.app.config, req.params.versionId, username), res);
});

module.exports = router;