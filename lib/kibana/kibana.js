'use strict';

module.exports = (function () {
    var Q = require('q');
    var request = require('request');
    var kibana = {};
    var async = require('async');
    var db = require('../db');
    var Collection = require('easy-collections'),
        activities = new Collection(db, 'activities'),
        games = new Collection(db, 'games'),
        versions = new Collection(db, 'versions'),
        classes = new Collection(db, 'classes'),
        groups = new Collection(db, 'groups'),
        groupings = new Collection(db, 'groupings'),
        dashboardtemplates = new Collection(db, 'dashboardtemplates');

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
        },
        activityName: '',
        activityId: '',
        classId: ''
    };

    var defaultObjectClassIndexObject = defaultObject;

    var classIndexTemplate = require('../../lib/kibana/defaultIndex');

    kibana.defaultObject = defaultObject;

    var rootAuthToken;

    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

    var getParticipants = function (objectId) {
        var deferred = Q.defer();
        objectId = objectId.toString();
        console.log('kibana.updateActivityPermissions -> Obtaining participants for: ' + objectId);
        activities.findById(objectId)
            .then(function (activityObj) {
                if (activityObj) {
                    console.log('kibana.updateActivityPermissions -> Activity Found');
                    resolveParticipants(activityObj.groups, activityObj.groupings, activityObj.classId)
                        .then(function (participants) {
                            var users = participants.students.concat(participants.assistants.concat(participants.teachers));
                            deferred.resolve(users);
                        })
                        .fail(deferred.reject);
                } else {
                    console.log('kibana.updateActivityPermissions -> Activity not found. Trying to find participants in class');
                    return classes.findById(objectId)
                        .then(function (classObj) {
                            if (classObj) {
                                console.log('kibana.updateActivityPermissions -> Class Found');
                                resolveParticipants(classObj.groups, classObj.groupings, classObj._id)
                                    .then(function (participants) {
                                        var users = participants.students.concat(participants.assistants.concat(participants.teachers));
                                        deferred.resolve(users);
                                    })
                                    .fail(deferred.reject);
                            } else {
                                console.log('kibana.updateActivityPermissions -> Trying to find participants in version');
                                return versions.findById(objectId)
                                    .then(function (versionObj) {
                                        if (versionObj) {
                                            console.log('kibana.updateActivityPermissions -> Version found');
                                            return games.findById(versionObj.gameId);
                                        }
                                        deferred.reject(new Error('Version not found', 404));
                                    })
                                    .then(function (gameObj) {
                                        if (gameObj) {
                                            console.log('kibana.updateActivityPermissions -> Game found');
                                            var participants = gameObj.developers ? gameObj.developers : [];
                                            if (gameObj.authors && gameObj.authors.length) {
                                                participants = gameObj.authors.concat(participants);
                                            }
                                            deferred.resolve(participants);
                                        } else {
                                            deferred.reject(new Error('Game not found', 404));
                                        }
                                    });
                            }
                        });
                }
            })
            .fail(deferred.reject);
        return deferred.promise;
    };

    /**
     * Get all participants of activity. If the activity use groupings, return the participants of the grouping, if use groups
     * return the participants of the groups. Else, return the participants of the parent class.
     * @param activityObj
     */
    var resolveParticipants = function (groupsObj, groupingsObj, classId, callback) {
        var deferred = Q.defer();

        var participants = {students: [], teachers: [], assistants: []};
        if (groupingsObj.length > 0) {
            console.log('using groupings');
            groupings.find({classId: classId}).then(function (groupingsArray) {
                groups.find({classId: classId}).then(function (groupsArray) {
                    groupingsObj.forEach(function (groupingId) {
                        addParticipantsFromGroupingId(participants, groupingsArray, groupsArray, groupingId);
                    });
                    deferred.resolve(participants);
                }).fail(deferred.reject);
            }).fail(deferred.reject);
        } else if (groupsObj.length > 0) {
            console.log('using groups');
            groups.find({classId: classId}).then(function (groupsArray) {
                groupsObj.forEach(function (groupId) {
                    addParticipantsFromGroupId(participants, groupsArray, groupId);
                });
                deferred.resolve(participants);
            }).fail(deferred.reject);
        } else {
            console.log('using class');
            classes.findById(classId).then(function (classObj) {
                deferred.resolve(classObj.participants);
            }).fail(deferred.reject);
        }

        return deferred.promise;
    };

    var addParticipantsFromGroupingId = function (participants, groupingsArray, groupsArray, groupingId) {
        for (var i = 0; i < groupingsArray.length; i++) {
            if (groupingId === groupingsArray[i]._id) {
                for (var j = 0; j < groupingsArray[i].groups.length; j++) {
                    addParticipantsFromGroupId(participants, groupsArray, groupingsArray[i].groups[j]);
                }
                break;
            }
        }
    };

    var addParticipantsFromGroupId = function (participants, groupsArray, groupId) {
        for (var i = 0; i < groupsArray.length; i++) {
            if (groupId === groupsArray[i]._id) {
                pushUsrFromGroupToParticipants(participants, groupsArray[i], 'teachers');
                pushUsrFromGroupToParticipants(participants, groupsArray[i], 'assistants');
                pushUsrFromGroupToParticipants(participants, groupsArray[i], 'students');
                return;
            }
        }
    };

    var pushUsrFromGroupToParticipants = function (participants, group, role) {
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
                    console.log('kibana.getVisualizations -> Visualizations not found for game: ', gameId);
                    deferred.resolve([]);
                }
            } else {
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    kibana.getIndexTemplate = function (indexTemplateId, esClient) {
        var deferred = Q.defer();

        esClient.search({
            index: '.template',
            q: '_id:' + indexTemplateId
        }, function (error, response) {
            if (!error) {
                if (response.hits.hits[0]) {
                    deferred.resolve(response.hits.hits[0]._source);
                } else {
                    deferred.reject(new Error('Template not found with id: ' + indexTemplateId, 404));
                }
            } else {
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    kibana.createIndexPatternWithTemplate = function (indexNames, indexTemplate, esClient) {

        if (!Array.isArray(indexNames)) {
            indexNames = [indexNames];
        }

        var promises = [];
        indexNames.forEach(function (indexName) {
            var indexPromise = Q.defer();

            indexTemplate.title = indexName;
            console.log('kibana.createIndexPatternWithTemplate -> Started, id: ' + indexName);

            promises.push(indexPromise.promise);
            esClient.index({
                index: '.kibana',
                type: 'index-pattern',
                id: indexName,
                body: indexTemplate
            }, function (error, response) {
                if (error) {
                    indexPromise.reject(error);
                } else {
                    indexPromise.resolve(response);
                }
            });
        });

        return Q.all(promises);
    };

    /**
     * Creates the required kibana indices using an index object as a base.
     *
     * @param  {string} indexName       Name of the new index (usually ActivityID)
     * @param  {string} indexTemplateId Version ID to use as base index object
     * @param  {string} user            Updates the permissions for this user
     * @param  {object} config          Config of the Backend
     * @param  {object} esClient        ElasticSearch client
     * @return {object}                 Nothing or error if happened
     */
    kibana.createKibanaIndicesIndexObject = function (indexName, indexTemplateId, user, config, esClient) {
        var deferred = Q.defer();

        var dataIndices = [indexName/*, 'thomaskilmann-' + indexName*/];

        console.log('kibana.createKibanaIndicesIndexObject -> Started!');
        kibana.addIndexObject(indexName, indexTemplateId, esClient)
            .then(function () {
                console.log('kibana.createKibanaIndicesIndexObject -> Recreating the index pattern!');
                return kibana.regenerateIndexPattern(indexName, config);
            })
            .then(function () {
                console.log('kibana.createKibanaIndicesIndexObject -> Building kibana resources!');
                return kibana.buildKibanaResources(dataIndices, config, esClient);
            })
            .then(function (kibanaResources) {
                console.log('kibana.createKibanaIndicesIndexObject -> Updating permissions!');
                return kibana.updateActivityPermissions(indexName, kibanaResources, config, user);
            })
            .then(function () {
                console.log('kibana.createKibanaIndicesIndexObject -> Done!');
                deferred.resolve();
            })
            .catch(function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    };


    /**
     * Creates the required kibana indices using an index pattern as a base.
     * IMPORTANT: In this current version, kibana does NOT use the index pattern
     * this is why we are using Index Object as solution.
     *
     * @param  {string} indexName       Name of the new index (usually ActivityID)
     * @param  {string} indexTemplateId Game ID to use as base index template
     * @param  {string} user            Updates the permissions for this user
     * @param  {object} config          Config of the Backend
     * @param  {object} esClient        ElasticSearch client
     * @return {object}                 Nothing or error if happened
     */
    kibana.createKibanaIndicesIndexPattern = function (indexName, indexTemplateId, user, config, esClient) {
        var deferred = Q.defer();

        var dataIndices = [indexName/*, 'thomaskilmann-' + indexName*/];

        console.log('kibana.createKibanaIndicesIndexPattern -> Started!');
        kibana.getIndexTemplate(indexTemplateId, esClient)
            .then(function (indexTemplate) {
                console.log('kibana.createKibanaIndicesIndexPattern -> Index template obtained!');
                kibana.createIndexPatternWithTemplate(dataIndices, indexTemplate, esClient)
                    .then(function () {
                        console.log('kibana.createKibanaIndicesIndexPattern -> Building kibana resources!');
                        return kibana.buildKibanaResources(dataIndices, config, esClient);
                    })
                    .then(function (kibanaResources) {
                        console.log('kibana.createKibanaIndicesIndexPattern -> Updating permissions!');
                        return kibana.updateActivityPermissions(indexName, kibanaResources, config, user);
                    })
                    .then(function () {
                        console.log('kibana.createKibanaIndicesIndexPattern -> Done!');
                        deferred.resolve();
                    })
                    .catch(function (err) {
                        deferred.reject(err);
                    });
            })
            .fail(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };


    kibana.indexVisualizationList = function (id, list, esClient) {

        var deferred = Q.defer();

        esClient.index({
            index: '.games' + id,
            type: 'list',
            id: id,
            body: list
        }, function (error, response) {
            if (!error) {
                deferred.resolve(response);
            } else {
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    kibana.getKibanaBaseVisualizations = function(role, config, id, esClient) {
        var deferred = Q.defer();

        console.log('Kibana.getKibanaBaseVisualizations() -> Started');

        kibana.getVisualizations(role, id, esClient)
            .then(function(visualizations) {
                deferred.resolve(visualizations);
            })
            .fail(function(error) {
                console.log('Kibana.getKibanaBaseVisualizations() -> ERROR!');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    kibana.getTemplatesByAuthor = function(idAuthor, esClient) {
        var deferred = Q.defer();

        esClient.search({
            size: 100,
            from: 0,
            index: '.template',
            q: 'author:' + idAuthor
        }, function (error, response) {
            if (!error) {
                if (response.hits && response.hits.hits) {
                    deferred.resolve(response.hits.hits);
                } else {
                    deferred.resolve([]);
                }
            } else {
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    kibana.indexTemplate = function (type, id, body, esClient) {
        var deferred = Q.defer();

        esClient.index({
            index: '.template',
            type: type,
            id: id,
            body: body
        }, function (error, response) {
            if (!error) {
                deferred.resolve(response);
            } else {
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    kibana.setGameVisualizationByTemplate = function (gameId, id, visualization, fields, esClient) {
        var deferred = Q.defer();

        Object.keys(fields).forEach(function (key) {
            visualization.visState = visualization.visState.replace(new RegExp(key, 'g'), fields[key]);
        });

        esClient.index({
            index: '.games' + gameId,
            type: 'visualization',
            id: id,
            body: visualization
        }, function (error, response) {
            if (!error) {
                return deferred.resolve(response);
            }
            deferred.reject(error);
        });

        return deferred.promise;
    };

    kibana.createIndex = function(config, indexName, indexTemplateId, user, esClient) {
        var deferred = Q.defer();
        console.log('kibana.createIndex() -> Started');

        kibana.createKibanaIndicesIndexObject(indexName, indexTemplateId, user, config, esClient)
            .then(function(ret) {
                console.log('kibana.createIndex() -> Success, resolving!');
                return deferred.resolve(ret);
            })
            .fail(function(error) {
                if (error) {
                    console.log('kibana.createIndex() -> ERROR!');
                    console.log(JSON.stringify(error, null, 2));
                    console.log(indexName);
                    console.log(indexTemplateId);
                    return deferred.reject(error);
                }
            });

        return deferred.promise;
    };

    kibana.createVisualizationsAndDashboard = function(config, type, object, visualizations, user, esClient, extra) {
        var deferred = Q.defer();

        console.log('kibana.createVisualizationsAndDashboard() -> Started');

        var numPan = 1;
        var panels = [];
        var uiStates = {};

        var Completed = function() {
            numPan++;

            console.log('kibana.createVisualizationsAndDashboard() -> Vis created ' + numPan + '/' + visualizations.length);
            if (numPan > visualizations.length) {


                kibana.generateDashboard(object, panels, uiStates, extra, type)
                    .then(function(dashboard){
                        kibana.createDashboard(dashboard, object._id, object.gameId, esClient, config, user)
                            .then(function(res) {
                                console.log('kibana.createVisualizationsAndDashboard() -> Success, resolving!');
                                deferred.resolve(res);
                            })
                            .fail(function(err) {
                                console.log('kibana.createVisualizationsAndDashboard() -> ERROR on creating the dashboard!');
                                console.log(JSON.stringify(err, null, 2));
                                deferred.reject(err);
                            });
                    })
                    .fail(function(error){
                        console.log('kibana.createVisualizationsAndDashboard() -> ERROR on generating the dashboard template!');
                        console.log(JSON.stringify(err, null, 2));
                        deferred.reject(err);
                    });
            }
        };

        var createVis = function(position) {
            kibana.createVisualization(config, type, object, visualizations[position], position, esClient)
                .then(function(panel) {
                    panels.push(panel);
                    uiStates['P-' + position] = {vis: {legendOpen: false}};

                    console.log('kibana.createVisualizationsAndDashboard() -> Completing');
                    Completed();
                })
                .fail(function(error) {
                    console.log('kibana.createVisualizationsAndDashboard() -> ERROR on creating visualization!');
                    console.log(JSON.stringify(error, null, 2));
                    return deferred.reject(error);
                });

        };

        if (visualizations.length > 0) {
            for (var i = 0; i < visualizations.length; i++) {
                createVis(i);
            }
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    };

    kibana.generateDashboard = function(object, panels, uistates, extra, type){
        let deferred = Q.defer();

        let dashboard = '';

        kibana.getDashboardTemplate(object.gameId)
            .then(function(dtobject){
                if(dtobject){
                    let role = '';
                    switch (type){
                        case 'class':
                        case 'activity':{
                            role = 'teacher';
                            break;
                        }
                        case 'version':
                        default: {
                            role = 'developer';
                            break;
                        }
                    }

                    if(dtobject[role]){
                        deferred.resolve(generateDashboardFromTemplate(object._id, dtobject[role]));
                    }else{
                        deferred.resolve(generateDashboardFromPanels(object._id, panels, uiStates, extra));
                    }
                }else{
                    deferred.resolve(generateDashboardFromPanels(object._id, panels, uiStates, extra));
                }
            })
            .fail(function(error){
                deferred.reject(error);
            })

        

        return deferred.promise;
    }

    kibana.generateDashboardFromPanels = function(id, panels, uiStates, extra) {
        console.log('Kibana -> generateDashboard');

        var timeFrom = 'now-1h';
        var refreshInterval = {
            display: '5 seconds',
            pause: false,
            section: 1,
            value: 5000
        };

        if (extra) {
            if (extra.timeFrom) {
                timeFrom = extra.timeFrom;
            }
            if (extra.refreshInterval) {
                refreshInterval = extra.refreshInterval;
            }
        }

        return {
            title: 'dashboard_' + id,
            hits: 0,
            description: '',
            panelsJSON: '[' + panels.toString() + ']',
            optionsJSON: '{"darkTheme":false}',
            uiStateJSON: JSON.stringify(uiStates),
            version: 1,
            timeRestore: true,
            timeTo: 'now',
            timeFrom: timeFrom,
            refreshInterval: refreshInterval,
            kibanaSavedObjectMeta: {
                searchSourceJSON: '{"filter":[{"query":{"query_string":{"query":"*","analyze_wildcard":true}}}]}'
            }
        };
    };

    kibana.generateDashboardFromTemplate = function(activityId, dashboard){
        match = /dashboard_(.*?)\"/.exec(dashboard);

        if(match.length < 2){
            return false;
        }

        return dashboard.replace(new RegExp(match[1], 'g'), activityId);
    };

    kibana.createVisualization = function(config, type, object, visualizationId, position, esClient) {
        var deferred = Q.defer();
        console.log('Kibana.createVisualization() -> Started!');

        var cloneVisualizationPromise = {};


        switch (type){
            case 'class': {
                cloneVisualizationPromise = kibana.cloneVisualizationForClass(visualizationId, object._id, esClient);
                visualizationId = visualizationId.title;
                break;
            }
            case 'version': {
                cloneVisualizationPromise = kibana.cloneVisualizationForVersion(object.gameId, visualizationId, object._id, esClient);
                break;
            }
            case 'activity': {
                cloneVisualizationPromise = kibana.cloneVisualizationForActivity(object.gameId, visualizationId, object._id, object.rootId, esClient);
                break;
            }
            default: {
                cloneVisualizationPromise = kibana.cloneVisualizationForVersion(object.gameId, visualizationId, object._id, object.rootId, esClient);
                break;
            }
        }

        cloneVisualizationPromise.then(function (result) {
                console.log('Activities.kibana.createVisualization() -> Success, resolving!');
                deferred.resolve('{\"id\":\"' + visualizationId + '_' + object._id.toString() +
                    '\",\"type\":\"visualization\",\"panelIndex\":' + position + ',' +
                    '\"size_x\":6,\"size_y\":4,\"col\":' + (1 + (position - 1 % 2)) + ',\"row\":' +
                    (position + 1 / 2) + '}');
            })
            .fail(function(err) {
                console.log('Kibana.createVisualization() -> ERROR on creating visualization!');
                deferred.reject(err);
            });

        return deferred.promise;
    };

    kibana.createRequiredIndexesForClass = function (classId, user, config, esClient) {
        var deferred = Q.defer();

        esClient.indices.exists({index: classId}, function (err, exists) {
            console.log('Including object in new activity');
            if (err || !exists) {
                kibana.getIndexObject(classId, esClient)
                    .then(function (indexObject) {
                        return kibana.insertIndexObject(classId, indexObject, esClient);
                    })
                    .then(function () {
                        return kibana.createIndexPatternWithTemplate(classId, classIndexTemplate, esClient);
                    })
                    .then(function () {
                        deferred.resolve();
                    })
                    .catch(function (error) {
                        deferred.reject(error);
                    });
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    };

    kibana.cloneVisualizationForActivity = function (gameId, visualizationId, activityId, rootId, esClient) {
        var deferred = Q.defer();
        var hasRootId = rootId !== null && rootId !== '';

        esClient.search({
            index: '.games' + gameId,
            q: '_id:' + visualizationId
        }, function (error, response) {
            if (!error) {
                if (response.hits.hits[0] && response.hits.hits[0]._source.kibanaSavedObjectMeta) {
                    var hit = response.hits.hits[0];
                    var obj = hit._source;
                    var searchSource = JSON.parse(obj.kibanaSavedObjectMeta.searchSourceJSON);

                    searchSource.index = hasRootId ? rootId : activityId;

                    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                    if (searchSource.query && searchSource.query.query_string) {
                        if (!searchSource.query.query_string.query || searchSource.query.query_string.query === '') {
                            searchSource.query.query_string.query = 'activityId:' + activityId;
                        }else {
                            searchSource.query.query_string.query = '(' + searchSource.query.query_string.query + ')';
                            searchSource.query.query_string.query += ' AND activityId:' + activityId;
                        }
                    }else {
                        searchSource.query = {query_string: {analyze_wildcard: true,query: 'activityId:' + activityId}};
                    }
                    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

                    obj.kibanaSavedObjectMeta.searchSourceJSON = JSON.stringify(searchSource);

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

    kibana.cloneVisualizationForVersion = function (gameId, visualizationId, versionId, esClient) {
        var deferred = Q.defer();

        esClient.search({
            index: '.games' + gameId,
            q: '_id:' + visualizationId
        }, function (error, response) {
            if (!error) {
                if (response.hits.hits[0] && response.hits.hits[0]._source.kibanaSavedObjectMeta) {
                    var hit = response.hits.hits[0];
                    var obj = hit._source;
                    var searchSource = JSON.parse(obj.kibanaSavedObjectMeta.searchSourceJSON);

                    searchSource.index = versionId;
                    obj.kibanaSavedObjectMeta.searchSourceJSON = JSON.stringify(searchSource);

                    esClient.index({
                        index: '.kibana',
                        type: 'visualization',
                        id: response.hits.hits[0]._id + '_' + versionId,
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


    kibana.cloneVisualizationForClass = function (visualization, classId, esClient) {
        var deferred = Q.defer();

        if (visualization && visualization.kibanaSavedObjectMeta) {
            var re = /"index":"(\w+-)?(\w+.?\w+)"/;
            var obj = visualization;
            delete obj.isClass;
            // Replace template and save it
            var m = re.exec(obj.kibanaSavedObjectMeta.searchSourceJSON);

            if (m && m.length > 1) {
                obj.kibanaSavedObjectMeta.searchSourceJSON = obj.kibanaSavedObjectMeta.searchSourceJSON.replace(m[2], classId);
            }

            esClient.index({
                index: '.kibana',
                type: 'visualization',
                id: obj.title + '_' + classId,
                body: obj
            }, function (error, result) {
                if (!error) {
                    deferred.resolve(result);
                } else {
                    deferred.reject(error);
                }
            });
        } else {
            deferred.reject(new Error('Visualization not provided correctly', 404));
        }

        return deferred.promise;
    };

    kibana.createDashboard = function (dashboard, id, parentId, esClient, config, user) {
        var deferred = Q.defer();

        esClient.index({
            index: '.kibana',
            type: 'dashboard',
            id: 'dashboard_' + id,
            body: dashboard
        }, function (error, response) {
            if (!error) {

                var visualizations = JSON.parse(dashboard.panelsJSON);
                var kibanaResources = ['dashboard_' + id];

                for (var i = 0; i < visualizations.length; i++) {
                    kibanaResources.push(visualizations[i].id);
                }

                getParticipants(id)
                    .then(function (participants) {
                        kibana.auth(config, function (error, token) {
                            if (error) {
                                return deferred.reject(error);
                            }
                            async.every(participants, function (user, cb) {
                                kibana.updateKibanaPermission(config, user, kibanaResources, cb);
                            }, function (err, result) {
                                rootAuthToken = null;
                                deferred.resolve(result);
                            });
                        });
                    })
                    .fail(function (error) {
                        deferred.reject(error);
                    });
            } else {
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    kibana.saveDashboardTemplate = function (dashboard, game) {
        var deferred = Q.defer();

        dashboardtemplates.findById(game)
            .then(function (dtobject) {
                let found = true;
                if (!dtobject) {
                    found = false;
                    dtobject = {
                        _id: game,
                        teacher: null,
                        developer: null
                    };
                };

                dtobject.teacher = dashboard.teacher;
                dtobject.developer = dashboard.developer;

                if(found){
                    dashboardtemplates.findAndUpdate(game, dtobject)
                        .then(function(updated){
                            deferred.resolve(updated);
                        })
                        .fail(function(error){
                            deferred.reject(error);
                        });
                }else{
                    dashboardtemplates.insert(dtobject)
                        .then(function(inserted){
                            deferred.resolve(inserted);
                        })
                        .fail(function(error){
                            deferred.reject(error);
                        });
                }
            })
            .fail(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    kibana.getDashboardTemplate = function (game) {
        var deferred = Q.defer();

        dashboardtemplates.findById(game)
            .then(function (dtobject) {
                if(!dtobject){
                    dtobject = {
                        _id: game,
                        teacher: null,
                        developer: null
                    };
                }
                deferred.resolve(dtobject);
            })
            .fail(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    kibana.addIndexObject = function (id, parentId, esClient) {
        var deferred = Q.defer();

        esClient.indices.exists({index: id}, function (err, exists) {
            console.log('Including object in new activity');
            if (err || !exists) {
                kibana.getIndexObject(parentId, esClient)
                    .then(function (indexObject) {
                        return kibana.insertIndexObject(id, indexObject, esClient);
                    })
                    .then(function () {
                        deferred.resolve();
                    })
                    .fail(function (error) {
                        deferred.reject(error);
                    });
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    };

    kibana.getIndexObject = function (id, esClient) {
        var deferred = Q.defer();

        var indexObject = defaultObject;
        esClient.search({
            index: '.objectfields',
            type: 'object_fields',
            q: '_id:' + 'object_fields' + id
        }, function (error, response) {
            if (!error && response.hits && response.hits.hits && response.hits.hits.length > 0) {
                indexObject = response.hits.hits[0]._source;
            }
            deferred.resolve(indexObject);
        });

        return deferred.promise;
    };

    kibana.getIndexObjectForClass = function (classId, esClient) {
        var deferred = Q.defer();

        classes.findById(classId)
            .then(function (classObj) {
                if (classObj) {
                    deferred.resolve(defaultObjectClassIndexObject);
                }
            })
            .fail(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };


    kibana.getIndexObjectFromClass = function (classId, esClient) {
        var deferred = Q.defer();

        var classes = require('../classes');

        var indexObject = defaultObject;
        classes.findById(classId)
            .then(function (classObj) {
                if (classObj) {
                    esClient.search({
                        index: '.objectfields',
                        type: 'object_fields',
                        q: '_id:' + 'object_fields' + classObj._id
                    }, function (error, response) {
                        if (!error && response.hits && response.hits.hits && response.hits.hits.length > 0) {
                            indexObject = response.hits.hits[0]._source;
                        }

                        deferred.resolve(indexObject);
                    });
                } else {
                    deferred.reject({message: 'Class not found for id: ' + classId});

                }
            })
            .fail(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    kibana.insertIndexObject = function (id, indexObject, esClient) {
        var deferred = Q.defer();

        esClient.index({
            index: id.toString(),
            type: 'traces',
            body: indexObject
        }, function (error, created) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    };

    kibana.updateActivityPermissions = function (indexName, kibanaResources, config) {
        var deferred = Q.defer();

        getParticipants(indexName)
            .then(function (participants) {
                kibana.auth(config, function (error, token) {
                    if (error) {
                        return deferred.reject(error);
                    }
                    async.every(participants, function (user, cb) {
                        kibana.updateKibanaPermission(config, user, kibanaResources, cb);
                    }, function (err, result) {
                        rootAuthToken = null;
                        deferred.resolve(result);
                    });
                });
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
        var updateKP = function () {
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
            kibana.auth(config, function () {
                updateKP();
            });
        } else {
            updateKP();
        }
    };

    kibana.auth = function (config, callback) {
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
                    console.log('Error logging in AUTH');
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

    kibana.buildKibanaResources = function (indexNames, config, esClient) {
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
                indexNames.forEach(function (indexName) {
                    resources.push(indexName);
                });

                console.log('kibana.buildKibanaResources -> SUCCESS!');
                deferred.resolve(resources);
            } else {
                console.log('kibana.buildKibanaResources -> ERROR!');
                deferred.reject(new Error('No Kibana version found!'));
            }
        });

        return deferred.promise;
    };

    kibana.regenerateIndexPattern = function (id, config) {
        var deferred = Q.defer();
        console.log('kibana.regenerateIndexPattern() -> Start');
        request({
            uri: config.kibana.host + 'api/saved_objects/index-pattern/' + id,
            method: 'POST',
            body: {
                attributes: {
                    title: id,
                    timeFieldName: 'out.timestamp',
                    notExpandable: true
                }
            },
            json: true,
            headers: {
                'kbn-version': config.kibana.version
            }
        },
        function (err, httpResponse, body) {
            if (err) {
                console.log('kibana.regenerateIndexPattern() -> ERROR!');
                return deferred.reject({message: 'Error recreating index pattern', error: err});
            }

            console.log('kibana.regenerateIndexPattern() -> SUCCESS!');
            deferred.resolve();
        });

        return deferred.promise;
    };

    return kibana;
})();