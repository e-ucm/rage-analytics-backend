'use strict';

var activities = require('../activities');

var kafkaConsumer = function (kafkaConfig) {
    var kafka = require('../services/kafka')(kafkaConfig.uri);
    var players = require('../players');

    return {
        addTraces: function (playerId, versionId, gameplayId, data, convertedData) {
            return activities.find({
                versionId: activities.toObjectID(versionId),
                start: {
                    $ne: null
                },
                end: null
            }, false).then(function (foundActivities) {
                if (!foundActivities) {
                    return false;
                }
                return players.findById(playerId)
                    .then(function (player) {
                        if (!player) {
                            return false;
                        }

                        var allowedActivities = [];
                        for (var i = 0; i < foundActivities.length; ++i) {
                            var activity = foundActivities[i];
                            if (!activity.allowAnonymous) {
                                if (!activity.students || activity.students.indexOf(player.name) === -1) {
                                    continue;
                                }
                            }
                            allowedActivities.push(activity);
                        }

                        if (allowedActivities.length > 0) {

                            var promises = [];
                            for (i = 0; i < allowedActivities.length; ++i) {

                                var results = [];

                                var allowedActivity = allowedActivities[i];
                                for (var j = 0; j < data.length; ++j) {
                                    var originalData = data[j];
                                    if (!originalData) {
                                        continue;
                                    }

                                    var outData = convertedData[j];
                                    if (!outData) {
                                        continue;
                                    }

                                    results.push({
                                        statement: originalData,
                                        out: outData,
                                        playerId: playerId,
                                        gameplayId: gameplayId,
                                        versionId: versionId,
                                        activityId: allowedActivity._id,
                                        classId: allowedActivity.classId
                                    });
                                }

                                promises.push(kafka.send(kafkaConfig.topicName, results));
                            }
                            return promises;
                        }

                        return false;
                    });
            });
        }
    };
};

module.exports = kafkaConsumer;