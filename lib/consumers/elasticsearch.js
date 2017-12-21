'use strict';

var kafkaConsumer = function (esClient) {
    var Q = require('q');

    return {
        addTraces: function (playerId, versionId, gameplayId, data, convertedData) {
            var deferred = Q.defer();

            var i;
            var indexCommand = {index: {_index: versionId, _type: 'traces'}};
            var commands = [];
            for (i = 0; i < convertedData.length; ++i) {
                commands.push(indexCommand, {out: convertedData[i]});
            }

            esClient.bulk({
                body: commands
            }, function (error, response) {
                if (error) {
                    console.error(error);
                    return deferred.reject(error);
                }
                deferred.resolve();
            });

            return deferred.promise;
        }
    };
};

module.exports = kafkaConsumer;