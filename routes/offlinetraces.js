'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

module.exports = function (kafkaConfig) {

    var offlinetraces = require('../lib/offlinetraces')();

    /**
     * @api {get} /api/offlinetraces/:activityId/kahoot Returns the Kahoot offlinetraces
     * (meta-information about the uploaded Kahoot results file) that has the given id.
     * @apiName GetOflinetraces
     * @apiGroup Oflinetraces
     *
     * @apiParam {String} id The Analysis id
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf501",
     *          "kahoot": true,
     *          "name": "results.xslx",
     *          "activityId": "559a447831b76cec185bf502",
     *          "author": "David",
     *          "timestamp": "2015-07-06T09:00:50.630Z"
     *      }
     *
     */
    router.get('/:activityId/kahoot', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(offlinetraces.findByActivityId(req.params.activityId, username, true), res);
    });

    /**
     * @api {get} /api/offlinetraces/:activityId Returns the offlinetraces
     * (meta-information about the uploaded CSV file) that has the given id.
     * @apiName GetOflinetraces
     * @apiGroup Oflinetraces
     *
     * @apiParam {String} id The Analysis id
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf501",
     *          "name": "tracesdata.csv",
     *          "activityId": "559a447831b76cec185bf502",
     *          "author": "David",
     *          "timestamp": "2015-07-06T09:00:50.630Z"
     *      }
     *
     */
    router.get('/:activityId', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(offlinetraces.findByActivityId(req.params.activityId, username, false), res);
    });


    /**
     * @api {post} /offlinetraces/:analisysId/kahoot Adds a new Kahoot OfflineTraces for a given versionId
     * @apiName PostOflinetraces
     * @apiGroup Oflinetraces
     *
     * @apiParam {String} analysisId The id of the analysis.
     * @apiParamExample {} Request-Example:
     *      An .xlsx file with the KAHOOT traces following the correct format:
     *      https://kahoot.com/blog/2017/02/20/download-evaluate-kahoot-results-data/
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf501",
     *          "name": "realtime.jar",
     *          "activityId": "559a447831b76cec185bf502",
     *          "author": "David",
     *          "timestamp": "2015-07-06T09:00:50.630Z"
     *      }
     */
    router.post('/:activityId/kahoot', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(offlinetraces.createOfflinetraces(req.params.activityId, username, req, res, true), res);
    });

    /**
     * @api {post} /offlinetraces/:analisysId/ Adds a new OfflineTraces for a given versionId
     * @apiName PostOflinetraces
     * @apiGroup Oflinetraces
     *
     * @apiParam {String} analysisId The id of the analysis.
     * @apiParamExample {} Request-Example:
     *      A .csv file with the traces in CSV:
     *        XJIR,1523611057499,initialized,level,A
     *        KVDC,1523611057500,initialized,level,A
     *        XJIR,1523611057510,interacted,gameobject,15Objects-A,Bombilla,1
     *        KVDC,1523611057623,selected,alternative,A,success,true,response,bombilla,mappings_Bombilla, bombilla,targets,Bombilla=true,bombilla,802,object-changed,0,correct,1
     *        XJIR,1523611057728,interacted,gameobject,15Objects-A,Bombilla,1
     *        KVDC,selected,alternative,A,success,false,response,pipa,mappings_Bombilla, ,targets,Bombilla=false,object-changed,0,correct,0
     *
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf501",
     *          "name": "realtime.jar",
     *          "activityId": "559a447831b76cec185bf502",
     *          "author": "David",
     *          "timestamp": "2015-07-06T09:00:50.630Z"
     *      }
     */
    router.post('/:activityId', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(offlinetraces.createOfflinetraces(req.params.activityId, username, req, res, false), res);
    });

    return router;
};