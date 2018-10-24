'use strict';

var express = require('express'),
    moment = require('moment'),
    router = express.Router(),
    restUtils = require('./rest-utils'),
    classes = require('../lib/classes'),
    request = require('request'),
    Q = require('q');

router.get('/overall_dummy/:studentid', function (req, res) {

    var analysisresult =
    {
        student: req.params.studentid,
        scores: {
            min: 0.2,
            avg: 0.7,
            max: 0.95
        },
        durations: {
            yours: 0.5,
            others: 0.7
        },
        alternatives: {
            correct: 6,
            incorrect: 2
        },
        progress: 0.8
    };

    res.send(analysisresult);
});

router.get('/overall/:studentid', function (req, res) {
    var studentId = req.params.studentid;
    var deferred = Q.defer();

    if (!studentId) {
        res.status(400);
        return res.json({message: 'Invalid studentId'});
    }

    var analysisresult =
    {
        sudent: req.params.studentid,
        scores: {
            min: 0,
            avg: 0,
            max: 0
        },
        durations: {
            yours: 0,
            others: 0
        },
        alternatives: {
            correct: 0,
            incorrect: 0
        },
        progress: 0
    };

    var queries = 3;
    var done = 0;
    var Completed = function() {
        done++;

        if (done >= queries) {
            deferred.resolve(analysisresult);
        }
    };


    getUser(studentId, req)
        .then(function(user) {
            req.app.esClient.search({
                size: 200,
                from: 0,
                index: 'beaconing-overall',
                q: '_id:' + user.username
            }, function (error, response) {
                if (error) {
                    if (response.error && response.error.type === 'index_not_found_exception') {
                        return deferred.resolve([]);
                    }
                    return deferred.reject(new Error(error));
                }

                if (response.hits && response.hits.hits.length) {
                    response.hits.hits.forEach(function (document) {
                        if (document._source) {
                            if (document._source.min) {
                                analysisresult.scores.min = document._source.min;
                            }
                            if (document._source.avg) {
                                analysisresult.scores.avg = document._source.avg;
                            }
                            if (document._source.max) {
                                analysisresult.scores.max = document._source.max;
                            }

                            if (document._source.correct) {
                                analysisresult.alternatives.correct = document._source.correct;
                            }
                            if (document._source.incorrect) {
                                analysisresult.alternatives.incorrect = document._source.incorrect;
                            }
                            if (document._source.answers) {
                                analysisresult.alternatives.answers = document._source.answers;
                            }
                        }
                    });
                }

                Completed();
            });

            req.app.esClient.search({
                size: 200,
                from: 0,
                index: 'beaconing-overall-completable',
                q: '_id:' + user.username
            }, function (error, response) {
                if (error) {
                    if (response.error && response.error.type === 'index_not_found_exception') {
                        return deferred.resolve([]);
                    }
                    return deferred.reject(new Error(error));
                }

                if (response.hits && response.hits.hits.length) {
                    response.hits.hits.forEach(function (document) {
                        if (document._source) {
                            if (document._source.mine) {
                                analysisresult.durations.yours = document._source.mine;
                            }
                            if (document._source.avg) {
                                analysisresult.durations.others = document._source.avg;
                            }
                        }
                    });
                }

                Completed();
            });

            req.app.esClient.search({
                size: 200,
                from: 0,
                index: 'beaconing-overall-progress',
                q: '_id:' + user.username
            }, function (error, response) {
                if (error) {
                    if (response.error && response.error.type === 'index_not_found_exception') {
                        return deferred.resolve([]);
                    }
                    return deferred.reject(new Error(error));
                }

                if (response.hits && response.hits.hits.length) {
                    response.hits.hits.forEach(function (document) {
                        if (document._source) {
                            if (document._source.myProgress) {
                                analysisresult.progress = document._source.myProgress;
                            }
                        }
                    });
                }

                Completed();
            });
        })
        .fail(function(error) {
            deferred.reject('User not found');
        });

    restUtils.processResponse(deferred.promise, res);
});

