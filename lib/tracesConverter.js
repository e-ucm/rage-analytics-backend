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
            }
        }
    }
    return null;
};