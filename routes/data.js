'use strict';

var express = require('express'),
    moment = require('moment'),
    router = express.Router(),
    restUtils = require('./rest-utils'),
    Q = require('q');

router.get('/overall/:studentid', function (req, res) {
    
    var analysis_result = 
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
        alternatives:{
            correct: 6,
            incorrect: 2
        },
        progress: 0.8
    };

    res.send(analysis_result);
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

        var analysis_result = 
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
            alternatives:{
                correct: 0,
                incorrect: 0
            },
            progress: 0.8
        };

        if (response.hits && response.hits.hits.length) {
            response.hits.hits.forEach(function (document) {
                if (document._source) {
                    document._source._id = document._id;
                    if(document._source.selected){
                        if(document._source.selected.true)
                            analysis_result.alternatives.correct += document._source.selected.true;
                        if(document._source.selected.false)
                            analysis_result.alternatives.incorrect += document._source.selected.false;
                    }
                }
            });
        }

        deferred.resolve(analysis_result);
    });

    restUtils.processResponse(deferred.promise, res);


    //res.send(analysis_result);
});

router.get('/performance/:classId/:time_scale/:date', function (req, res) {

    var date = req.params.date;
    var time_scale = req.params.time_scale
    var classId = req.params.classId;

    if(!classId){
        res.status(400);
        return res.json({message: 'Invalid classId'});
    }

    if(!time_scale){
        res.status(400);
        return res.json({message: 'Invalid time scale'});
    }else if(time_scale !== 'year' && time_scale !== 'month' && time_scale !== 'week'){
        res.status(400);
        return res.json({message: 'Time scale should be: year, month or week.'});
    }

    var fdate;
    if(!date){
        res.status(400);
        return res.json({message: 'Invalid date'});
    }else{
        fdate = moment(date);
        if(!date.isValid()){
            res.status(400);
            return res.json({message: 'Invalid date format, should be ISO 8601'});
        }
    }

    var analysis_result = {
        classId: classId,
        students: [
            {student: 'River', score: 0.9},
            {student: 'Jocelynn', score: 0.8},
            {student: 'Roman', score: 0.74},
            {student: 'Gerardo', score: 0.7},
            {student: 'Paxton', score: 0.67},
            {student: 'Ishaan', score: 0.66},
            {student: 'Landen', score: 0.63},
            {student: 'Finley', score: 0.5},
            {student: 'Gracie', score: 0.43},
            {student: 'Arjun', score: 0.33},
            {student: 'Eli', score: 0.28},
            {student: 'Randy', score: 0.2},
        ],
        improvement: [
            {student: 'River', score: 0.1},
            {student: 'Jocelynn', score: 0},
            {student: 'Roman', score: 0},
            {student: 'Gerardo', score: 0.2},
            {student: 'Paxton', score: 0.6},
            {student: 'Ishaan', score: 0.8},
            {student: 'Landen', score: 0.4},
            {student: 'Finley', score: 0.2},
            {student: 'Gracie', score: 0.3},
            {student: 'Arjun', score: 0.8},
            {student: 'Eli', score: 0.9},
            {student: 'Randy', score: 0.2},
        ],
        year: date.year()
    };

    if(time_scale === 'week'){
        analysis_result.week = date.week();
    }else if(time_scale === 'month'){
        analysis_result.month = date.month();
    }

    res.send(analysis_result);
});


module.exports = router;