router.get('/performance/:groupid', function (req, res) {
    var periodStart = req.query.periodStart;
    var scale = req.query.scale;
    var groupid = req.params.groupid;

    if (!groupid) {
        res.status(400);
        return res.json({message: 'Invalid groupid'});
    }

    if (!scale) {
        res.status(400);
        return res.json({message: 'Invalid time scale'});
    }
    if (scale !== 'year' && scale !== 'month' && scale !== 'week') {
        res.status(400);
        return res.json({message: 'Time scale should be: year, month or week.'});
    }

    var fdate;
    if (!periodStart) {
        fdate = moment();
    } else {
        fdate = moment(periodStart);
        if (!fdate.isValid()) {
            res.status(400);
            return res.json({message: 'Invalid date format, should be ISO 8601'});
        }
    }

    var analysisresult = {
        classId: groupid,
        students: [],
        improvement: [],
        year: fdate.year()
    };

    if (scale === 'week') {
        analysisresult.week = fdate.week();
    }else if (scale === 'month') {
        analysisresult.month = fdate.month();
    }

    var username = req.headers['x-gleaner-user'];
    restUtils.processResponse(classes.isAuthorizedForExternal('beaconing', groupid, username, 'get', '/classes/external/:domain/:externalId')
        .then(function (classReq) {
            var fdate;
            if (!periodStart) {
                fdate = moment();
            } else {
                fdate = moment(periodStart);
                if (!fdate.isValid()) {
                    res.status(400);
                    return res.json({message: 'Invalid date format, should be ISO 8601'});
                }
            }

            return obtainPerformance(classReq, scale, fdate, req)
                .then(function(performance) {
                    return obtainUsers(classReq, req)
                        .then(function(allStudents) {
                            for (var i = allStudents.length - 1; i >= 0; i--) {
                                var exid = getExternalId(allStudents[i]);
                                var student = { id: exid, username: allStudents[i].username, score: 0 };
                                var improvement = { id: exid, username: allStudents[i].username, score: 0 };

                                for (var j = performance.students.length - 1; j >= 0; j--) {
                                    if (allStudents[i].username === performance.students[j].student) {
                                        student.score = performance.students[j].score;

                                        for (var k = performance.previous.length - 1; k >= 0; k--) {
                                            if (performance.previous[k].student === performance.students[j].student) {
                                                var imp = student.score - performance.previous[k].score;
                                                improvement.score = imp > 0 ? imp : 0;
                                                performance.previous.splice(k, 1);
                                            }
                                        }

                                        performance.students.splice(j, 1);
                                        break;
                                    }
                                }

                                analysisresult.students.push(student);
                                analysisresult.improvement.push(improvement);
                            }

                            analysisresult.students.sort(function(x, y) {
                                return y.score - x.score;
                            });

                            analysisresult.improvement.sort(function(x, y) {
                                return y.score - x.score;
                            });

                            return analysisresult;
                        })
                        .fail(function(error) {
                            res.status(404);
                            return res.json({
                                classId: -1,
                                students: [],
                                improvement: [],
                                year: 0
                            });
                        });
                });
        }), res);
});

var getExternalId = function(user) {
    for (var i = user.externalId.length - 1; i >= 0; i--) {
        if (user.externalId[i].domain === 'beaconing') {
            return user.externalId[i].id;
        }
    }
    return -1;
};

