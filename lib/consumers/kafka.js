'use strict';

/**
 * Sends data for activity analysis. (Main stream)
 * @param kafkaConfig
 * @returns {{addTraces: addTraces}}
 */
var kafkaConsumer = function (kafkaConfig) {
    var kafka = require('../services/kafka')(kafkaConfig.uri);

    return {
        addTraces: function (playerId, versionId, gameplayId, activity, data, convertedData) {
            if (!activity) {
                return {
                    then: function (next) {
                        return next(false);
                    }
                };
            }

            var results = [];

            for (var j = 0; j < data.length; ++j) {
                var originalData = data[j];
                if (!originalData) {
                    continue;
                }

                var outData = convertedData[j];
                if (!outData) {
                    continue;
                }

                var object = {
                    statement: originalData,
                    out: outData,
                    playerId: playerId.toString(),
                    gameplayId: gameplayId.toString(),
                    versionId: versionId.toString(),
                    activityId: activity._id.toString(),
                    classId: activity.classId.toString()
                }

                if(activity.rootId){
                    object.glpId = 'analytics-' + activity.rootId.toString();
                }

                results.push(object);
            }

            return kafka.send(kafkaConfig.topicName, results);
        }
    };
};

module.exports = kafkaConsumer;