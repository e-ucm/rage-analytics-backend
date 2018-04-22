'use strict';

var express = require('express'),
    moment = require('moment'),
    router = express.Router(),
    restUtils = require('./rest-utils'),
    classes = require('../lib/classes'),
    request = require('request'),
    Q = require('q');

router.get('/overall/:studentid', function (req, res) {

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

router.get('/overall_full/:studentid', function (req, res) {
    var studentId = req.params.studentid;

    if (!studentId) {
        res.status(400);
        return res.json({message: 'Invalid studentId'});
    }

    var deferred = Q.defer();

    req.app.esClient.search({
        size: 200,
        from: 0,
        index: 'results-beaconing-overall',
        q: '_id:' + studentId.toString()
    }, function (error, response) {
        if (error) {
            if (response.error && response.error.type === 'index_not_found_exception') {
                return deferred.resolve([]);
            }
            return deferred.reject(new Error(error));
        }

        var analysisresult =
        {
            sudent: req.params.studentid,
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
                correct: 0,
                incorrect: 0
            },
            progress: 0.8
        };

        if (response.hits && response.hits.hits.length) {
            response.hits.hits.forEach(function (document) {
                if (document._source) {
                    document._source._id = document._id;
                    if (document._source.selected) {
                        if (document._source.selected.true) {
                            analysisresult.alternatives.correct += document._source.selected.true;
                        }
                        if (document._source.selected.false) {
                            analysisresult.alternatives.incorrect += document._source.selected.false;
                        }
                    }
                }
            });
        }

        deferred.resolve(analysisresult);
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

    var deferred = getScores(activityId, esClient)
        .then(function() {
            return getAccuracy(activityId, esClient)
            .then(function() {
                return getTimes(activityId, esClient)
                .then(function() {
                    return getAnalytics(activityId, studentId, esClient)
                    .then(function() {
                        return getCompetencies(activityId, studentId, esClient)
                        .then(function() {
                            deferred.resolve(glpBase);
                        });
                    });
                });
            });
        });

    restUtils.processResponse(deferred.promise, res);
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
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

var students = {};

var minigames = {};

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
        query: query
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

var glpBase = {
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

var extractValues = function(b, metric) {
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
};

var getScores = function(activityId, esClient) {
    var deferred = Q.defer();
    console.log('Score');
    dorequest(elasticIndex(activityId), scoreRequest, esClient)
        .then(function(b) {
            extractValues(b,'score');
            deferred.resolve();
        })
        .fail(function(error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

var getAccuracy = function(activityId, esClient) {
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

var getTimes = function(activityId, esClient) {
    var deferred = Q.defer();

    console.log('Times');
    dorequest(elasticIndex(activityId), timeRequest, esClient)
        .then(function(b) {
            extractValues(b,'time');
            deferred.resolve();
        })
        .fail(function(error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

var getAnalytics = function(activityId, username, esClient) {
    var deferred = Q.defer();

    console.log('Analytics');
    dorequest(analyticsIndex(activityId), {}, esClient)
        .then(function(b) {
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

                if (!currentNode.children) {
                    glpBase.minigames.push({
                        name: currentNode.name,
                        score: {
                            own: valueOrZero(students[username][activityId].score),
                            avg: valueOrZero(minigames[activityId].score.value)
                        },
                        time: {
                            own: valueOrZero(students[username][activityId].time),
                            avg: valueOrZero(minigames[activityId].time.value)
                        },
                        accuracy: {
                            own: valueOrZero(students[username][activityId].accuracy.value),
                            avg: valueOrZero(minigames[activityId].accuracy.value)
                        }
                    });

                    total.count++;

                    total.own.score += valueOrZero(students[username][activityId].score);
                    total.own.time += valueOrZero(students[username][activityId].time);
                    total.own.accuracy += valueOrZero(students[username][activityId].accuracy.value);
                    total.avg.score += valueOrZero(minigames[activityId].score.value);
                    total.avg.time += valueOrZero(minigames[activityId].time.value);
                    total.avg.accuracy += valueOrZero(minigames[activityId].accuracy.value);
                }
            }

            glpBase.performance.score.own = total.own.score / total.count;
            glpBase.performance.time.own = total.own.time / total.count;
            glpBase.performance.accuracy.own = total.own.accuracy / total.count;
            glpBase.performance.score.avg = total.avg.score / total.count;
            glpBase.performance.time.avg = total.avg.time / total.count;
            glpBase.performance.accuracy.avg = total.avg.accuracy / total.count;

            deferred.resolve();
        })
        .fail(function(error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

var getCompetencies = function(activityId, username, esClient) {
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