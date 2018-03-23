'use strict';

var express = require('express'),
    moment = require('moment'),
    router = express.Router(),
    restUtils = require('./rest-utils'),
    classes = require('../lib/classes'),
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

    var deferred = Q.defer();

    req.app.esClient.search({
        size: 200,
        from: 0,
        index: 'beaconing-overall'
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

router.get('/performance_full/:groupid', function (req, res) {
    var periodStart = req.query.periodStart;
    var scale = req.query.scale;
    var groupid = req.params.groupid;

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

            return obtainPerformance(classReq, scale, fdate.year(), scale === 'week' ? fdate.week() : fdate.month(), req)
                .then(function(students) {
                    return students;
                });
        }), res);
});

router.get('/performance/:classId', function (req, res) {

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


var obtainPerformance = function(classe, scale, year, position, req) {
    var deferred = Q.defer();

    req.app.esClient.search({
        size: 200,
        from: 0,
        index: 'beaconing-performance',
        query: {
            term: { _id: classe._id.toString() }
        }
    }, function (error, response) {
        if (error) {
            if (response.error && response.error.type === 'index_not_found_exception') {
                return deferred.resolve([]);
            }
            return deferred.reject(new Error(error));
        }

        var students = [];
        if (response.hits && response.hits.hits.length) {
            if (scale === 'year') {
                students = response.hits.hits[0]._source[year].students;
            }else if (scale === 'month') {
                students = response.hits.hits[0]._source[year].months[position].students;
            }else if (scale === 'week') {
                students = response.hits.hits[0]._source[year].weeks[position].students;
            }
        }

        deferred.resolve(students);
    });

    return deferred.promise;
};


module.exports = router;