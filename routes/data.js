'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils'),
    Q = require('q');


router.get('/overall/:studentid', function (req, res) {
    
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
            correct: 6,
            incorrect: 2
        },
        progress: 0.8
    };

    res.send(analysis_result);
});

router.get('/overall2/:studentid', function (req, res) {

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

        var data = [];

        if (response.hits && response.hits.hits.length) {
            response.hits.hits.forEach(function (document) {
                if (document._source) {
                    document._source._id = document._id;
                    data.push(document._source);
                }
            });
        }

        deferred.resolve(data);
    });

    restUtils.processResponse(deferred.promise, res);


    //res.send(analysis_result);
});


module.exports = router;