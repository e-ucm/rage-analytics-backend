'use strict';

var express = require('express'),
    router = express.Router(),
    Q = require('q'),
    restUtils = require('./rest-utils');

var classes = require('../lib/classes'),
    activities = require('../lib/activities'),
    kibana = require('../lib/kibana/kibana');
/**
 * @api {get} /classes Returns all the classes.
 * @apiName GetClasses
 * @apiGroup Classes
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b7acec185bf513",
 *              "created": "2015-08-31T12:55:05.459Z",
 *              "name": "My Class",
 *              "courseId": "5429l3v2jkfe20acec83tbf98s",
 *              "groups": ["group1", "group2"],
 *              "groupings": ["grouping1"],
 *              "participants":{
 *                  "students": ["st1", "st2"],
 *                  "assistants": ["as1", "as2"],
 *                  "teachers": ["teacher"]
 *              }
 *          }
 *      ]
 *
 */
router.get('/', restUtils.find(classes));

/**
 * @api {get} /classes/my Returns all the Classes where
 * the user participates.
 * @apiName GetClasses
 * @apiGroup Classes
 *
 *  @apiHeader {String} x-gleaner-user.
 *
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b76cec185bf501",
 *              "created": "2015-08-31T12:55:05.459Z",
 *              "name": 'first class',
 *              "courseId": "5429l3v2jkfe20acec83tbf98s",
 *              "groups": ["group1", "group2"],
 *              "groupings": ["grouping1"],
 *              "participants":{
 *                  "students": ["st1", "st2"],
 *                  "assistants": ["as1", "as2"],
 *                  "teachers": ["teacher"]
 *              },
 *              "externalId":[
 *                  { "domain": "d1", "id": "1" },
 *                  { "domain": "d2", "id": "2" }
 *              ]
 *          },
 *          {
 *              "_id": "559a447831b76cec185bf511",
 *              "created": "2015-08-31T12:55:05.459Z",
 *              "name": 'second class',
 *              "courseId": "5429l3v2jkfe20acec83tbf98s",
 *              "participants":{
 *                  "students": ["st1", "st2", "st3"],
 *                  "assistants": ["as2"],
 *                  "teachers": ["teacher2"]
 *              },
 *              "externalId":[
 *                  { "domain": "d1", "id": "4" }
 *              ]
 *          }
 *      ]
 *
 */
router.get('/my', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.getUserClasses(username), res);
});

/**
 * @api {get} /classes/:classId Returns a given class.
 * @apiName GetClasses
 * @apiGroup Classes
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *
 *      {
 *          "_id": "559a447831b76cec185bf501",
 *          "created": "2015-08-31T12:55:05.459Z",
 *          "name": "Some Class Name",
 *          "courseId": "5429l3v2jkfe20acec83tbf98s",
 *          "groups": ["group1", "group2"],
 *          "groupings": ["grouping1"],
 *          "participants":{
 *              "students": ["st1", "st2"],
 *              "assistants": ["as1", "as2"],
 *              "teachers": ["teacher"]
 *          },
 *          "externalId":[
 *              { "domain": "d1", "id": "1" },
 *              { "domain": "d2", "id": "2" }
 *          ]
 *      }
 *
 */
router.get('/:classId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedFor(req.params.classId, username, 'get', '/classes/:classId')
        .then(function (classReq) {
            return classReq;
        }), res);
});

router.get('/external/:domain/:externalId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedForExternal(req.params.domain, req.params.externalId, username, 'get', '/classes/external/:domain/:externalId')
        .then(function (classReq) {
            return classReq;
        }), res);
});

/**
 * @api {post} /classes Creates new Class.
 * @apiName PostClasses
 * @apiGroup Classes
 *
 * @apiParam {String} [name] The name of the class.
 * @apiParam {Object} [participants] The students, assistants and students in the class
 * @apiParam {String[]} [courseId] The id of the course that contains the class
 * @apiParam {String[]} [groups] Group Id of the group with the participants of the class
 * @apiParam {String[]} [groupings] Grouping Id of the grouping with the participants of the class
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
 *          "created": "2015-08-31T12:55:05.459Z",
 *          "participants":{
 *              "students": ["st1", "st2"],
 *              "assistants": ["as1", "as2"],
 *              "teachers": ["teacher"]
 *          },
 *          "_id": "55e44ea9f1448e1067e64d6c",
 *          "groups": [],
 *          "groupings": [],
 *          "externalId": []
 *      }
 *
 */
