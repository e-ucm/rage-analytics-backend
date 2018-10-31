'use strict';

var objectId = 'https://w3id.org/xapi/adb/objectid/';

var verbIds = {
    initialized: 'https://w3id.org/xapi/adb/verbs/initialized',
    progressed: 'http://adlnet.gov/expapi/verbs/progressed',
    completed: 'http://adlnet.gov/expapi/verbs/completed',
    accessed: 'https://w3id.org/xapi/seriousgames/verbs/accessed',
    skipped: 'http://id.tincanapi.com/verb/skipped',
    selected: 'https://w3id.org/xapi/adb/verbs/selected',
    unlocked: 'https://w3id.org/xapi/seriousgames/verbs/unlocked',
    interacted: 'http://adlnet.gov/expapi/verbs/interacted',
    used: 'https://w3id.org/xapi/seriousgames/verbs/used',
    unknown: 'https://w3id.org/xapi/seriousgames/verbs/unknown'
};

var objectIds = {
    // Completable
    game: 'https://w3id.org/xapi/seriousgames/activity-types/serious-game',
    session: 'https://w3id.org/xapi/seriousgames/activity-types/session',
    level: 'https://w3id.org/xapi/seriousgames/activity-types/level',
    quest: 'https://w3id.org/xapi/seriousgames/activity-types/quest',
    stage: 'https://w3id.org/xapi/seriousgames/activity-types/stage',
    combat: 'https://w3id.org/xapi/seriousgames/activity-types/combat',
    storynode: 'https://w3id.org/xapi/seriousgames/activity-types/story-node',
    race: 'https://w3id.org/xapi/seriousgames/activity-types/race',
    completable: 'https://w3id.org/xapi/seriousgames/activity-types/completable',

    // Acceesible
    screen: 'https://w3id.org/xapi/seriousgames/activity-types/screen',
    area: 'https://w3id.org/xapi/seriousgames/activity-types/area',
    zone: 'https://w3id.org/xapi/seriousgames/activity-types/zone',
    cutscene: 'https://w3id.org/xapi/seriousgames/activity-types/cutscene',
    accessible: 'https://w3id.org/xapi/seriousgames/activity-types/accessible',

    // Alternative
    question: 'http://adlnet.gov/expapi/activities/question',
    menu: 'https://w3id.org/xapi/seriousgames/activity-types/menu',
    dialog: 'https://w3id.org/xapi/seriousgames/activity-types/dialog-tree',
    path: 'https://w3id.org/xapi/seriousgames/activity-types/path',
    arena: 'https://w3id.org/xapi/seriousgames/activity-types/arena',
    alternative: 'https://w3id.org/xapi/seriousgames/activity-types/alternative',

    // GameObject
    enemy: 'https://w3id.org/xapi/seriousgames/activity-types/enemy',
    npc: 'https://w3id.org/xapi/seriousgames/activity-types/non-player-character',
    item: 'https://w3id.org/xapi/seriousgames/activity-types/item',
    gameobject: 'https://w3id.org/xapi/seriousgames/activity-types/game-object',

    unknown: 'https://w3id.org/xapi/seriousgames/unknown-type/unknown'

};


var parseCSV = function (trace) {
    trace = trace.replace('\r', '');
    var list = [];

    var escape = false;
    var start = 0;
    for (var i = 0; i < trace.length; i++) {
        switch (trace.charAt(i)) {
            case '\\': {
                escape = true;
                break;
            }
            case ',': {
                if (!escape) {
                    var subs = trace.substr(start, i - start);
                    list.push(subs.replace('\\,', ','));
                    start = i + 1;
                } else {
                    escape = false;
                }
                break;
            }
            default: {
                break;
            }
        }
    }
    list.push(trace.substring(start).replace('\\,', ','));

    return list;
};

var createObject = function (parts) {
    var obj = {};

    var type = parts[3];
    if (!type) {
        type = 'unknown';
    }
    var id = parts[4];

    var typeKey = objectIds[type];
    if (!typeKey) {
        console.info('Unknown definition el object (target) type: ' + type);
        typeKey = type;
    }

    obj.id = objectId + id;

    obj.definition = {
        type: typeKey
    };

    return obj;
};

var createVerb = function (event) {

    if (!event) {
        event = 'unknown';
    }

    var verb = {};

    var id = verbIds[event];

    if (!id) {
        console.info('Unknown definition el verb event: ' + event);
        id = event;
    }

    verb.id = id;

    return verb;
};

/**
 * Given a csv trace, returns the xAPI statement (serious game model)
 * @param statement, trace
 * @returns
 */
var toStatement = function (statement, trace) {

    var parts = parseCSV(trace);

    var username = parts[0];

    var timestamp = new Date(Number(parts[1])).toISOString();

    statement.timestamp = timestamp;

    var actor = {
        account: {
            homePage: 'http://localhost:3000/',
            name: 'offline'
        },
        name: username
    };

    statement.actor = actor;

    statement.verb = createVerb(parts[2]);

    statement.object = createObject(parts);

    if (parts.length > 5) {
        // Parse extensions

        var extCount = parts.length - 5;
        if (extCount > 0 && extCount % 2 === 0) {
            var extensions = {};
            statement.result = extensions;
            // Extensions come in <key, value> pairs

            for (var i = 5; i < parts.length; i += 2) {
                var key = parts[i];
                var value = parts[i + 1];
                if (!key || !value) {
                } else if (key === 'score') {

                    var valueResult = parseFloat(value);

                    extensions.score = {
                        raw: valueResult
                    };
                } else if (key === 'success') {
                    extensions.success = value === 'true';
                } else if (key === 'completion') {
                    extensions.completion = value === 'true';
                } else if (key === 'response') {
                    extensions.response = value;
                } else {
                    if (!extensions.extensions) {
                        extensions.extensions = {};
                    }
                    if (key === 'health') {

                        var valueResult2 = parseFloat(value);

                        extensions.extensions.health = valueResult2;
                    } else if (key === 'progress') {

                        var valueResult3 = parseFloat(value);

                        extensions.extensions.progress = valueResult3;
                    } else {
                        if (value === 'true') {
                            extensions.extensions[key] = true;
                        } else if (value === 'false') {
                            extensions.extensions[key] = false;
                        } else if (isNaN(value)) {
                            extensions.extensions[key] = value;
                        } else if (value) {
                            extensions.extensions[key] = Number(value);
                        } else {
                            extensions.extensions[key] = value;
                        }
                    }
                }
            }
        }
    }
};


/**
 *
 * Given a trace in CSV, it truns the trace into an xAPI statement..
 *
 * The format of the returned data is follows the xAPI statement format, using the Serious Games model.
 * @param CSV trace as a CSV string.
 */
module.exports = function (trace) {

    var statement = {};

    var error = toStatement(statement, trace);
    if (!error) {
        return {
            statement: statement
        };
    }

    return {
        error: error
    };
};