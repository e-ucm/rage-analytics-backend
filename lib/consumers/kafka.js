'use strict';

var sessions = require('../sessions');

var kafkaConsumer = function (kafkaConfig) {
    var kafka = require('../services/kafka')(kafkaConfig.uri);
    var players = require('../players');

    /**
     *
     * @param str
     * @param suffix
     * @returns {boolean} - true if the given string ends with the provided suffix.
     */
    var endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    /**
     *
     * Builds the real-time data from a Statement.
     *
     * @param extensions
     * @returns {*}
     */
    var buildRealTimeData = function (statement, extensions, event, isZone) {
        var target = getTarget(statement);
        if (target) {
            var value = getValue(statement);
            var realTimeData = {};
            for (var key in extensions) {
                realTimeData[key] = extensions[key];
            }
            realTimeData.event = event;
            if(!isZone) {
                realTimeData.target = target;
                realTimeData.value = value;
            }else {
                realTimeData.value = target;
            }
            return realTimeData;
        }
        return null;
    };

    /**
     *
     * Given an xAPI statements returns the 'target' value extracted from the 'object' field.
     *
     * @param statement xAPI statement
     */
    var getTarget = function (statement) {
        var object = statement.object;
        if (object) {
            var objectId = object.id;
            if (objectId) {
                var index = objectId.lastIndexOf('/');
                if (index !== -1) {
                    return objectId.substring(index + 1);
                }
            }
        }
        return null;
    };

    /**
     *
     * Given an xAPI statements returns the 'value' value extracted from the 'result.extensions' field.
     *
     * @param statement xAPI statement
     */
    var getValue = function (statement) {
        var result = statement.result;
        if (result) {
            var extensions = result.extensions;
            if (extensions) {
                for (var key in extensions) {
                    if (endsWith(key, 'value')) {
                        return extensions[key];
                    }
                }
            }
        }
        return null;
    };

    /**
     *
     * Given an xAPI statements returns the real-time data expected by the real-time processing module.
     *
     * The format of the returned data is expected to be
     *      {
     *          event: 'var', 'choice', 'zone',
     *          target: <the event target>,
     *          value: <the new value of the target>,
     *          gameplayId: '12321...',
     *          versionId: '12343234...'
     *      }
     *
     * @param statement xAPI statement
     */
    var getRealTimeData = function (statement) {

        var extensions = statement.object.definition.extensions;
        if (extensions) {

            // Check for the old xAPI statements format
            if (extensions.event) {
                return extensions;
            }

            // Parse the new xAPI statement format
            var verb = statement.verb;
            if (verb) {
                var verbId = verb.id;
                if (verbId) {
                    if (endsWith(verbId, 'choose')) {
                        return buildRealTimeData(statement, extensions, 'choice');
                    } else if (endsWith(verbId, 'entered')) {
                        return buildRealTimeData(statement, extensions, 'zone', true);
                    } else if (endsWith(verbId, 'updated')) {
                        return buildRealTimeData(statement, extensions, 'var');
                    }
                }
            }
        }
        return null;
    };

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
                                var realtimeData = getRealTimeData(data[i]);
                                if (realtimeData) {
                                    traces.push(realtimeData);
                                }
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