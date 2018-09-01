'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils'),
    Q = require('q');

var activities = require('../lib/activities'),
    classes = require('../lib/classes'),
    getRealTimeData = require('../lib/tracesConverter');

module.exports = function (kafkaService, stormService) {

    /**
     * @api {get} /classes Returns the Activities.
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
     *          "_id": "559a447831b76cec185bf501"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:00:52.630Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "Some Activity Name",
     *          "allowAnonymous": false,
     *          "teachers": ["Ben"],
     *          "students": ["Alice", "Dan"]
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
     *          "_id": "559a447831b76cec185bf501"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:00:52.630Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "Some Activity Name",
     *          "allowAnonymous": false,
     *          "teachers": ["Ben"],
     *          "students": ["Alice", "Dan"]
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
     *          "_id": "559a447831b76cec185bf501"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:00:52.630Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "Some Activity Name",
     *          "allowAnonymous": false,
     *          "teachers": ["Ben"],
     *          "students": ["Alice", "Dan"]
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
     *          "classId": "55e433c773415f105025d2d3"
     *      }
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3",
     *          "name": "New name",
     *          "created": "2015-08-31T12:55:05.459Z",
     *          "teachers": [
     *              "user"
     *          ],
     *          "_id": "55e44ea9f1448e1067e64d6c"
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
                    username, req.body.name, undefined, req.body.offline, allowAnonymous);
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
     *          "gameId": "55e433c773415f105025d2d4",
     *          "versionId": "55e433c773415f105025d2d5",
     *          "classId": "55e433c773415f105025d2d3",
     *          "name": "New name",
     *          "created": "2015-08-31T12:55:05.459Z",
     *          "teachers": [
     *              "user"
     *          ],
     *          "_id": "55e44ea9f1448e1067e64d6c"
     *      }
     *
     */
    router.post('/bundle', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        var config = req.app.config;

        restUtils.processResponse(classes.isAuthorizedFor(req.body.classId, username, 'post', '/activities/bundle')
            .then(function (classReq) {
                var deferred = Q.defer();

                var rootId = req.body.rootId;
                if (!req.body.rootId) {
                    rootId = '';
                }

                var allowAnonymous = req.body.allowAnonymous;
                if (!allowAnonymous) {
                    allowAnonymous = false;
                }
                activities.createActivity(req.body.gameId, req.body.versionId, req.body.classId, username, req.body.name, rootId, req.body.offline, allowAnonymous)
                .then(function(activity) {
                        return activities.kibana.getKibanaBaseVisualizations(config, activity, req.app.esClient)
                        .then(function(visualizations) {
                            console.log('PostBundle -> VisObtained!');
                            return activities.kibana.createIndex(config, activity, username, req.app.esClient)
                                .then(function(result) {
                                    console.log('PostBundle -> IndexCreated!');
                                    return activities.kibana.createVisualizationsAndDashboard(config, activity, visualizations, username, req.app.esClient);
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
     * @apiParam {String[]} [students] Array with the username of the students that you want to add to the activity. Also can be a String
     * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to add to the activity. Also can be a String
     * @apiParamExample {json} Request-Example:
     *      {
     *          "name": "My New Name",
     *          "allowAnonymous": true,
     *          "teachers": ["Some Teacher"],
     *          "students": ["Some Student"]
     *      }
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
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "My New Name",
     *          "allowAnonymous": true,
     *          "teachers": ["Some Teacher"],
     *          "students": ["Some Student"]
     *      }
     */
    router.put('/:activityId', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'put', '/activities/:activityId')
            .then(function (activity) {
                return activities.modifyActivity(req.params.activityId, req.body, true);
            }), res);
    });

    /**
     * @api {put} /activities/:activityId/remove Removes students and/or teachers from a activity.
     * @apiName putActivities
     * @apiGroup Activities
     *
     * @apiParam {String} activityId The id of the activity.
     * @apiParam {String[]} [students] Array with the username of the students that you want to remove from the activity. Also can be a String
     * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to remove from the activity. Also can be a String
     *
     * @apiParamExample {json} Request-Example:
     *      {
     *          "teachers": ["Some Teacher"],
     *          "students": ["Some Student"]
     *      }
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf511"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "classId": "559a447831b76cec185bf515",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "My New Name",
     *          "teachers": [],
     *          "students": []
     *      }
     */
    router.put('/:activityId/remove', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(activities.isAuthorizedFor(req.params.activityId, username, 'put', '/activities/:activityId/remove')
            .then(function (activity) {
                return activities.modifyActivity(req.params.activityId, req.body, false);
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

    return router;
};