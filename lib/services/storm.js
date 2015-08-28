'use strict';

var Q = require('q');
var shell = require('shelljs');

var storm = function (stormConfig) {

    return {
        startTopology: function (sessionId) {
            var deferred = Q.defer();
            shell.exec(stormConfig.path + "/storm jar " + stormConfig.realtimeJar + " es.eucm.gleaner.realtime.RealTime " + sessionId.toString(),
                {async: true},
                function (code, output) {
                    deferred.resolve();
                });
            return deferred.promise;
        },
        endTopology: function (sessionId) {
            var deferred = Q.defer();
            shell.exec(stormConfig.path + "/storm kill " + sessionId.toString(),
                {async: true},
                function (code, output) {
                    deferred.resolve();
                });
            return deferred.promise;
        }
    };
};

module.exports = storm;