router.get('/performance_dummy/:classId', function (req, res) {

    var periodStart = req.query.periodStart;
    var scale = req.query.scale;
    var classId = req.params.classId;

    if (!classId) {
        res.status(400);
        return res.json({message: 'Invalid classId'});
    }

    if (!scale) {
        res.status(400);
        return res.json({message: 'Invalid time scale'});
    }
    if (scale !== 'year' && scale !== 'month' && scale !== 'week') {
        res.status(400);
        return res.json({message: 'Time scale should be: year, month or week.'});
    }

    var fdate;
    if (!periodStart) {
        fdate = moment();
    } else {
        fdate = moment(periodStart);
        if (!fdate.isValid()) {
            res.status(400);
            return res.json({message: 'Invalid date format, should be ISO 8601'});
        }
    }

    var analysisresult = {
        classId: classId,
        students: [
            {student: { id: 50, username: 'river' }, score: 0.9},
            {student: { id: 22, username: 'jocelynn' }, score: 0.8},
            {student: { id: 13, username: 'roman' }, score: 0.74},
            {student: { id: 98, username: 'gerardo' }, score: 0.7},
            {student: { id: 47, username: 'paxton' }, score: 0.67},
            {student: { id: 14, username: 'ishaan' }, score: 0.66},
            {student: { id: 67, username: 'landen' }, score: 0.63},
            {student: { id: 79, username: 'finley' }, score: 0.5},
            {student: { id: 50, username: 'gracie' }, score: 0.43},
            {student: { id: 7, username: 'arjun' }, score: 0.33},
            {student: { id: 72, username: 'eli' }, score: 0.28},
            {student: { id: 38, username: 'randy' }, score: 0.2}
        ],
        improvement: [
            {student: { id: 72, username: 'eli' }, score: 0.9},
            {student: { id: 14, username: 'ishaan' }, score: 0.8},
            {student: { id: 7, username: 'arjun' }, score: 0.8},
            {student: { id: 47, username: 'paxton' }, score: 0.6},
            {student: { id: 67, username: 'landen' }, score: 0.4},
            {student: { id: 50, username: 'gracie' }, score: 0.3},
            {student: { id: 98, username: 'gerardo' }, score: 0.2},
            {student: { id: 79, username: 'finley' }, score: 0.2},
            {student: { id: 38, username: 'randy' }, score: 0.2},
            {student: { id: 50, username: 'river' }, score: 0.1},
            {student: { id: 22, username: 'jocelynn' }, score: 0},
            {student: { id: 13, username: 'roman' }, score: 0}
        ],
        year: fdate.year()
    };

    if (scale === 'week') {
        analysisresult.week = fdate.week() + 1;
    }else if (scale === 'month') {
        analysisresult.month = fdate.month() + 1;
    }

    res.send(analysisresult);
});


var obtainPerformance = function(classe, scale, date, req) {
    var deferred = Q.defer();
    var year = date.year();
    var syear = date.year().toString();

    req.app.esClient.search({
        size: 200,
        from: 0,
        index: 'beaconing-performance',
        q: '_id:' + classe._id.toString()
    }, function (error, response) {
        if (error) {
            if (response.error && response.error.type === 'index_not_found_exception') {
                return deferred.resolve([]);
            }
            return deferred.reject(new Error(error));
        }

        var students = [], previous = [];
        if (response.hits && response.hits.hits.length) {
            if (response.hits.hits[0]._source[syear]) {
                if (scale === 'year') {
                    students = response.hits.hits[0]._source[syear].students;
                }else if (scale === 'month') {
                    var month = date.month();

                    // Obtain previous month
                    if (month - 1 >= 0 && response.hits.hits[0]._source[syear].months[(month - 1).toString()]) {
                        previous = response.hits.hits[0]._source[syear].months[(month - 1).toString()].students;
                    }else if (month - 1 < 0 && response.hits.hits[0]._source[(year - 1).toString()].months['11']) {
                        previous = response.hits.hits[0]._source[(year - 1).toString()].months['11'].students;
                    }

                    // Obtain current month
                    if (response.hits.hits[0]._source[syear].months[month.toString()]) {
                        students = response.hits.hits[0]._source[syear].months[month.toString()].students;
                    }

                }else if (scale === 'week') {
                    var week = date.week();

                    // Obtain previous week
                    if (week - 1 >= 0 && response.hits.hits[0]._source[syear].weeks[(week - 1).toString()]) {
                        previous = response.hits.hits[0]._source[syear].weeks[(week - 1).toString()].students;
                    }else if (week - 1 < 0 && response.hits.hits[0]._source[(year - 1).toString()].weeks['51']) {
                        previous = response.hits.hits[0]._source[(year - 1).toString()].weeks['51'].students;
                    }

                    // Obtain current month
                    if (response.hits.hits[0]._source[syear].weeks[week.toString()]) {
                        students = response.hits.hits[0]._source[syear].weeks[week.toString()].students;
                    }
                }
            }
        }

        deferred.resolve({students: students, previous: previous});
    });

    return deferred.promise;
};

