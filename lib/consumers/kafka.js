'use strict';

var sessions = require('../sessions');

var kafkaConsumer = function (kafkaConfig) {
    var kafka = require('../services/kafka')(kafkaConfig.uri);
    var players = require('../players');
    return {
        addTraces: function (playerId, versionId, gameplayId, data) {
            return sessions.find({
                versionId: sessions.toObjectID(versionId),
                end: null
            }, false).then(function (sessions) {
                if (!sessions) {
                    return false;
                }
                return players.findById(playerId)
                    .then(function(player) {
                        if(!player) {
                            return false;
                        }

                        var promises = [];
                        for(var i = 0; i < sessions.length; ++i) {
                            var session = sessions[i];
                            if(!session.allowAnonymous) {
                                if (!session.students || session.students.indexOf(player.name) === -1) {
                                    continue;
                                }
                            }
                            
                            promises.push(kafka.send(session._id.toString(), data));
                        }

                        return promises;
                    });
            });
        }
    };
};

module.exports = kafkaConsumer;