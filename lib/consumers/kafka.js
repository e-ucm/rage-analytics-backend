'use strict';

var sessions = require('../sessions');

var kafkaConsumer = function (kafkaConfig) {
    var kafka = require('../services/kafka')(kafkaConfig.uri);
    var players = require('../players');
    return {
        addTraces: function (playerId, versionId, gameplayId, data) {
            return sessions.find({
                versionId: sessions.toObjectID(versionId),
                start: {
                    $ne: null
                },
                end: null
            }, false).then(function (sessions) {
                if (!sessions) {
                    return false;
                }
                return players.findById(playerId)
                    .then(function (player) {
                        if (!player) {
                            return false;
                        }

                        var allowedSessions = [];
                        for (var i = 0; i < sessions.length; ++i) {
                            var session = sessions[i];
                            if (!session.allowAnonymous) {
                                if (!session.students || session.students.indexOf(player.name) === -1) {
                                    continue;
                                }
                            }
                            allowedSessions.push(session._id.toString());
                        }

                        if (allowedSessions.length > 0) {

                            var traces = [];
                            for (i = 0; i < data.length; ++i) {
                                traces.push(data[i].object.definition.extensions);
                            }

                            var promises = [];
                            for (i = 0; i < allowedSessions.length; ++i) {
                                promises.push(kafka.send(allowedSessions[i], traces));
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