router.post('/', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.createClass(username, req.body.name || 'ClassWithoutName'), res);
});


/**
 * @api {post} /classes/bundle/ Creates new Class.
 * @apiName PostBundleClass
 * @apiGroup Classes
 *
 * @apiParam {String} [name] The name of the class.
 * @apiParam {Object} [participants] The students, assistants and students in the class
 * @apiParam {String[]} [courseId] The id of the course that contains the class
 * @apiParam {String[]} [groups] Group Id of the group with the participants of the class
 * @apiParam {String[]} [groupings] Grouping Id of the grouping with the participants of the class
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
 *          "created": "2015-08-31T12:55:05.459Z",
 *          "participants":{
 *              "students": ["st1", "st2"],
 *              "assistants": ["as1", "as2"],
 *              "teachers": ["teacher"]
 *          },
 *          "_id": "55e44ea9f1448e1067e64d6c",
 *          "groups": [],
 *          "groupings": [],
 *          "externalId": []
 *      }
 *
 */
router.post('/bundle', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    var config = req.app.config;
    var extra = {
        timeFrom: 'now-12w',
        refreshInterval: {
            display: '60 seconds',
            pause: false,
            section: 1,
            value: 60000
        }
    };

    restUtils.processResponse(classes.createClass(username, req.body.name || 'ClassWithoutName')
        .then(function (classObj) {
            var classId = classObj._id.toString();
            var deferred = Q.defer();
            var visualizations = require('../lib/kibana/classVisualizations');
            console.log('PostBundle -> VisObtained!');

            kibana.createRequiredIndexesForClass(classId, username, config, req.app.esClient)
                .then(function (result) {
                    console.log('PostBundle -> IndexCreated!');
                    return kibana.createVisualizationsAndDashboard(config, classId, null, visualizations, username,
                        req.app.esClient, extra);
                })
                .then(function (result) {
                    console.log('PostBundle -> VisAndDashCreated!');
                    deferred.resolve(classObj);
                })
                .fail(function (e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        }), res);

    console.log('PostBundle -> finnished!');
});

/**
 * @api {put} /classes/:classId Changes the name and participants of a class.
 * @apiName PutClasses
 * @apiGroup Classes
 *
 * @apiParam {String} sessionId The id of the session.
 * @apiParam {String} [name] The new name of the session
 * @apiParam {Object} [participants] Object with the participants
 * @apiParam {String[]} [groups] Group ids with of the participants
 * @apiParam {String[]} [groupings] Grouping ids with of the participants
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "name": "My New Name",
 *          "participants":{
 *              "students": ["st1", "st2"],
 *              "assistants": ["as1", "as2"],
 *              "teachers": ["teacher2"]
 *          },
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_id": "559a447831b76cec185bf511"
 *          "created": "2015-07-06T09:00:50.630Z",
 *          "name": "My New Name",
 *          "participants":{
 *              "students": ["st1", "st2"],
 *              "assistants": ["as1", "as2"],
 *              "teachers": ["teacher", "teacher2"]
 *          },
 *          groups: [],
 *          groupings: [],
 *          externalId: []
 *      }
 */
router.put('/:classId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedFor(req.params.classId, username, 'put', '/classes/:classId')
        .then(function (classReq) {
            return classes.modifyClass(req.params.classId, username, req.body, true);
        }), res);
});

router.put('/external/:domain/:externalId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedForExternal(req.params.domain, req.params.externalId, username, 'put', '/classes/external/:domain/:externalId')
        .then(function (classReq) {
            return classes.modifyClass(classReq._id, username, req.body, true);
        }), res);
});

