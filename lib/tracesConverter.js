'use strict';


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
 * Builds the real-time data from an 'entered' or 'viewed' Statement.
 *
 * @param extensions
 * @param event 'zone' or 'screen'
 * @returns {*}
 */
var buildRealTimeDataZoneOrScreen = function (statement, extensions, event) {
    var target = getTarget(statement);
    if (target) {
        var realTimeData = {};
        for (var key in extensions) {
            realTimeData[key] = extensions[key];
        }
        realTimeData.event = event;
        realTimeData.value = target;
        return realTimeData;
    }
    return null;
};

/**
 *
 * Builds the real-time data from a 'choose' or 'updated' Statement.
 *
 * @param extensions
 * @param event 'choice' or 'var'
 * @returns {*}
 */
var buildRealTimeDataChoiceOrVar = function (statement, extensions, event) {
    var target = getTarget(statement);
    if (target) {
        var value = getValue(statement);
        if (value) {
            var realTimeData = {};
            for (var key in extensions) {
                realTimeData[key] = extensions[key];
            }
            realTimeData.event = event;
            realTimeData.target = target;
            realTimeData.value = value;
            return realTimeData;
        }
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
    return getFromExtensions(statement, 'value');
};

/**
 *
 * Given an xAPI statements returns the 'progress' value extracted from the 'result.extensions' field.
 *
 * @param statement xAPI statement
 */
var getProgress = function (statement) {
    return getFromExtensions(statement, 'progress');
};

/**
 *
 * Given an xAPI statements returns the 'value' value extracted from the 'result.extensions' field.
 *
 * @param statement xAPI statement
 */
var getFromExtensions = function (statement, fieldValue) {
    var result = statement.result;
    if (result) {
        var extensions = result.extensions;
        if (extensions) {
            for (var key in extensions) {
                if (endsWith(key, fieldValue)) {
                    return extensions[key];
                }
            }
        }
    }
    return null;
};

/**
 *
 * Given an xAPI statements returns the
 * 'type' value extracted from the 'object.definition' field.
 *
 * @param statement xAPI statement
 */
var getType = function (statement) {
    var object = statement.object;
    if (object) {
        var definition = object.definition;
        if (definition) {
            var definitionType = definition.type;
            if (definitionType) {
                var index = definitionType.lastIndexOf('/');
                if (index !== -1) {
                    return definitionType.substring(index + 1);
                }
            }
        }
    }
    return null;
};

/**
 *
 * Given an xAPI statements returns the 'response' value extracted from the
 * 'result.response' field.
 *
 * @param statement xAPI statement
 */
var getResponse = function (statement) {
    var result = statement.result;
    if (result) {
        return result.response;
    }
    return null;
};

/**
 *
 * Given an xAPI statement returns the
 * 'event' value extracted from the 'verb.id' field.
 *
 * @param statement xAPI statement
 */
var getEvent = function (statement) {
    var verb = statement.verb;
    if (verb) {
        var verbId = verb.id;
        if (verbId) {
            var index = verbId.lastIndexOf('/');
            if (index !== -1) {
                return verbId.substring(index + 1);
            }
        }
    }
    return null;
};

/**
 *
 * Given an xAPI statement returns the
 * 'timestamp' value extracted from the 'statement.timestamp' field.
 *
 * @param statement xAPI statement
 */
var getTimeStamp = function (statement) {
    return statement.timestamp;
};

/**
 * Receives an xAPI Profile Statement and returns
 * the equivalent data in Realtime format.
 *
 * xAPI Profile Statement info:
 *
 *     - https://github.com/e-ucm/tracking-model/blob/master/Tracking%20Model.md
 *     - https://docs.google.com/spreadsheets/d/1o1qukRVI_eWpgnarh3n506HbzT1QTxerJ9eIfOfybZk/edit#gid=0
 *
 * Supported xAPI Statements are:
 *      - Completable
 *      - Variable
 *      - Alternative
 *      - Reachable
 *
 * Realtime Format info:
 *
 *      Composed by a  JSON Object that contains the basic information of the
 *      xAPI Profile Statement in the following format:
 *
 *      {
 *          event: <the verb.id, e.g. from 'https://w3id.org/xapi/seriousgames/verbs/set' extracts 'set'>,
 *          target: <the object.id, e.g. from 'https://w3id.org/xapi/seriousgames/activities/variable' returns 'variable'>,
 *
 *          value: <the result.extensions.value, e.g. from 'http://rage-eu.com/xapi/extensions/value': '1' returns '1'>,
 *                  OR
 *          progress: <the result.extensions.progress, e.g. from 'http://rage-eu.com/xapi/extensions/progress': '0.5' returns '0.5'>,
 *                  OR
 *          response: <the result.response, e.g. from 'result.response': 'testResponse' extracts 'testResponse'>,
 *
 *          type: <the object.definition.type, e.g. from
 *                  'object.definition.type': 'https://rage.e-ucm.es/xapi/seriousgames/activities/Cutscene' returns 'Cutscene'>,
 *
 *          timestamp: <the 'statement.timestamp' value>
 *      }
 *
 * @param statement
 */
var buildXAPIProfile = function (statement, extensions) {
    var event = getEvent(statement);
    if (event) {
        var target = getTarget(statement);
        if (target) {

            var realtimeData = {
                event: event,
                target: target
            };

            var value = getValue(statement);
            if (value) {
                realtimeData.value = value;
            } else {
                var progress = getProgress(statement);
                if (progress) {
                    realtimeData.progress = progress;
                } else {
                    var response = getResponse(statement);
                    if (response) {
                        realtimeData.response = response;
                    }
                }
            }

            var type = getType(statement);
            if (type) {
                realtimeData.type = type;
            }

            for (var key in extensions) {
                realtimeData[key] = extensions[key];
            }

            return realtimeData;
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
module.exports = function (statement) {

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

                var timestamp = getTimeStamp(statement);
                if (timestamp) {
                    extensions.timestamp = timestamp;
                }

                if (endsWith(verbId, 'updated')) {
                    return buildRealTimeDataChoiceOrVar(statement, extensions, 'var');
                }

                if (endsWith(verbId, 'choose')) {
                    return buildRealTimeDataChoiceOrVar(statement, extensions, 'choice');
                }

                if (endsWith(verbId, 'entered')) {
                    return buildRealTimeDataZoneOrScreen(statement, extensions, 'zone');
                }

                if (endsWith(verbId, 'viewed')) {
                    return buildRealTimeDataZoneOrScreen(statement, extensions, 'screen');
                }

                return buildXAPIProfile(statement, extensions);
            }
        }
    }
    return null;
};