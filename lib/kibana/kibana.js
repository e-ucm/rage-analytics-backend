'use strict';

module.exports = (function () {
    var Q = require('q');
    var request = require('request');
    var kibana = {};
    var async = require('async');
    var db = require('../db');
    var Collection = require('easy-collections'),
    activities = new Collection(db, 'activities'),
    classes = new Collection(db, 'classes'),
    groups = new Collection(db, 'groups'),
    groupings = new Collection(db, 'groupings');

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

    var defaultObject = {
        out: {
            name: '',
            gameplayId: '',
            type_hashCode: 0,
            score: 0.01,
            response: '',
            type: '',
            event_hashcode: 0,
            target: '',
            versionId: '',
            success: false,
            gameplayId_hashCode: 0,
            event: '',
            timestamp: '2000-01-19T11:05:27.772Z',
            target_hashCode: 0,
            stored: '2000-01-19T11:05:27.772Z',
            progress: 0.01,
            time: 0.01,
            ext: {
                progress: 0.01,
                time: 0.01,
                location: {
                    lat: 0.01,
                    lon: 0.01
                }
            }
        }
    };

    kibana.defaultObject = defaultObject;

    var rootAuthToken;

    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

    /**
     * Get all participants of activity. If the activity use groupings, return the participants of the grouping, if use groups
     * return the participants of the groups. Else, return the participants of the parent class.
     * @param activityObj
     */
    var getActivityParticipants = function(activityObj, callback) {
        var deferred = Q.defer();


        var participants = {students: [], teachers: [], assistants: []};
        if (activityObj.groupings.length > 0) {
            console.log('using groupings');
            groupings.find({classId: activityObj.classId}).then(function (groupingsArray) {
                groups.find({classId: activityObj.classId}).then(function (groupsArray) {
                    activityObj.groupings.forEach(function(groupingId) {
                        addParticipantsFromGroupingId(participants, groupingsArray, groupsArray, groupingId);
                        deferred.resolve(participants);
                    });
                }).fail(function(error) {
                    deferred.reject(error);
                });
            })
            .fail(function(error) {
                deferred.reject(error);
            });
        } else if (activityObj.groups.length > 0) {
            console.log('using groups');
            groups.find({classId: activityObj.classId}).then(function (groupsArray) {
                activityObj.groups.forEach(function(groupId) {
                    addParticipantsFromGroupId(participants, groupsArray, groupId);
                    deferred.resolve(participants);
                }).fail(function(error) {
                    deferred.reject(error);
                });
            })
            .fail(function(error) {
                deferred.reject(error);
            });
        } else {
            console.log('using class');
            classes.findById(activityObj.classId).then(function (classObj) {
                deferred.resolve(classObj.participants);
            })
            .fail(function(error) {
                deferred.reject(error);
            });
        }

        return deferred.promise;
    };

    var addParticipantsFromGroupingId = function(participants, groupingsArray, groupsArray, groupingId) {
        for (var i = 0; i < groupingsArray.length; i++) {
            if (groupingId === groupingsArray[i]._id) {
                for (var j = 0; j < groupingsArray[i].groups.length; j++) {
                    addParticipantsFromGroupId(participants, groupsArray, groupingsArray[i].groups[j]);
                }
                break;
            }
        }
    };

    var addParticipantsFromGroupId = function(participants, groupsArray, groupId) {
        for (var i = 0; i < groupsArray.length; i++) {
            if (groupId === groupsArray[i]._id) {
                pushUsrFromGroupToParticipants(participants, groupsArray[i], 'teachers');
                pushUsrFromGroupToParticipants(participants, groupsArray[i], 'assistants');
                pushUsrFromGroupToParticipants(participants, groupsArray[i], 'students');
                return;
            }
        }
    };

    var pushUsrFromGroupToParticipants = function(participants, group, role) {
        group.participants[role].forEach(function (usr) {
            if (participants[role].indexOf(usr) === -1) {
                participants[role].push(usr);
            }
        });
    };

    /**
     * Creates a new analysis for the given versionId.
     * @Returns a promise with the analysis created
     */
    kibana.getVisualizations = function (user, gameId, esClient) {
        var deferred = Q.defer();

        esClient.search({
            index: '.games' + gameId,
            type: 'list',
            q: '_id:' + gameId
        }, function (error, response) {
            if (!error) {
                if (response.hits.hits[0]) {
                    if (user === 'dev') {
                        deferred.resolve(response.hits.hits[0]._source.visualizationsDev ? response.hits.hits[0]._source.visualizationsDev : []);
                    } else if ('tch') {
                        deferred.resolve(response.hits.hits[0]._source.visualizationsTch ? response.hits.hits[0]._source.visualizationsTch : []);
                    } else if ('all') {
                        var c = response.hits.hits[0]._source.visualizationsTch.concat(
                            response.hits.hits[0]._source.visualizationsDev.filter(function (item) {
                                return response.hits.hits[0]._source.visualizationsTch.indexOf(item) < 0;
                            }));
                        deferred.resolve(c);
                    }
                } else {
                    deferred.resolve([]);
                }
            } else {
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    kibana.getIndexTemplate = function(indexTemplateId, esClient) {
        var deferred = Q.defer();

        esClient.search({
            index: '.template',
            q: '_id:' + indexTemplateId
        }, function (error, response) {
            if (response.hits.hits[0]) {
                deferred.resolve(response.hits.hits[0]._source);
            } else {
                deferred.reject(new Error('Template not found', 404));
            }
        });

        return deferred.promise;
    };

    kibana.createIndexWithTemplate = function(indexName, indexTemplate, esClient) {
        var deferred = Q.defer();

        indexTemplate.title = indexName;
        console.log('kibana.createIndexWithTemplate -> Started, id: ' + indexName);

        esClient.index({
            index: '.kibana',
            type: 'index-pattern',
            id: indexName,
            body: indexTemplate
        }, function (error, response) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve(response);
            }
        });

        return deferred.promise;
    };


    kibana.createRequiredIndexes = function(indexName, indexTemplateId, user, config, esClient) {
        var deferred = Q.defer();

        kibana.addIndexObject(indexName, esClient)
            .then(function() {
                kibana.getIndexTemplate(indexTemplateId, esClient)
                    .then(function(indexTemplate) {
                        kibana.createIndexWithTemplate(indexName, indexTemplate, esClient)
                            .then(function() { return kibana.createIndexWithTemplate('thomaskilmann-' + indexName, indexTemplate, esClient); })
                            .then(function() { return kibana.buildKibanaResources(indexName, config, esClient); })
                            .then(function(kibanaResources) {
                                return kibana.updateActivityPermissions(indexName, kibanaResources, config, user);
                            })
                            .then(function() {
                                deferred.resolve();
                            })
                            .catch(function(err) {
                                deferred.reject(err);
                            });
                    })
                    .fail(function(error) {
                        deferred.reject(error);
                    });
            })
            .fail(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    kibana.cloneVisualizationForActivity = function(gameId, visualizationId, activityId, esClient) {
        var deferred = Q.defer();

        esClient.search({
            index: '.games' + gameId,
            q: '_id:' + visualizationId
        }, function (error, response) {
            if (!error) {
                if (response.hits.hits[0] && response.hits.hits[0]._source.kibanaSavedObjectMeta) {
                    var re = /"index":"(\w+-)?(\w+.?\w+)"/;
                    var obj = response.hits.hits[0]._source;
                    // Replace template and save it
                    var m = re.exec(obj.kibanaSavedObjectMeta.searchSourceJSON);

                    if (m && m.length > 1) {
                        obj.kibanaSavedObjectMeta.searchSourceJSON = obj.kibanaSavedObjectMeta.searchSourceJSON.replace(m[2], activityId);
                    }

                    esClient.index({
                        index: '.kibana',
                        type: 'visualization',
                        id: response.hits.hits[0]._id + '_' + activityId,
                        body: obj
                    }, function (error, result) {
                        if (!error) {
                            deferred.resolve(result);
                        } else {
                            deferred.reject(error);
                        }
                    });
                } else {
                    deferred.reject(new Error('Template not found', 404));
                }
            } else {
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    kibana.createDashboard = function (dashboard, activityId, esClient, config, user) {
        var deferred = Q.defer();
        console.log('kibana.createDashboard() -> started!');

        kibana.addIndexObject(activityId, esClient)
            .then(function() {
                esClient.index({
                    index: '.kibana',
                    type: 'dashboard',
                    id: 'dashboard_' + activityId,
                    body: dashboard
                }, function (error, response) {
                    if (!error) {
                        console.log('kibana.createDashboard() -> ADDED!');

                        var visualizations = JSON.parse(dashboard.panelsJSON);
                        var kibanaResources = ['dashboard_' + activityId];

                        for (var i = 0; i < visualizations.length; i++) {
                            kibanaResources.push(visualizations[i].id);
                        }

                        activities.findById(activityId).then(function (activityObj) {
                            if (activityObj) {
                                getActivityParticipants(activityObj)
                                    .then(function(participants) {
                                        var users = participants.students.concat(participants.teachers.concat(participants.assistants));
                                        kibana.auth(config, function(error, token) {
                                            if (error) {
                                                return deferred.reject(error);
                                            }
                                            async.every(users, function (user, cb) {
                                                kibana.updateKibanaPermission(config, user, kibanaResources, cb);
                                            }, function (err, result) {
                                                rootAuthToken = null;
                                                deferred.resolve(result);
                                            });
                                        });
                                    })
                                    .fail(function(error) {
                                        deferred.reject(error);
                                    });
                            }
                        });
                    } else {
                        deferred.reject(error);
                    }
                });
            })
            .fail(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    kibana.addIndexObject = function(activityId, esClient) {
        var deferred = Q.defer();

        esClient.indices.exists({index: activityId}, function (err, exists) {
            console.log('Including object in new activity');
            if (err || !exists) {
                kibana.getIndexObject(activityId, esClient)
                    .then(function(indexObject) { return kibana.insertIndexObject(activityId, indexObject, esClient); })
                    .then(function() {
                        deferred.resolve();
                    })
                    .catch(function(error) {
                        deferred.reject(error);
                    });
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    };

    kibana.getIndexObject = function(activityId, esClient) {
        var deferred = Q.defer();

        var activities = require('../activities');

        var indexObject = defaultObject;
        activities.findById(activityId)
            .then(function (activityObj) {
                if (activityObj) {
                    esClient.search({
                        index: '.objectfields',
                        type: 'object_fields',
                        q: '_id:' + 'object_fields' + activityObj.versionId
                    }, function (error, response) {
                        if (!error && response.hits && response.hits.hits && response.hits.hits.length > 0) {
                            indexObject = response.hits.hits[0]._source;
                        }

                        deferred.resolve(indexObject);
                    });
                }
            })
            .fail(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    kibana.insertIndexObject = function(activityId, indexObject, esClient) {
        var deferred = Q.defer();

        esClient.index({
            index: activityId,
            type: 'traces',
            body: indexObject
        }, function (error, created) {
            if (error) {
                deferred.reject();
            }else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    };

    kibana.updateActivityPermissions = function(activityId, kibanaResources, config, user) {
        var deferred = Q.defer();

        var activities = require('../activities');

        activities.findById(activityId)
            .then(function (activityObj) {
                console.log('kibana.updateActivityPermissions -> Activity Found');
                if (activityObj) {
                    getActivityParticipants(activityObj)
                        .then(function (participants) {
                            var users = participants.students.concat(participants.teachers.concat(participants.assistants));
                            kibana.auth(config, function(error, token) {
                                if (error) {
                                    return deferred.reject(error);
                                }
                                async.every(users, function (user, cb) {
                                    kibana.updateKibanaPermission(config, user, kibanaResources, function (err) {
                                        cb();
                                    });
                                }, function (err, result) {
                                    rootAuthToken = null;
                                    deferred.resolve(result);
                                });
                            });
                        })
                        .fail(function(error) {
                            deferred.reject(error);
                        });
                }
            })
        .fail(function(error) {
            console.log('kibana.updateActivityPermissions -> Error finding activity ' + activityId);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    /**
     * Logs in as an admin and tries to set the permissions for the user that
     * performed the request
     * @param config
     * @param data The Lookup permissions, e.g.
     *     {
     *          "key":"_id",
     *          "user": "dev"
     *          "resource":"id1",
     *          "methods":["post","put"],
     *          "url":"/url/*"
     *      }
     * @param callback
     */

    kibana.updateKibanaPermission = function (config, user, resources, callback) {
        var updateKP = function() {
            var baseUsersAPI = config.a2.a2ApiPath;
            request({
                uri: baseUsersAPI + 'applications/look/kibana',
                method: 'PUT',
                body: {
                    key: 'docs._id',
                    user: user,
                    resources: resources,
                    methods: ['post', 'put'],
                    url: '/elasticsearch/_mget'
                },
                json: true,
                headers: {
                    Authorization: 'Bearer ' + rootAuthToken
                }
            }, function (err, httpResponse, body) {
                if (err) {
                    return callback(err);
                }

                callback();
            });
        };

        if (!rootAuthToken) {
            kibana.auth(config, function() {
                updateKP();
            });
        }else {
            updateKP();
        }
    };

    kibana.auth = function(config, callback) {
        console.log('Refreshing auth token');
        var baseUsersAPI = config.a2.a2ApiPath;
        request.post(baseUsersAPI + 'login', {
            form: {
                username: config.a2.a2AdminUsername,
                password: config.a2.a2AdminPassword
            },
            json: true
        },
        function (err, httpResponse, body) {
            if (err) {
                return callback(err);
            }

            if (!body.user || !body.user.token) {
                var tokenErr = new Error('No user token (Wrong admin credentials)');
                tokenErr.status = 403;
                return callback(tokenErr);
            }

            rootAuthToken = body.user.token;

            return callback(null, rootAuthToken);
        });
    };

    /**
     * Creates a resources array to define the correct permissions
     * @param indexName
     * @param config
     * @param esClient
     */

    kibana.buildKibanaResources = function (indexName, config, esClient) {
        var deferred = Q.defer();

        console.log('kibana.buildKibanaResources -> Started!');

        esClient.search({
            size: 1,
            from: 0,
            index: '.kibana',
            type: 'config'
        }, function (error, response) {
            if (error) {
                return deferred.reject(error);
            }
            var resources = [];
            if (response.hits && response.hits.hits.length > 0) {
                response.hits.hits.forEach(function (hit) {
                    resources.push(hit._id);
                });
                resources.push(config.kibana.defaultIndex);
                resources.push(indexName);
                resources.push('thomaskilmann-' + indexName);

                console.log('kibana.buildKibanaResources -> SUCCESS!');
                deferred.resolve(resources);
            } else {
                console.log('kibana.buildKibanaResources -> ERROR!');
                deferred.reject(new Error('No Kibana version found!'));
            }
        });

        return deferred.promise;
    };

    return kibana;
})();