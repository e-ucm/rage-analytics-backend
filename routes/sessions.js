'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var sessions = require('../lib/sessions'),
    getRealTimeData = require('../lib/tracesConverter');

module.exports = function (kafkaService, stormService) {

    /**
     * @api {get} /api/sessions/:id Returns the Session that has the given id.
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
     *          "_id": "559a447831b76cec185bf501"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:00:52.630Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "Some Session Name",
     *          "allowAnonymous": false,
     *          "teachers": ["Ben"],
     *          "students": ["Alice", "Dan"]
     *      }
     *
     */
    router.get('/:id', restUtils.findById(sessions));

    /**
     * @api {put} /sessions/:sessionId Changes the name, students and/or teachers array of a session.
     * @apiName putSessions
     * @apiGroup Sessions
     *
     * @apiParam {String} sessionId The id of the session.
     * @apiParam {String} [name] The new name of the session
     * @apiParam {Boolean} [allowAnonymous] Whether this session should process data from anonymous users or not.
     * @apiParam {String[]} [students] Array with the username of the students that you want to add to the session. Also can be a String
     * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to add to the session. Also can be a String
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
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "My New Name",
     *          "allowAnonymous": true,
     *          "teachers": ["Some Teacher"],
     *          "students": ["Some Student"]
     *      }
     */
    router.put('/:sessionId', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(sessions.modifySession(req.params.sessionId, username, req.body, true), res);
    });

    /**
     * @api {put} /sessions/:sessionId/remove Removes students and/or teachers from a session.
     * @apiName putSessions
     * @apiGroup Sessions
     *
     * @apiParam {String} sessionId The id of the session.
     * @apiParam {String[]} [students] Array with the username of the students that you want to remove from the session. Also can be a String
     * @apiParam {String[]} [teachers] Array with the username of the teachers that you want to remove from the session. Also can be a String
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
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "My New Name",
     *          "teachers": [],
     *          "students": []
     *      }
     */
    router.put('/:sessionId/remove', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(sessions.modifySession(req.params.sessionId, username, req.body, false), res);
    });

    /**
     * @api {delete} /sessions/:sessionId Deletes a session and all the results associated with it
     * @apiName deleteSessions
     * @apiGroup Sessions
     *
     * @apiParam {String} sessionId The id of the session.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *         "message": "Success."
     *      }
     */
    router.delete('/:sessionId', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(sessions.removeSession(req.params.sessionId, username), res);
    });

    /**
     * @api {get} /sessions/:sessionId/results Returns all the results of a session given a DSL query (body).
     * @apiName GetSessionResults
     * @apiGroup Sessions
     *
     * @apiParam {String} sessionId The Session id.
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
    router.get('/:sessionId/results', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(sessions.results(req.params.sessionId, username, req.app.esClient), res);
    });

    /**
     * @api {post} /sessions/:sessionId/results/:resultId Updates a specific result from a session.
     * @apiName PostSessionResults
     * @apiGroup Sessions
     *
     * @apiParam {String} sessionId Game id.
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
    router.post('/:sessionId/results/:resultId', function (req, res) {
        if (req.body && req.body._id) {
            delete req.body._id;
        }
        var username = req.headers['x-gleaner-user'];
        restUtils.processResponse(sessions.updateResult(req.params.sessionId, req.params.resultId, req.body, username, req.app.esClient), res);
    });

    /**
     * @api {post} /sessions/:sessionId/:event Starts or ends a session depending on the event value.
     * @apiName postSessions
     * @apiGroup Sessions
     *
     * @apiParam {String} event Determines if we should start or end a session. Allowed values: start, end.
     *
     * @apiSuccess(200) Success.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_id": "559a447831b76cec185bf511"
     *          "gameId": "559a447831b76cec185bf513",
     *          "versionId": "559a447831b76cec185bf514",
     *          "name": "The Session Name",
     *          "created": "2015-07-06T09:00:50.630Z",
     *          "start": "2015-07-06T09:01:52.636Z",
     *          "end": "2015-07-06T09:03:45.631Z",
     *          "name": "Some Session Name",
     *          "allowAnonymous": false,
     *          "teachers": ["Ben"],
     *          "students": ["Alice", "Dan"]
     *      }
     *
     */
    router.post('/:sessionId/event/:event', function (req, res) {
        var username = req.headers['x-gleaner-user'];
        switch (req.params.event) {
            case 'start': {
                restUtils.processResponse(sessions.startSession(username, req.params.sessionId), res);
                break;
            }
            case 'end': {
                restUtils.processResponse(sessions.endSession(username, req.params.sessionId), res);
                break;
            }
            default: {
                res.status(400).end();
                break;
            }
        }
    });

    var checkStatementsFormat = function (data) {
        for (var i = 0; i < data.length; ++i) {
            var realtimeData = getRealTimeData(data[i]);
            if (!realtimeData) {
                return false;
            }
        }
        return true;
    };

    var startTopology = function (sessionId, versionId, callback) {
        var task = stormService.startTopology;
        task.call(null, sessionId, versionId)
            .then(function (result) {
                callback(null, result);
            }).fail(function (err) {
                console.error('Error starting Storm Topology: ', err);
                callback(err);
            });
    };

    var processTraces = function (data, sessionId, res) {
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
                if (realtimeData) {
                    traces.push(realtimeData);
                }
            }
            kafkaService.send(sessionId, traces)
                .then(function (topicResult) {
                    res.json({
                        message: 'Success',
                        id: sessionId
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
                        id: sessionId
                    });
                });
        };
    };

    /**
     * @api {post} /sessions/test/:versionId Starts a TEST Kafka Topic and Storm Topology and sends the body data to the Kafka Topic.
     * @apiName postSessionsTest
     * @apiGroup Sessions
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

        if (!checkStatementsFormat(analysisData)) {
            return res.status(400).json({
                message: 'The statements format is not correct.'
            });
        }

        var sessionId = 'test-' + req.params.versionId.toLowerCase();
        var testVersionId = sessionId;

        // Create the Kafka Topic
        var task = kafkaService.createTopic;

        task.call(null, sessionId)
            .then(function (result) {
                startTopology(sessionId, testVersionId, processTraces(analysisData, sessionId, res));
            })
            .fail(function (err) {
                if (err) {
                    return res.status(400).json({
                        message: 'Error creating Kafka Topic: ' +
                        JSON.stringify(err)
                    });
                }
                startTopology(sessionId, testVersionId, processTraces(analysisData, sessionId, res));
            });
    });

    return router;
};