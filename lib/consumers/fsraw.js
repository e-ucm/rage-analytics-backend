'use strict';

/**
 * Writes data to disk. (Backup log purpose)
 * @param rawTracesFolder
 * @returns {{addTraces: addTraces}}
 */
var fsrawConsumer = function (rawTracesFolder) {
    var Q = require('q');
    var fs = require('fs');

    return {
        addTraces: function (playerId, versionId, gameplayId, activity, data, convertedData) {
            var deferred = Q.defer();

            var file = rawTracesFolder + '/' + playerId;
            var result = JSON.stringify({
                received: new Date().toISOString(),
                statements: data,
                converted: convertedData
            }) + '\n';
            fs.appendFile(file, result, (err) => {
                if (err) {
                    console.error(err);
                    return deferred.reject(err);
                }
                console.log('Appended', result.length, 'chars from', data.length, 'statements to', file);
                deferred.resolve();
            });

            return deferred.promise;
        }
    };
};

module.exports = fsrawConsumer;