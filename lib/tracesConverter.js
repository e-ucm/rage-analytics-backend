'use strict';

var uuidv4 = require('uuid/v4');

/**
 *
 * Given an xAPI statements returns the 'target' value extracted from the 'object' field.
 *
 * @param statement xAPI statement
 */
var getTarget = function (statement, trace) {
    var object = statement.object;
    if (object) {
        var objectId = object.id;
        var index;
        if (objectId) {
            if (endsWith(objectId, '/')) {
                return buildReturnError('Object Id cannot end with / for statement, ' + statement);
            }
            index = objectId.lastIndexOf('/');
            if (index !== -1) {
                trace.target = objectId.substring(index + 1);
            } else {
                trace.target = objectId;
            }
        } else {
            return buildReturnError('Object Id is missing for statement, ' + statement);
        }

        var definition = object.definition;
        if (definition) {
            var definitionType = definition.type;
            if (definitionType) {
                if (endsWith(definitionType, '/')) {
                    return buildReturnError('Object definition type cannot end with / for statement, ' + statement);
                }
                index = definitionType.lastIndexOf('/');
                if (index !== -1) {
                    trace.type = definitionType.substring(index + 1);
                } else {
                    trace.type = definitionType;
                }
            } else {
                return buildReturnError('Object definition type is missing for statement, ' + statement);
            }
        } else {
            return buildReturnError('Object definition is missing for statement, ' + statement);
        }
    } else {
        return buildReturnError('Object is missing for statement, ' + statement);
    }
};

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 *
 * Parses the 'result.extensions' contents into the 'container'
 *
 */
var parseExtensions = function (result, container) {
    var extensions = result.extensions;
    if (extensions) {
        container.ext = {};
        for (var key in extensions) {
            if (endsWith(key, '/')) {
                return buildReturnError('Extension ' + key + ' cannot end with / for result, ' + result);
            }
            var index = key.lastIndexOf('/');
            var extensionKey;
            if (index !== -1) {
                extensionKey = key.substring(index + 1);
            } else {
                extensionKey = key;
            }
            container.ext[extensionKey] = extensions[key];
        }
    }
};

/**
 *
 * Given an xAPI statement returns the
 * 'event' value extracted from the 'verb.id' field.
 *
 * @param statement xAPI statement
 */
var getEvent = function (statement, trace) {
    var verb = statement.verb;
    if (verb) {
        var verbId = verb.id;
        if (verbId) {
            if (endsWith(verbId, '/')) {
                return buildReturnError('Verb Id cannot end with / for statement, ' + statement);
            }
            var index = verbId.lastIndexOf('/');
            if (index !== -1) {
                trace.event = verbId.substring(index + 1);
            } else {
                trace.event = verbId;
            }
        } else {
            return buildReturnError('Verb Id is missing for statement, ' + statement);
        }
    } else {
        return buildReturnError('Verb is missing for statement, ' + statement);
    }
};


/**
 * Receives an xAPI Profile Statement and returns
 * the equivalent data in Realtime format.
 *
 * xAPI Profile Statement info:
 *
 *     - https://github.com/e-ucm/xapi-seriousgames/
 *     - https://docs.google.com/spreadsheets/d/1o1qukRVI_eWpgnarh3n506HbzT1QTxerJ9eIfOfybZk/edit#gid=0
 *
 * Supported xAPI Statements are:
 *      - Completable
 *      - Alternative
 *      - Accessible
 *      - TrackedGameObject
 *
 *
 * Realtime Format info:
 *
 *      Composed by a  JSON Object that contains the basic information of the
 *      xAPI Profile Statement in the following format:
 *
 *      {
 *          event: <the verb.id, e.g. from '.../completed' extracts 'set'>,
 *          target: <the object.id, e.g. from '.../variable' returns 'variable'>,
 *          name: <actor.name>,
 *
 *          ...result -> score, success, response, other extensions...
 *          type: <the object.definition.type, e.g. from
 *                  'object.definition.type': '.../Completable' returns 'Completable'>,
 *
 *          timestamp: <the 'statement.timestamp' value>
 *      }
 *
 * @param statement
 */
var buildXAPIProfile = function (statement, trace) {
    var eventError = getEvent(statement, trace);
    if (eventError) {
        return eventError;
    }
    var targetError = getTarget(statement, trace);
    if (targetError) {
        return targetError;
    }

    var result = statement.result;
    if (result) {

        // Parse the xAPIProfile result
        var score = result.score;
        if (score) {
            var raw = score.raw;
            if (raw !== null && raw !== undefined) {
                trace.score = raw;
            } else {
                return buildReturnError('Result.score.raw should not be undefined or null for statement, ' + statement);
            }
        }

        var success = result.success;
        if (success !== null && success !== undefined) {
            trace.success = success;
        }

        var completion = result.completion;
        if (completion !== null && completion !== undefined) {
            trace.completion = completion;
        }

        var response = result.response;
        if (response !== null && response !== undefined) {
            trace.response = response;
        }

        var extError = parseExtensions(result, trace);
        if (extError) {
            return extError;
        }
    }
};

var buildReturnError = function (message) {
    return new Error(message);
};

/**
 * Given a statement generates a simple JSON object containing its main information
 *      {
 *          event: 'completed', 'initialized', 'accessed...',
 *          target: <the event target>,
 *          response: <the new value of the target>,
 *          result: <the statement result>
 *              ...
 *      }
 * @param statement
 * @returns
 */
var toTrace = function (statement, trace) {

    var actor = statement.actor;
    if (actor) {
        var name = actor.name;
        if (name) {
            trace.name = name;
        } else {
            return buildReturnError('Actor name is missing for statement, ' + statement);
        }
    } else {
        return buildReturnError('Actor is missing for statement, ' + statement);
    }

    var timestamp = statement.timestamp;
    if (timestamp) {
        trace.timestamp = timestamp;
    } else {
        return buildReturnError('Timestamp is missing for statement, ' + statement);
    }

    // Parse the xAPI statement format
    return buildXAPIProfile(statement, trace);
};


/**
 *
 * Given an xAPI statements returns the real-time data expected by the real-time processing module.
 *
 * The format of the returned data is expected to be the simple JSON trace plus the following fields
 *
 *  {
 *    trace:{
 *          gameplayId: '12321...',
 *          versionId: '12343234...'
 *      },
 *     error: null
 *  }
 * @param statement xAPI statement
 */
module.exports = function (statement) {

    var trace = {};

    var error = toTrace(statement, trace);
    if (!error) {
        var defExtensions = statement.object.definition.extensions;

        trace.gameplayId = defExtensions.gameplayId;
        trace.versionId = defExtensions.versionId;
        trace.activityId = defExtensions.activityId;
        trace.session = defExtensions.session;
        trace.firstSessionStarted = defExtensions.firstSessionStarted;
        trace.currentSessionStarted = defExtensions.currentSessionStarted;
        trace.uuidv4 = uuidv4();
        return {
            trace: trace
        };
    }

    return {
        error: error
    };
};