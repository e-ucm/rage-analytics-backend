'use strict';

var openLRSConsumer = function (lrs) {
    var Q = require('q');
    var request = require('request');
    var options = {
        uri: lrs.uri + 'statements',
        method: 'POST',
        json: true,
        headers: {
            'Authorization': 'Basic ' + new Buffer(lrs.username + ':' + lrs.password)
                .toString("base64"),
            'X-Experience-API-Version': '1.0.1'
        }
    };
    return {
        addTraces: function (playerId, versionId, gameplayId, data) {
            options.body = data;
            var deferred = Q.defer();
            request(options, function (err, res, body) {
                if(err){
                    deferred.reject(err);
                } else if(res.statusCode !== 200) {
                    deferred.reject(body);
                } else {
                    deferred.resolve(body);
                }
            });
            return deferred.promise;
        }
    };
};

module.exports = openLRSConsumer;