/**
 * @api {put} /classes/:classId/remove Removes students and/or teachers from a class.
 * @apiName PutClasses
 * @apiGroup Classes
 *
 * @apiParam {String} classId The id of the class.
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
 *          "_id": "559a447831b76cec185bf511",
 *          "name": "My Class Name",
 *          "authors": ["someTeacher"],
 *          "teachers": ["someTeacher"],
 *          "students": []
 *      }
 */
router.put('/:classId/remove', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedFor(req.params.classId, username, 'put', '/classes/:classId/remove')
        .then(function (classReq) {
            return classes.modifyClass(req.params.classId, username, req.body, false);
        }), res);
});

router.put('/external/:domain/:externalId/remove', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedForExternal(req.params.domain, req.params.externalId, username, 'put', '/classes/external/:domain/:externalId/remove')
        .then(function (classReq) {
            return classes.modifyClass(classReq._id, username, req.body, false);
        }), res);
});

/**
 * @api {delete} /classes/:classId Deletes a class and all the sessions associated with it
 * @apiName DeleteClasses
 * @apiGroup Classes
 *
 * @apiParam {String} classId The id of the session.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "message": "Success."
 *      }
 */
router.delete('/:classId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedFor(req.params.classId, username, 'delete', '/classes/:classId')
        .then(function (classReq) {
            return classes.removeClass(req.params.classId, username);
        }), res);
});

router.delete('/external/:domain/:externalId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedForExternal(req.params.domain, req.params.externalId, username, 'delete', '/classes/external/:domain/:externalId')
        .then(function (classReq) {
            return classes.removeClass(classReq._id, username);
        }), res);
});

/**
 * ACTIVITIES
 */

/**
 * @api {get} /classes/:classId/activities Returns all the Activities of a
 * class.
 * @apiName GetActivities
 * @apiGroup Activities
 *
 * @apiParam {String} classId The Class id of the activity.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b76cec185bf501"
 *              "gameId": "559a447831b76cec185bf513",
 *              "versionId": "559a447831b76cec185bf514",
 *              "classId": "559a447831b76cec185bf542",
 *              "created": "2015-07-06T09:00:50.630Z",
 *              "start": "2015-07-06T09:00:52.630Z",
 *              "end": "2015-07-06T09:03:45.631Z"
 *          },
 *          {
 *              "_id": "559a447831b76cec185bf511"
 *              "gameId": "559a447831b76cec185bf513",
 *              "versionId": "559a447831b76cec185bf514",
 *              "classId": "559a447831b76cec185bf547",
 *              "created": "2015-07-06T09:00:50.630Z",
 *              "start": "2015-07-06T09:03:52.636Z",
 *              "end": "2015-07-06T09:03:58.631Z"
 *          }
 *      ]
 *
 */
router.get('/:classId/activities', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedFor(req.params.classId, username, 'get', '/classes/:classId/activities')
        .then(function (classReq) {
            return activities.getClassActivities(req.params.classId);
        }), res);
});

/**
 * @api {get} /classes/:classId/sessions/my Returns all the Activities of a given
 * class where the user participates.
 * @apiName GetActivities
 * @apiGroup Activities
 *
 *  @apiHeader {String} x-gleaner-user.
 *
 * @apiParam {String} classId The Class id of the activity.
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *          {
 *              "_id": "559a447831b76cec185bf501"
 *              "gameId": "559a447831b76cec185bf513",
 *              "versionId": "559a447831b76cec185bf514",
 *              "classId": "559a447831b76cec185bf542",
 *              "start": "2015-07-06T09:00:52.630Z",
 *              "end": "2015-07-06T09:03:45.631Z"
 *          },
 *          {
 *              "_id": "559a447831b76cec185bf511"
 *              "gameId": "559a447831b76cec185bf513",
 *              "versionId": "559a447831b76cec185bf514",
 *              "classId": "559a447831b76cec185bf546",
 *              "start": "2015-07-06T09:03:52.636Z"
 *          }
 *      ]
 *
 */
router.get('/:classId/activities/my', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedFor(req.params.classId, username, 'get', '/classes/:classId/activities/my')
        .then(function (classReq) {
            return activities.getUserActivitiesByClass(req.params.classId, username);
        }), res);
});

module.exports = router;