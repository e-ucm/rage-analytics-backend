'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');


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


module.exports = router;