var obtainUsers = function(classe, req) {
    var deferred = Q.defer();
    console.log('obtainUsers: starte');

    var query = [];
    for (var i = 0; i < classe.participants.students.length; i++) {
        console.log(classe.participants.students[i]);
        query.push({ username: classe.participants.students[i] });
    }
    query = {$or: query};

    console.log(JSON.stringify(query));

    authenticate(req.app.config)
        .then(function(token) {
            request({
                uri: req.app.config.a2.a2ApiPath + 'users?query=' + encodeURI(JSON.stringify(query)),
                method: 'GET',
                json: true,
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }, function (err, httpResponse, body) {
                if (err || (httpResponse && httpResponse.statusCode !== 200)) {
                    console.log('obtainUsers: error');
                    return deferred.reject();
                }

                console.log('obtainUsers: success');
                deferred.resolve(body.data);
            });
        });

    return deferred.promise;
};

var getUser = function(beaconingId, req) {
    var deferred = Q.defer();
    console.log('getUser: started');

    authenticate(req.app.config)
        .then(function(token) {
            request({
                uri: req.app.config.a2.a2ApiPath + 'users/external/beaconing/' + beaconingId,
                method: 'GET',
                json: true,
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }, function (err, httpResponse, body) {
                if (err || (httpResponse && httpResponse.statusCode !== 200)) {
                    console.log('getUser: error');
                    return deferred.reject('User not found');
                }

                console.log('getUser: success');

                deferred.resolve(body);
            });
        });

    return deferred.promise;
};

var authenticate = function(config) {
    var deferred = Q.defer();
    console.log('authenticate: start');

    request({
        uri: config.a2.a2ApiPath + 'login',
        method: 'POST',
        body: { username: config.a2.a2AdminUsername, password: config.a2.a2AdminPassword },
        json: true
    }, function (err, httpResponse, body) {
        if (err || (httpResponse && httpResponse.statusCode !== 200)) {
            console.log('authenticate: error');
            return deferred.reject(body);
        }

        console.log('authenticate: success');
        deferred.resolve(body.user.token);
    });

    return deferred.promise;
};

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

router.get('/glp_results/:activityId/:studentId', function (req, res) {
    var studentId = req.params.studentId;
    var activityId = req.params.activityId;

    if (!studentId) {
        res.status(400);
        return res.json({message: 'Invalid studentId'});
    }

    if (!activityId) {
        res.status(400);
        return res.json({message: 'Invalid activityId'});
    }

    var esClient = req.app.esClient;

    var deferred = Q.defer();

    try {
        getUser(studentId, req)
            .then(function(user) {
                getGLPResults(user.username, activityId, esClient, res)
                    .then(function(results) {
                        deferred.resolve(results);
                    })
                    .fail(function(error) {
                        res.status(404);
                        return res.json({message: 'error obtaining GLP results', error: error});
                    });
            })
            .fail(function(error) {
                res.status(404);
                return res.json({message: 'User not found'});
            });
    }catch (error) {
        res.status(404);
        return res.json({message: 'Unable to find data for that ActivityId'});
    }

    restUtils.processResponse(deferred.promise, res);
});

