'use strict';

/**
 *
 * Given an xAPI statements returns the 'target' value extracted from the 'object' field.
 *
 * @param statement xAPI statement
 */
var getTarget = function (statement) {
    var object = statement.object;
    var objectId = object.id;
    if (objectId) {
        var index = objectId.lastIndexOf('/');
        if (index !== -1) {
            return objectId.substring(index + 1);
        }
    }
    return null;
};

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
var buildXAPIProfile = function (statement, extensions) {
    var event = getEvent(statement);
    if (event) {
        var target = getTarget(statement);
        if (target) {

            extensions.event = event;
            extensions.target = target;

            var type = getType(statement);
            if (type) {
                extensions.type = type;
            }

            var result = statement.result;
            if (result) {

                // Parse the xAPIProfile result
                var score = result.score;
                if (score) {
                    var raw = score.raw;
                    if (raw !== null && raw !== undefined) {
                        extensions.score = raw;
                    }
                }

                var success = result.success;
                if (success !== null && success !== undefined) {
                    extensions.success = success;
                }

                var completion = result.completion;
                if (completion !== null && completion !== undefined) {
                    extensions.completion = completion;
                }

                var response = result.response;
                if (response !== null && response !== undefined) {
                    extensions.response = response;
                }

                parseExtensions(result, extensions);
            }

            return extensions;
        }
    }

    return null;
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
 * @returns {null}
 */
var toTrace = function (statement) {

    var extensions = {};

    var actor = statement.actor;
    if (actor) {
        var name = actor.name;
        if (name) {
            extensions.name = name;
        }
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

            return buildXAPIProfile(statement, extensions);
        }
    }
    return null;
};


/**
 *
 * Given an xAPI statements returns the real-time data expected by the real-time processing module.
 *
 * The format of the returned data is expected to be the simple JSON trace plus the following fields
 *      {
 *          gameplayId: '12321...',
 *          versionId: '12343234...'
 *      }
 *
 * @param statement xAPI statement
 */
module.exports = function (statement) {

    var trace = toTrace(statement);
    if (trace) {
        var defExtensions = statement.object.definition.extensions;

        trace.gameplayId = defExtensions.gameplayId;
        trace.versionId = defExtensions.versionId;

        return trace;
    }

    return null;
};