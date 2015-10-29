'use strict';

var Q = require('q');
var shell = require('shelljs');

var storm = function (stormConfig, mongodbUrl) {

    return {
        startTopology: function (sessionId) {
            var deferred = Q.defer();
            shell.exec(stormConfig.path + '/storm jar ' + stormConfig.realtimeJar +
                ' es.eucm.gleaner.realtime.RealTime ' + sessionId.toString() + ' ' + mongodbUrl +
                ' -c nimbus.host=' + stormConfig.nimbusHost,
                {async: true},
                function (code, output) {
                    if (code !== 0) {
                        return deferred.reject(new Error('Failed to start topology, code: ' + code + ', output: ' + output));
                    }
                    deferred.resolve();
                });
            return deferred.promise;
        },
        endTopology: function (sessionId) {
            var deferred = Q.defer();
            shell.exec(stormConfig.path + '/storm kill ' + sessionId.toString(),
                {async: true},
                function (code, output) {
                    if (code !== 0) {
                        return deferred.reject(new Error('Failed to end topology, code: ' + code + ', output: ' + output));
                    }
                    deferred.resolve();
                });
            return deferred.promise;
        }
    };
};

module.exports = storm;