router.get('/glp_results/:activityId', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    var activityId = req.params.activityId;

    if (!activityId) {
        res.status(400);
        return res.json({message: 'Invalid activityId'});
    }

    if (!username) {
        res.status(400);
        return res.json({message: 'Username not found'});
    }

    var esClient = req.app.esClient;

    var deferred = Q.defer();

    try {
        getGLPResults(username, activityId, esClient, res).then(function(results) {
            deferred.resolve(results);
        })
        .fail(function(error) {
            res.status(404);
            return res.json({message: 'error obtaining GLP results', error: error});
        });
    }catch (error) {
        res.status(404);
        return res.json({message: 'Unable to find data for that ActivityId'});
    }

    restUtils.processResponse(deferred.promise, res);
});

var getGLPResults = function(username, activityId, esClient, res) {
    var deferred = Q.defer();

    var glpBase = clone(originalGlpBase);
    var students = {};
    var minigames = {};

    getScores(activityId, glpBase, students, minigames, esClient)
        .then(function() {
            getAccuracy(activityId, glpBase, students, minigames, esClient)
            .then(function() {
                getTimes(activityId, glpBase, students, minigames, esClient)
                .then(function() {
                    getAnalytics(activityId, username, glpBase, students, minigames, esClient)
                    .then(function() {
                        getCompetencies(activityId, username, glpBase, students, minigames, esClient)
                        .then(function() {
                            deferred.resolve(glpBase);
                        })
                        .fail(function(error) {
                            deferred.reject({message: 'Unable to obtain competencies for that ActivityId', error: error});
                        });
                    })
                    .fail(function(error) {
                        deferred.reject({message: 'Unable to obtain analytics for that ActivityId', error: error});
                    });
                })
                .fail(function(error) {
                    deferred.reject({message: 'Unable to obtain times for that ActivityId', error: error});
                });
            })
            .fail(function(error) {
                deferred.reject({message: 'Unable to obtain accuracy for that ActivityId', error: error});
            });

        })
        .fail(function(error) {
            deferred.reject({message: 'Unable to obtain scores for that ActivityId', error: error});
        });

    return deferred.promise;
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var clone = function(a) {
    return JSON.parse(JSON.stringify(a));
};

var elasticIndex = function(id) {
    return id;
};

var analyticsIndex = function(id) {
    return 'analytics-' + id;
};

var competencieIndex = function(id, student) {
    return 'results-' + id;
};

var doAVG = function(avg, value, n) {
    return ((avg * n) / (n + 1.0)) + (value / (n + 1.0));
};

var valueOrZero = function(value) {
    return value ? value : 0;
};

var dorequest = function(index, query, esClient) {
    var deferred = Q.defer();

    esClient.search({
        size: 1000,
        from: 0,
        index: index,
        body: query
    }, function (error, response) {
        if (error) {
            if (response.error && response.error.type === 'index_not_found_exception') {
                return deferred.resolve([]);
            }
            return deferred.reject(new Error(error));
        }

        deferred.resolve(response);
    });

    return deferred.promise;
};

// ####################################################
// ################### glpBase OBJECTS ################
// ####################################################

var originalGlpBase = {
    competencies: {
        /*"communication-and-collaboration": 0.1,
        "problem-solving": 0.3,
        "information-fluency": 0.7*/
    },
    performance: {
        score: {
            own: 0.7, min: 0.2, avg: 0.6, max: 0.4
        },
        time: {
            own: 3403, min: 2340, avg: 3045, max: 4340
        },
        accuracy: {
            own: 0.5, min: 0.2, avg: 0.6, max: 0.9
        }
    },
    minigames: []
};

// ################################################
// ################### REQUESTS ###################
// ################################################

var scoreRequest = {
    query: {
        bool: {
            must: [
              {
                query_string: {
                    analyze_wildcard: true,
                    query: 'out.event:completed'
                }
            }
            ],
            must_not: []
        }
    },
    size: 0,
    _source: {
        excludes: []
    },
    aggs: {
        2: {
            terms: {
                field: 'out.name.keyword',
                size: 1000,
                order: {
                    _term: 'asc'
                }
            },
            aggs: {
                3: {
                    terms: {
                        field: 'orginalId.keyword',
                        size: 1000,
                        order: {
                            1: 'desc'
                        }
                    },
                    aggs: {
                        1: {
                            max: {
                                field: 'out.score'
                            }
                        }
                    }
                }
            }
        }
    }
};

var timeRequest = {
    query: {
        bool: {
            must: [
              {
                query_string: {
                    analyze_wildcard: true,
                    query: 'out.event:completed'
                }
            }
            ],
            must_not: []
        }
    },
    size: 0,
    _source: {
        excludes: []
    },
    aggs: {
        2: {
            terms: {
                field: 'out.name.keyword',
                size: 1000,
                order: {
                    _term: 'asc'
                }
            },
            aggs: {
                3: {
                    terms: {
                        field: 'orginalId.keyword',
                        size: 1000,
                        order: {
                            1: 'desc'
                        }
                    },
                    aggs: {
                        1: {
                            min: {
                                field: 'out.ext.time'
                            }
                        }
                    }
                }
            }
        }
    }
};

var accuracyRequest = {
    query: {
        bool: {
            must: [
              {
                query_string: {
                    query: 'out.event:completed',
                    analyze_wildcard: true
                }
            }
            ],
            must_not: []
        }
    },
    size: 0,
    _source: {
        excludes: []
    },
    aggs: {
        4: {
            terms: {
                field: 'out.success',
                size: 5,
                order: {
                    _count: 'desc'
                }
            },
            aggs: {
                5: {
                    terms: {
                        field: 'out.name.keyword',
                        size: 1000,
                        order: {
                            _term: 'asc'
                        }
                    },
                    aggs: {
                        6: {
                            terms: {
                                field: 'orginalId.keyword',
                                size: 1000,
                                order: {
                                    _count: 'desc'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

var competencieRequest = function(student) {
    return {
        query: {
            bool: {
                must: [
                  {
                    match: {
                        _id: student
                    }
                }
                ]
            }
        }
    };
};

// ################################################

var extractValues = function(b, metric, glpBase, students, minigames) {
    for (var i = 0; i < b.aggregations['2'].buckets.length; i++) {
        var currentStudent = b.aggregations['2'].buckets[i];

        for (var j = 0; j < currentStudent['3'].buckets.length; j++) {
            var currentMinigame = currentStudent['3'].buckets[j];

            // Generate student object
            if (!students[currentStudent.key]) {
                students[currentStudent.key] = {};
            }

            if (!students[currentStudent.key][currentMinigame.key]) {
                students[currentStudent.key][currentMinigame.key] = {};
            }

            students[currentStudent.key][currentMinigame.key][metric] = currentMinigame['1'].value;

            // Generate minigame object

            if (!minigames[currentMinigame.key]) {
                minigames[currentMinigame.key] = {};
                minigames[currentMinigame.key][metric] = {value: currentMinigame['1'].value, nValue: 1};
            } else if (!minigames[currentMinigame.key][metric]) {
                minigames[currentMinigame.key][metric] = {value: currentMinigame['1'].value, nValue: 1};
            }else {
                var mg = minigames[currentMinigame.key][metric];

                var n = mg.nValue + 1;
                mg.value = doAVG(mg.value, currentMinigame['1'].value, mg.nValue);
                mg.nValue = n;

                minigames[currentMinigame.key][metric] = mg;
            }

            glpBase.performance[metric].min = Math.min(currentMinigame['1'].value, glpBase.performance[metric].min);
            glpBase.performance[metric].max = Math.max(currentMinigame['1'].value, glpBase.performance[metric].max);
            glpBase.performance[metric].avg = -1;
        }
    }

    console.log(JSON.stringify(minigames, null, 2));
};

var getScores = function(activityId, glpBase, students, minigames, esClient) {
    var deferred = Q.defer();

    console.log('Score');
    dorequest(elasticIndex(activityId), scoreRequest, esClient)
        .then(function(b) {
            extractValues(b, 'score', glpBase, students, minigames);
            deferred.resolve();
        })
        .fail(function(error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

var getAccuracy = function(activityId, glpBase, students, minigames, esClient) {
    var deferred = Q.defer();

    console.log('accuracy');
    dorequest(elasticIndex(activityId), accuracyRequest, esClient)
        .then(function(b) {
            for (var i = 0; i < b.aggregations['4'].buckets.length; i++) {
                var won = b.aggregations['4'].buckets[i].key;

                var currentCase = b.aggregations['4'].buckets[i];

                for (var j = 0; j < currentCase['5'].buckets.length; j++) {
                    var currentStudent = currentCase['5'].buckets[j];

                    for (var k = 0; k < currentStudent['6'].buckets.length; k++) {
                        var currentMinigame = currentStudent['6'].buckets[k];

                        // Generate student object
                        if (!students[currentStudent.key]) {
                            students[currentStudent.key] = {};
                        }

                        if (!students[currentStudent.key][currentMinigame.key]) {
                            students[currentStudent.key][currentMinigame.key] = {};
                        }

                        if (!students[currentStudent.key][currentMinigame.key].accuracy) {
                            students[currentStudent.key][currentMinigame.key].accuracy = {correct: 0, incorrect: 0};
                        }

                        if (won) {
                            students[currentStudent.key][currentMinigame.key].accuracy.correct += currentMinigame.doc_count;
                        }else {
                            students[currentStudent.key][currentMinigame.key].accuracy.incorrect += currentMinigame.doc_count;
                        }

                        // Generate minigame object

                        if (!minigames[currentMinigame.key]) {
                            minigames[currentMinigame.key] = {};
                            minigames[currentMinigame.key].accuracy = {correct: 0, incorrect: 0};
                        } else if (!minigames[currentMinigame.key].accuracy) {
                            minigames[currentMinigame.key].accuracy = {correct: 0, incorrect: 0};
                        }

                        if (won) {
                            minigames[currentMinigame.key].accuracy.correct += currentMinigame.doc_count;
                        }else {
                            minigames[currentMinigame.key].accuracy.incorrect += currentMinigame.doc_count;
                        }

                    }
                }
            }

            for (var student in students) {
                for (var minigame in students[student]) {
                    if (students[student][minigame].accuracy) {
                        var studentAccuracy = students[student][minigame].accuracy;
                        studentAccuracy.value = studentAccuracy.correct / (studentAccuracy.correct + studentAccuracy.incorrect);

                        glpBase.performance.accuracy.min = Math.min(studentAccuracy.value, glpBase.performance.accuracy.min);
                        glpBase.performance.accuracy.max = Math.max(studentAccuracy.value, glpBase.performance.accuracy.max);
                        glpBase.performance.accuracy.avg = -1;

                        if (!minigames[minigame].accuracy.nValue) {
                            minigames[minigame].accuracy.value = 0;
                            minigames[minigame].accuracy.nValue = 0;
                        }

                        minigames[minigame].accuracy.value = doAVG(minigames[minigame].accuracy.value, studentAccuracy.value, minigames[minigame].accuracy.nValue);
                        minigames[minigame].accuracy.nValue++;
                    }
                }
            }

            deferred.resolve();
        })
        .fail(function(error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

var getTimes = function(activityId, glpBase, students, minigames, esClient) {
    var deferred = Q.defer();

    console.log('Times');
    dorequest(elasticIndex(activityId), timeRequest, esClient)
        .then(function(b) {
            extractValues(b, 'time', glpBase, students, minigames);
            deferred.resolve();
        })
        .fail(function(error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

var getAnalytics = function(activityId, username, glpBase, students, minigames, esClient) {
    var deferred = Q.defer();

    console.log('Analytics');
    dorequest(analyticsIndex(activityId), {}, esClient)
        .then(function(b) {
            try {
                var total = {
                    own: {
                        score: 0,
                        time: 0,
                        accuracy: 0
                    },
                    avg: {
                        score: 0,
                        time: 0,
                        accuracy: 0
                    },
                    count: 0
                };

                for (var i = 0; i < b.hits.hits.length; i++) {
                    var currentNode = b.hits.hits[i]._source;
                    var activityId = b.hits.hits[i]._id;

                    if (!currentNode.children || currentNode.children.length == 0) {
                        var tmp = {};

                        if (students[username]) {
                            tmp.score = students[username][activityId] ? valueOrZero(students[username][activityId].score) : 0;
                            tmp.time = students[username][activityId] ? valueOrZero(students[username][activityId].time) : 0;
                            tmp.accuracy = (students[username][activityId] ?
                                            (students[username][activityId].accuracy ?
                                            valueOrZero(students[username][activityId].accuracy.value) : 0) : 0);
                        }else {
                            tmp.score = 0;
                            tmp.time = 0;
                            tmp.accuracy = 0;
                        }
                        var toPush = {
                            name: currentNode.name,
                            score: {
                                own: tmp.score,
                                avg: 0
                            },
                            time: {
                                own: tmp.time,
                                avg: 0
                            },
                            accuracy: {
                                own: tmp.accuracy,
                                avg: 0
                            }
                        };

                        if (minigames[activityId]) {
                            if (minigames[activityId].score) {
                                toPush.score.avg = valueOrZero(minigames[activityId].score.value);
                            }
                            if (minigames[activityId].time) {
                                toPush.time.avg = valueOrZero(minigames[activityId].time.value);
                            }
                            if (minigames[activityId].accuracy) {
                                toPush.accuracy.avg = valueOrZero(minigames[activityId].accuracy.value);
                            }
                        }

                        glpBase.minigames.push(toPush);

                        total.count++;

                        total.own.score += tmp.score;
                        total.own.time += tmp.time;
                        total.own.accuracy += tmp.accuracy;
                        total.avg.score += toPush.score.avg;
                        total.avg.time += toPush.time.avg;
                        total.avg.accuracy += toPush.accuracy.avg;
                    }
                }

                glpBase.performance.score.own = total.own.score / total.count;
                glpBase.performance.time.own = total.own.time / total.count;
                glpBase.performance.accuracy.own = total.own.accuracy / total.count;
                glpBase.performance.score.avg = total.avg.score / total.count;
                glpBase.performance.time.avg = total.avg.time / total.count;
                glpBase.performance.accuracy.avg = total.avg.accuracy / total.count;

                deferred.resolve();
            }catch (error) {
                console.log('trycatcherror');
                console.log(JSON.stringify(error));
                deferred.reject(error);
            }
        })
        .fail(function(error) {
            console.log('failerror');
            console.log(JSON.stringify(error));
            deferred.reject(error);
        });

    return deferred.promise;
};

var getCompetencies = function(activityId, username, glpBase, students, minigames, esClient) {
    var deferred = Q.defer();

    console.log('Competencies');
    dorequest(competencieIndex(activityId), competencieRequest(username), esClient)
        .then(function(b) {
            for (var i = 0; i < b.hits.hits.length; i++) {
                var currentNode = b.hits.hits[i]._source;

                if (currentNode.competencies) {
                    for (var competencie in currentNode.competencies) {
                        if (!glpBase.competencies[competencie]) {
                            glpBase.competencies[competencie] = 0;
                        }

                        glpBase.competencies[competencie] += currentNode.competencies[competencie];
                    }
                }
            }

            deferred.resolve();
        })
        .fail(function(error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

// jscs:enable requireCamelCaseOrUpperCaseIdentifiers


module.exports = router;