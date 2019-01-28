'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils'),
    Q = require('q');

var activities = require('../lib/activities'),
    kibana = require('../lib/kibana/kibana'),
    classes = require('../lib/classes'),
    getRealTimeData = require('../lib/tracesConverter');

module.exports = function (kafkaService, stormService) {

    /**
     * @api {get} /activities Returns the Activities.
     * @apiName GetActivities
     * @apiGroup Activities
     *
     * @apiParam {String} id The Activity id
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf501",
     *          "name": "Some Activity Name",
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "rootId": "",
     *          "offline": false,
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:00:52.630Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "open": false,
     *          "visible": false
     *          "allowAnonymous": false,
     *          "groups": [],
     *          "groupings": [],
     *      }
     *
     */
    router.get('/', restUtils.find(activities));

    /**
     * @api {get} /activities/my Returns the Activities where the user participates.
     * @apiName GetActivities
     * @apiGroup Activities
     *
     * @apiParam {String} id The Activity id
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf501",
     *          "name": "Some Activity Name",
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "rootId": "",
     *          "offline": false,
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:00:52.630Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "open": false,
     *          "visible": false
     *          "allowAnonymous": false,
     *          "groups": [],
     *          "groupings": [],
     *      }
     *
     */
    router.get('/my', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.getUserActivities(username), res);
    });

    /**
     * @api {get} /activities/:activityId Returns the Activity that has the given id.
     * @apiName GetActivities
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The Activity id
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf501",
     *          "name": "Some Activity Name",
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "rootId": "",
     *          "offline": false,
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:00:52.630Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "open": false,
     *          "visible": false
     *          "allowAnonymous": false,
     *          "groups": [],
     *          "groupings": [],
     *      }
     *
     */
    router.get('/:activityId', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'get', '/activities/:activityId')
            .then(function (activity) {
                return activity;
            }), res);
    });


    /**
     * @api {post} /activities Creates new Activity for a
     * class in a given version of a game.
     * @apiName PostActivity
     * @apiGroup Activities
     *
     * @apiParam {String} name The name for the Activity.
     * @apiParam {String} gameId The Game id of the session.
     * @apiParam {String} versionId The Version id of the session.
     * @apiParam {String} classId The Class id of the session.
     *
     * @apiParamExample {json} Request-Example:
     *      {
     *          "name": "New name",
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3",
     *          "offline": false
     *      }
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "5bdc46009b12ed8295ab13d0",
     *          "name": "New name",
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3",
     *          "rootId": null,
     *          "offline": false,
     *          "groups": [],
     *          "groupings": [],
     *          "created": "2018-11-02T12:41:36.705Z",
     *          "open": false,
     *          "visible": false,
     *          "allowAnonymous": false,
     *          "trackingCode": "5bdc46009b12ed8295ab13d0g4b0dz9znb5"
     *      }
     *
     */
    router.post('/', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(classes.isAuthorizedFor(req.body.classId, username, 'post', '/activities/')
            .then(function (classReq) {

                var allowAnonymous = req.body.allowAnonymous;
                if (!allowAnonymous) {
                    allowAnonymous = false;
                }
                return activities.createActivity(req.body.gameId, req.body.versionId, req.body.classId,
                    username, req.body.name, req.body.rootId, req.body.parentId, req.body.offline, allowAnonymous, req.app.esClient);
            }), res);
    });

    /**
     * @api {post} /activities/bundle/ Creates new Activity for a
     * class in a given version of a game, including dashboards and visualizations.
     * @apiName PostBundleActivity
     * @apiGroup Activities
     *
     * @apiParam {String} name The name for the Activity.
     * @apiParam {String} gameId The Game id of the session.
     * @apiParam {String} versionId The Version id of the session.
     * @apiParam {String} classId The Class id of the session.
     *
     * @apiParamExample {json} Request-Example:
     *      {
     *          "name": "New name",
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3"
     *      }
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "5bdc46009b12ed8295ab13d0",
     *          "name": "New name",
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3",
     *          "rootId": null,
     *          "offline": false,
     *          "groups": [],
     *          "groupings": [],
     *          "created": "2018-11-02T12:41:36.705Z",
     *          "open": false,
     *          "visible": false,
     *          "allowAnonymous": false,
     *          "trackingCode": "5bdc46009b12ed8295ab13d0g4b0dz9znb5"
     *      }
     *
     */
    router.post('/bundle', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        var config = req.app.config;

        restUtils.processResponse(classes.isAuthorizedFor(req.body.classId, username, 'post', '/activities/bundle')
            .then(function (classReq) {
                var deferred = Q.defer();

                var allowAnonymous = req.body.allowAnonymous;
                if (!allowAnonymous) {
                    allowAnonymous = false;
                }
                activities.createActivity(req.body.gameId, req.body.versionId, req.body.classId,
                    username, req.body.name, req.body.rootId, req.body.parentId, req.body.offline, allowAnonymous, req.app.esClient)
                .then(function(activity) {
                        return kibana.getKibanaBaseVisualizations('tch', config, activity.gameId, req.app.esClient)
                        .then(function(visualizations) {
                            console.log('PostBundle -> VisObtained!');
                            return activities.createRequiredStorage(config, activity, username, req.app.esClient)
                                .then(function(result) {
                                    console.log('PostBundle -> IndexCreated!');
                                    return kibana.createVisualizationsAndDashboard(config, 'activity', activity, visualizations, username, req.app.esClient);
                                })
                                .then(function(result) {
                                    console.log('PostBundle -> VisAndDashCreated!');
                                    deferred.resolve(activity);
                                })
                                .fail(function(e) {
                                    deferred.reject(e);
                                });
                        })
                        .fail(function(err) {
                            console.log('PostBundle -> getKibanaBaseVisualizationsFailcase!');
                            console.log(JSON.stringify(err, null, 2));
                            return deferred.reject(err);
                        });
                    })
                .fail(function(error) {
                    console.log('PostBundle -> activityfailed!');
                    console.log(JSON.stringify(error, null, 2));
                    return deferred.reject(error);
                });

                return deferred.promise;
            }), res);

        console.log('PostBundle -> finnished!');
    });

    /**
     * @api {put} /activities/:activityId Changes the name, students and/or teachers array of a activity.
     * @apiName putActivities
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The id of the activity.
     * @apiParam {String} [name] The new name of the activity
     * @apiParam {Boolean} [allowAnonymous] Whether this activity should process data from anonymous users or not.
     * @apiParam {String[]} [groups] Array with the groups Ids of the groups that you want to add to the activity. Also can be a String.
     * @apiParam {String[]} [groupings] Array with the groupings Ids of the groupings that you want to add to the activity. Also can be a String
     * @apiParamExample {json} Request-Example:
     *      {
     *          "name": "My New Name",
     *          "allowAnonymous": true,
     *          "groups": ["groupID"],
     *          "groupings": ["groupingID"]
     *      }
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "5bdc46009b12ed8295ab13d0",
     *          "name": "My New Name",
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3",
     *          "rootId": null,
     *          "offline": false,
     *          "groups": ["groupID"],
     *          "groupings": ["groupingID"],
     *          "created": "2018-11-02T12:41:36.705Z",
     *          "open": false,
     *          "visible": false,
     *          "allowAnonymous": true,
     *          "trackingCode": "5bdc46009b12ed8295ab13d0g4b0dz9znb5"
     *      }
     */
    router.put('/:activityId', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'put', '/activities/:activityId')
            .then(function (activity) {
                return activities.modifyActivity(req.params.activityId, req.body, true, req.app.esClient);
            }), res);
    });

    /**
     * @api {put} /activities/:activityId/remove Removes students and/or teachers from a activity.
     * @apiName putActivities
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The id of the activity.
     * @apiParam {String[]} [groups] Array with the groups Ids of the groups that you want to add to the activity. Also can be a String.
     * @apiParam {String[]} [groupings] Array with the groupings Ids of the groupings that you want to add to the activity. Also can be a String
     *
     * @apiParamExample {json} Request-Example:
     *      {
     *          "groups": ["groupID"],
     *          "groupings": ["groupingID"]
     *      }
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "5bdc46009b12ed8295ab13d0",
     *          "name": "My New Name",
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3",
     *          "rootId": null,
     *          "offline": false,
     *          "groups": [],
     *          "groupings": [],
     *          "created": "2018-11-02T12:41:36.705Z",
     *          "open": false,
     *          "visible": false,
     *          "allowAnonymous": true,
     *          "trackingCode": "5bdc46009b12ed8295ab13d0g4b0dz9znb5"
     *      }
     */
    router.put('/:activityId/remove', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'put', '/activities/:activityId/remove')
            .then(function (activity) {
                return activities.modifyActivity(req.params.activityId, req.body, false, req.app.esClient);
            }), res);
    });

    /**
     * @api {delete} /activities/:activityId Deletes a activity and all the results associated with it
     * @apiName deleteActivities
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The id of the activity.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *         "message": "Success."
     *      }
     */
    router.delete('/:activityId', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'delete', '/activities/:activityId')
            .then(function (activity) {
                return activities.removeActivity(req.params.activityId);
            }), res);
    });

    /**
     * @api {get} /activities/:activityId/results Returns all the results of a activity given a DSL query (body).
     * @apiName GetActivityResults
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The activity id.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      [
     *         {
     *             "selected": {
     *               "menu": {
     *                 "Inicio": 1
     *               }
     *             },
     *             "progressed": {
     *               "serious-game": {
     *                 "EscenaIncio": 1
     *               }
     *             },
     *             "accessed": {
     *               "screen": {
     *                 "Creditos": 1
     *               }
     *             },
     *             "initialized": {
     *               "serious-game": {
     *                 "EscenaIncio": 1
     *               }
     *             }
     *           }
     *      ]
     *
     */
    router.get('/:activityId/results', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'get', '/activities/:activityId/results')
            .then(function (activity) {
                return activities.results(req.params.activityId, username, req.app.esClient);
            }), res);
    });

    /**
     * @api {put} /activities/:activityId/results/:resultId Updates a specific result from a activity.
     * @apiName PutActivityResults
     * @apiGroup Activities
     *
     * @apiParam {String} activityId Game id.
     * @apiParam {String} resultId The Result id.
     *
     * @apiParamExample {json} Request-Example:
     *      {
     *          "question": {"ATNombreManiobra":2},
     *          "menu": {"ResumenAT":2}
     *      }
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      [
     *          {
     *             "accessed": {
     *               "cutscene": {
     *                 "VideoInciarTos": 1,
     *                 "VideoHeimlich": 1
     *               },
     *               "area": {
     *                 "FinAtragantamiento": 1
     *               }
     *             },
     *             "selected": {
     *               "alternative": {
     *                 "ManosPechoHeimlich": 1,
     *                 "ManosHeimlich": 1,
     *                 "IniciarTos": 1,
     *                 "ColocacionHeimlich": 1
     *               },
     *               "question": {
     *                 "ATNombreManiobra": 2
     *               },
     *               "menu": {
     *                 "ResumenAT": 2,
     *                 "Inicio": 1
     *               }
     *             },
     *             "progressed": {
     *               "level": {
     *                 "Atragantamiento": 6
     *               },
     *               "serious-game": {
     *                 "EscenaIncio": 1
     *               }
     *             },
     *             "initialized": {
     *               "serious-game": {
     *                 "EscenaIncio": 1
     *               },
     *               "level": {
     *                 "Atragantamiento": 1
     *               }
     *             },
     *             "completed": {
     *               "level": {
     *                 "Atragantamiento": 1
     *               }
     *             }
     *           }
     *      ]
     *
     */
    router.put('/:activityId/results/:resultId', function (req, res) {
        if (req.body && req.body._id) {
            delete req.body._id;
        }
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'put', '/activities/:activityId/results/:resultId')
            .then(function (activity) {
                return activities.updateResult(req.params.activityId, req.params.resultId, req.body, username, req.app.esClient);
            }), res);
    });

    /**
     * @api {post} /activities/:activityId/event/:event Starts or ends a activity depending on the event value.
     * @apiName postActivities
     * @apiGroup Activities
     *
     * @apiParam {String} event Determines if we should start or end a activity. Allowed values: start, end.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf511"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "name": "The Activity Name",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "Some Activity Name",
     *          "allowAnonymous": false,
     *          "teachers": ["Ben"],
     *          "students": ["Alice", "Dan"]
     *      }
     *
     */
    router.post('/:activityId/event/:event', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'post', '/activities/:activityId/event/:event')
            .then(function (activity) {
                switch (req.params.event) {
                    case 'start': {
                        return activities.startActivity(req.params.activityId);
                    }
                    case 'end': {
                        return activities.endActivity(req.params.activityId);
                    }
                    default: {
                        res.status(400).end();
                        break;
                    }
                }
            }), res);

    });

    /**
     * @api {post} /activities/:activityId/event/:event Starts or ends a activity depending on the event value.
     * @apiName postActivities
     * @apiGroup Activities
     *
     * @apiParam {String} event Determines if we should start or end a activity. Allowed values: start, end.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf511"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "name": "The Activity Name",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "Some Activity Name",
     *          "allowAnonymous": false,
     *          "teachers": ["Ben"],
     *          "students": ["Alice", "Dan"]
     *      }
     *
     */
    router.get('/:activityId/attempts', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'get', '/activities/:activityId/attempts')
            .then(function (activity) {
                return activities.getAttempts(req.params.activityId);
            }), res);
    });

    /**
     * @api {post} /activities/:activityId/event/:event Starts or ends a activity depending on the event value.
     * @apiName postActivities
     * @apiGroup Activities
     *
     * @apiParam {String} event Determines if we should start or end a activity. Allowed values: start, end.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf511"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "name": "The Activity Name",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "Some Activity Name",
     *          "allowAnonymous": false,
     *          "teachers": ["Ben"],
     *          "students": ["Alice", "Dan"]
     *      }
     *
     */
    router.get('/:activityId/attempts/my', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'get', '/activities/:activityId/attempts/my')
            .then(function (activity) {
                return activities.getUserAttempts(req.params.activityId, username);
            }), res);
    });

    /**
     * @api {post} /activities/:activityId/event/:event Starts or ends a activity depending on the event value.
     * @apiName postActivities
     * @apiGroup Activities
     *
     * @apiParam {String} event Determines if we should start or end a activity. Allowed values: start, end.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "5bdc46009b12ed8295ab13d0",
     *          "name": "My New Name",
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3",
     *          "rootId": null,
     *          "offline": false,
     *          "groups": ["groupID"],
     *          "groupings": ["groupingID"],
     *          "created": "2018-11-02T12:41:36.705Z",
     *          "open": false,
     *          "visible": false,
     *          "allowAnonymous": true,
     *          "trackingCode": "5bdc46009b12ed8295ab13d0g4b0dz9znb5"
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *      }
     *
     */
    router.get('/:activityId/attempts/:username', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'get', '/activities/:activityId/attempts/:username')
            .then(function (activity) {
                return activities.getUserAttempts(req.params.activityId, req.params.username);
            }), res);
    });


    var startTopology = function (activityId, versionId, callback) {
        var task = stormService.startTopology;
        task.call(null, activityId, versionId)
            .then(function (result) {
                callback(null, result);
            }).fail(function (err) {
                console.error('Error starting Storm Topology: ', err);
                callback(err);
            });
    };

    var processTraces = function (data, activityId, res) {
        return function (topologyError, topologyResult) {
            if (topologyError) {
                return res.status(400).json({
                    message: 'Error starting Storm Topology: ' +
                    JSON.stringify(topologyError)
                });
            }
            var traces = [];
            for (var i = 0; i < data.length; ++i) {
                var realtimeData = getRealTimeData(data[i]);
                if (realtimeData.error || !realtimeData.trace) {
                    return res.status(400).json({
                        message: 'Error parsing statement, error:' + realtimeData.error
                    });
                }
                if (realtimeData.trace) {
                    traces.push(realtimeData.trace);
                }
            }
            kafkaService.send(activityId, traces)
                .then(function (topicResult) {
                    res.json({
                        message: 'Success',
                        id: activityId
                    });
                }).fail(function (error) {
                    if (error) {
                        return res.status(400).json({
                            message: 'Failed to send data to Kafka Topic: ' +
                            JSON.stringify(error)
                        });
                    }
                    res.json({
                        message: 'Success',
                        id: activityId
                    });
                });
        };
    };

    /**
     * @api {post} /activities/test/:versionId Starts a TEST Kafka Topic and Storm Topology and sends the body data to the Kafka Topic.
     * @apiName postActivitiesTest
     * @apiGroup Activities
     *
     * @apiParam {String} versionId Determines the name of the Kafka Topic and Storm Topology. Should be a unique string.
     *
     * @apiParamExample {json} Request-Example:
     *
     * [
     *     {
     *         "actor": {
     *             "objectType": "Agent",
     *             "mbox": "mailto:user@example.com",
     *             "name": "Project Tin Can API"
     *         },
     *         "verb": {
     *             "id": "http://adlnet.gov/expapi/verbs/updated",
     *             "display": {
     *                 "en-US": "created"
     *             }
     *         },
     *         "object": {
     *             "id": "http://example.adlnet.gov/xapi/example/testVar",
     *             "definition": {
     *                 "name": {
     *                     "en-US": "simple statement"
     *                 },
     *                 "description": {
     *                     "en-US": "A simple Experience API statement."
     *                 }
     *             }
     *         },
     *         "result": {
     *             "extensions": {
     *                 "value": "randomVariableValue"
     *             }
     *         }
     *     },
     *     {
     *         "timestamp": "2016-01-22T14:11:22.798Z",
     *         "actor": {
     *             "name": "56a2388d20b8364200f67d9c67412",
     *             "account": {
     *                 "homePage": "http://a2:3000/",
     *                 "name": "Anonymous"
     *             }
     *         },
     *         "verb": {
     *             "id": "http://purl.org/xapi/games/verbs/entered"
     *         },
     *         "object": {
     *             "id": "http://a2:3000/api/proxy/gleaner/games/56a21ac020b8364200f67d84/56a21ac020b8364200f67d85/zone/TestZone",
     *             "definition": {
     *                 "extensions": {
     *                     "versionId": "testVersionId",
     *                     "gameplayId": "100000000000000000000000"
     *                 }
     *             }
     *         },
     *         "result": {
     *             "extensions": {
     *                 "http://purl.org/xapi/games/ext/value": ""
     *             }
     *         }
     *     },
     *     {
     *         "timestamp": "2016-01-22T14:11:22.796Z",
     *         "actor": {
     *             "name": "56a2388d20b8364200f67d9c67412",
     *             "account": {
     *                 "homePage": "http://a2:3000/",
     *                 "name": "Anonymous"
     *             }
     *         },
     *         "verb": {
     *             "id": "http://purl.org/xapi/games/verbs/viewed"
     *         },
     *         "object": {
     *             "id": "http://a2:3000/api/proxy/gleaner/games/56a21ac020b8364200f67d84/56a21ac020b8364200f67d85/screen/MainMenu",
     *             "definition": {
     *                 "extensions": {
     *                     "versionId": "testVersionId",
     *                     "gameplayId": "100000000000000000000000"
     *                 }
     *             }
     *         },
     *         "result": {
     *             "extensions": {
     *                 "http://purl.org/xapi/games/ext/value": ""
     *             }
     *         }
     *     },
     *     {
     *         "timestamp": "2016-01-22T14:33:34.352Z",
     *         "actor": {
     *             "name": "56a23d8420b8364200f67d9f79692",
     *             "account": {
     *                 "homePage": "http://a2:3000/",
     *                 "name": "Anonymous"
     *             }
     *         },
     *         "verb": {
     *             "id": "http://purl.org/xapi/games/verbs/choose"
     *         },
     *         "object": {
     *             "id": "http://a2:3000/api/proxy/gleaner/games/56a21ac020b8364200f67d84/56a21ac020b8364200f67d85/choice/PickSwordItem",
     *             "definition": {
     *                 "extensions": {
     *                     "versionId": "testVersionId",
     *                     "gameplayId": "100000000000000000000000"
     *                 }
     *             }
     *         },
     *         "result": {
     *             "extensions": {
     *                 "http://purl.org/xapi/games/ext/value": "Excalibur Mk. II"
     *             }
     *         }
     *     },
     *     {
     *         "timestamp": "2016-01-22T14:33:34.346Z",
     *         "actor": {
     *             "name": "56a23d8420b8364200f67d9f79692",
     *             "account": {
     *                 "homePage": "http://a2:3000/",
     *                 "name": "Anonymous"
     *             }
     *         },
     *         "verb": {
     *             "id": "http://purl.org/xapi/games/verbs/updated"
     *         },
     *         "object": {
     *             "id": "http://a2:3000/api/proxy/gleaner/games/56a21ac020b8364200f67d84/56a21ac020b8364200f67d85/variable/AvailableCoins",
     *             "definition": {
     *                 "extensions": {
     *                     "versionId": "testVersionId",
     *                     "gameplayId": "100000000000000000000000"
     *                 }
     *             }
     *         },
     *         "result": {
     *             "extensions": {
     *                 "http://purl.org/xapi/games/ext/value": "30"
     *             }
     *         }
     *     }
     * ]
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "message": "Success ",
     *          "id": "test-<versionId>"
     *      }
     *
     */
    router.post('/test/:versionId', function (req, res) {

        var analysisData = req.body;

        if (!analysisData || !analysisData.length ||
            analysisData.length === 0) {
            return res.status(400).json({
                message: 'Provide an array of xAPI Statements inside the body of the request.'
            });
        }

        var activityId = 'test-' + req.params.versionId.toLowerCase();
        var testVersionId = activityId;

        // Create the Kafka Topic
        var task = kafkaService.createTopic;

        task.call(null, activityId)
            .then(function (result) {
                startTopology(activityId, testVersionId, processTraces(analysisData, activityId, res));
            });
    });

    /**
     * @api {delete} /activities/data/:activityId Remove the activity analysis data with the id activityId.
     * @apiName deleteActivities
     * @apiGroup Activities
     *
     * @apiParam {String} versionId The versionId The activity id.
     * @apiParam {String} activityId The activityId The activity id.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *      }
     *
     */
    router.delete('/data/:activityId/', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'delete', '/activities/data/:activityId/')
            .then(function (activity) {
                return activities.deleteAnalysisData(req.app.config.storm, req.params.activityId, req.app.esClient);
            }), res);
    });

    /**
     * @api {delete} /activities/data/:activityId/:user Remove the user data from the analysis with analysisId.
     * @apiName deleteActivities
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The activity id.
     * @apiParam {String} user The user identifier.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *      }
     *
     */
    router.delete('/data/:activityId/:user', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'delete', '/activities/data/:activityId/:user')
            .then(function (activity) {
                return activities.deleteUserData(req.app.config.storm, req.params.activityId, req.params.user, req.app.esClient);
            }), res);
    });

    /**
     * @api {get} /activities/weights/:id Returns the document that define how to obtain a specific variable using children activities.
     * @apiName GetActivitiesWeights
     * @apiGroup Activities
     *
     * @apiParam {String} id The Activity id
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf501",
     *          "weights": [
     *              {
     *                  "name": "variable1",
     *                  "op": "+",
     *                  "children": [
     *                      {
     *                          "id": "559a447831b76cec185bf502",
     *                          "name": "variable1",
     *                          "multiplier": 0.5
     *                      },
     *                      {
     *                          "id": "559a447831b76cec185bf503",
     *                          "name" "variable2",
     *                          "multiplier": 2
     *                      }
     *                  ]
     *              },
     *              {
     *                  "name": "variable2",
     *                  "op": "*",
     *                  "children": [
     *                      {
     *                          "id": "559a447831b76cec185bf502",
     *                          "name": "variable2",
     *                          "multiplier": 1
     *                      }
     *                  ]
     *              }
     *          ]
     *      }
     */
    router.get('/weights/:id', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.id, username, 'get', '/activities/:activityId')
            .then(function (activity) {
                return req.app.esClient.search({
                    index: 'analytics-' + req.params.id,
                    q: '_id:weights_' + req.params.id
                }).then(function (response) {
                    if (response.hits.hits && response.hits.hits.length > 0) {
                        res.json(response.hits.hits[0]._source);
                    }
                }).catch(function(error) {
                    res.status(error.status);
                    res.json({message: 'No exist a weights document for Activity with id ' + req.params.id});
                });
            }), res);
    });

    /**
     * @api {post} /activities/weights/:id Post a document to define how to obtain a specific variable using children activities.
     * @apiName GetActivitiesWeights
     * @apiGroup Activities
     *
     * @apiParam {String} id The Activity id
     *
     * @apiSuccess(200) Success.
     *
     * @apiParamExample {json} Request-Example:
     *      {
     *          "weights": [
     *              {
     *                  "name": "variable1",
     *                  "op": "+",
     *                  "children": [
     *                      {
     *                          "id": "559a447831b76cec185bf502",
     *                          "name": "variable1",
     *                          "multiplier": 0.5
     *                      },
     *                      {
     *                          "id": "559a447831b76cec185bf503",
     *                          "name": "variable2",
     *                          "multiplier": 2
     *                      }
     *                  ]
     *              },
     *              {
     *                  "name": "variable2",
     *                  "op": "*",
     *                  "children": [
     *                      {
     *                          "id": "559a447831b76cec185bf502",
     *                          "name": "variable2",
     *                          "multiplier": 1
     *                      }
     *                  ]
     *              }
     *          ]
     *      }
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *      }
     */
    router.post('/weights/:id', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.id, username, 'get', '/activities/:activityId')
            .then(function () {
                var errors = [];
                req.body.weights.forEach(function (weight) {
                    if (!weight.name) {
                        errors.push(new Error('The field variable name (name) is necessary \n'));
                    }
                    if (!weight.op || (weight.op !== '+' && weight.op !== '*')) {
                        errors.push(new Error('The field operation (op) is necessary \n'));
                    }
                    if (weight.op === '*' && weight.children.length < 2) {
                        errors.push(new Error('The field children need more than one child if the operation is multiply \n'));
                    }
                    weight.children.forEach(function(child) {
                        if (!child.id) {
                            errors.push(new Error('The field child (id) is necessary \n'));
                        }
                        if (!child.name) {
                            errors.push(new Error('The field variable name (name) is necessary \n'));
                        }
                        if (!child.multiplier) {
                            errors.push(new Error('The field multiplier is necessary \n'));
                        }
                    });
                });
                if (errors.length > 0) {
                    var error = new Error(errors.toString());
                    error.status = 400;
                    throw error;
                }
                return req.app.esClient.index({
                    index: 'analytics-' + req.params.id,
                    type: 'analytics',
                    id: 'weights_' + req.params.id,
                    body: req.body
                }).then(function (response) {
                    res.json(response);
                }).catch(function(error) {
                    res.status(error.status);
                    res.json(error);
                });
            }), res);
    });


    /**
     * @api {get} /activities/:activityId/offspring Obtain the offsprings of the given activity
     * @apiName getActivityOffspring
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The activity id of the root node.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      [
     *          {
     *              "_id" : ObjectId("5b9a528e15f2cd007ad68992"),
     *              "name" : "1000000_mission_9u0bek58kw_(Dummy Mission)",
     *              "gameId" : ObjectId("5b165d4ac7171c007719bc61"),
     *              "versionId" : ObjectId("5b165d4ac7171c007719bc62"),
     *              "classId" : ObjectId("5b9a528815f2cd007ad68990"),
     *              "rootId" : "5b9a528a15f2cd007ad68991",
     *              "parent" : ObjectId("1"),
     *              "allowAnonymous" : false,
     *              "groups" : [],
     *              "groupings" : [],
     *              "created" : ISODate("2018-09-13T12:05:34.122Z"),
     *              "open" : true,
     *              "visible" : false,
     *              "trackingCode" : "5b9a528e15f2cd007ad68992qrrol0fmt38",
     *              "start" : ISODate("2018-09-13T12:05:37.272Z"),
     *              "end" : null
     *          },
     *          {
     *              "_id" : ObjectId("5b9a528e15f2cd007ad68993"),
     *              "name" : "1000000_activity_9u0bek58kw_qhh0dqn6sg_6_3_3681730053_(Activity 1)",
     *              "gameId" : ObjectId("5b165d4ac7171c007719bc61"),
     *              "versionId" : ObjectId("5b165d4ac7171c007719bc62"),
     *              "classId" : ObjectId("5b9a528815f2cd007ad68990"),
     *              "rootId" : "5b9a528a15f2cd007ad68991",
     *              "parent" : ObjectId("2"),
     *              "allowAnonymous" : false,
     *              "groups" : [],
     *              "groupings" : [],
     *              "created" : ISODate("2018-09-13T12:05:34.128Z"),
     *              "open" : true,
     *              "visible" : false,
     *              "trackingCode" : "5b9a528e15f2cd007ad68993en2pp3mly1f",
     *              "start" : ISODate("2018-09-13T12:05:37.749Z"),
     *              "end" : null
     *          }
     *      ]
     *
     */

    router.get('/:activityId/offspring', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'get', '/activities/:activityId')
            .then(function () {
                return activities.offspring(req.params.activityId);
            }), res);
    });

    /**
     * @api {get} /activities/:activityId/children Obtain the offsprings of the given activity
     * @apiName getActivityChildren
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The activity id of the parent.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      [
     *          {
     *              "_id" : ObjectId("5b9a528e15f2cd007ad68992"),
     *              "name" : "1000000_mission_9u0bek58kw_(Dummy Mission)",
     *              "gameId" : ObjectId("5b165d4ac7171c007719bc61"),
     *              "versionId" : ObjectId("5b165d4ac7171c007719bc62"),
     *              "classId" : ObjectId("5b9a528815f2cd007ad68990"),
     *              "rootId" : "5b9a528a15f2cd007ad68991",
     *              "parent" : ObjectId("2"),
     *              "allowAnonymous" : false,
     *              "groups" : [],
     *              "groupings" : [],
     *              "created" : ISODate("2018-09-13T12:05:34.122Z"),
     *              "open" : true,
     *              "visible" : false,
     *              "trackingCode" : "5b9a528e15f2cd007ad68992qrrol0fmt38",
     *              "start" : ISODate("2018-09-13T12:05:37.272Z"),
     *              "end" : null
     *          },
     *          {
     *              "_id" : ObjectId("5b9a528e15f2cd007ad68993"),
     *              "name" : "1000000_activity_9u0bek58kw_qhh0dqn6sg_6_3_3681730053_(Activity 1)",
     *              "gameId" : ObjectId("5b165d4ac7171c007719bc61"),
     *              "versionId" : ObjectId("5b165d4ac7171c007719bc62"),
     *              "classId" : ObjectId("5b9a528815f2cd007ad68990"),
     *              "rootId" : "5b9a528a15f2cd007ad68991",
     *              "parent" : ObjectId("2"),
     *              "allowAnonymous" : false,
     *              "groups" : [],
     *              "groupings" : [],
     *              "created" : ISODate("2018-09-13T12:05:34.128Z"),
     *              "open" : true,
     *              "visible" : false,
     *              "trackingCode" : "5b9a528e15f2cd007ad68993en2pp3mly1f",
     *              "start" : ISODate("2018-09-13T12:05:37.749Z"),
     *              "end" : null
     *          }
     *      ]
     *
     */

    router.get('/:activityId/children', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'get', '/activities/:activityId')
            .then(function () {
                return activities.children(req.params.activityId);
            }), res);
    });

    return router;
};