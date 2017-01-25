'use strict';

var kafkaConsumer = function (esClient) {
    var getElasticSearchData = require('../tracesConverter').toElasticSearch;
    var Q = require('q');

    return {
        addTraces: function (playerId, versionId, gameplayId, data) {
            var deferred = Q.defer();

            var traces = [];
            var i;
            for (i = 0; i < data.length; ++i) {
                var realtimeData = getElasticSearchData(data[i]);
                if (realtimeData) {
                    traces.push(realtimeData);
                }
            }


            var indexCommand = {create: {_index: versionId, _type: 'traces'}};
            var commands = [];
            for (i = 0; i < traces.length; ++i) {
                commands.push(indexCommand, traces[i]);
            }

            esClient.bulk({
                body: commands
            }, function (error, response) {
                if (error) {
                    console.log(error);
                    return deferred.reject(error);
                }
                deferred.resolve();
            });

            return deferred.promise;
        }
    };
};

module.exports = kafkaConsumer;