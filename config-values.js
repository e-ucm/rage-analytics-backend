'use strict';

/**
 * This file exports two objects ('defaultValues' and 'testValues') with the information needed to
 * create the 'config.js' and 'config-test.js' files, as specified in the file 'setup.js'.
 *
 * config.js is used in when we are not performing tests over the application ('npm start').
 * config-test.js is used when the tests are launched ('npm test').
 *
 * For more information about the configuration files, take a lok at 'setup.js' to see how generates
 * the files from the 'config-example.js' file.
 *
 * The following values are needed for the configuration.
 *
 * @param projectName - Used in the 'subject' of the emails received (contact form) or sent (password reset).
 * @param companyName -
 * @param mongoHost - Used to build 'mongodbUrl'
 * @param mongoPort - Used to build 'mongodbUrl'
 * @param mongodbUrl - Note that this value mustn't be the same in 'defaultValues' and 'testValues'.
 * @param apiPath - prefix for the REST API requests.
 * @param port - port to listen to.
 * @param lrsHost - Used to build 'lrsUrl'
 * @param lrsPort - Used to build 'lrsUrl'
 * @param lrsUrl - Base url to the LRS, e.g. http://localhost:8080/xAPI/.
 * @param lrsUsername - LRS username for 'basic' authentication.
 * @param lrsPassword - LRS password for 'basic' authentication.
 * @param realtimeJar - Absolute path to the realtime dependency.
 * @param stormPath - Absolute path to the storm installation (STORM_HOME).
 * @param kafkaHost - Used to build 'kafkaUrl'
 * @param kafkaPort - Used to build 'kafkaUrl'
 * @param kafkaUrl - Kafka server URL, e.g. localhost:2181.
 */

/**
 * Initializes 'conf' properties with values read from the environment.
 * The environment values must have the following format:
 *      'prefix' + 'conf.propertyKey'
 *          or
 *      'prefix' + 'conf.propertyKey.toUpperCase()'
 *
 * 'links' is an array with values that, when appended '_PORT', can be found in the environment.
 * Is useful for a faster parse of some values such as mongo/redis host/port.
 *
 * @param conf
 * @param prefix
 * @param links
 */
function initFromEnv(conf, prefix, links) {

    for (var item in conf) {
        var envItem = process.env[prefix + item];
        if (!envItem) {
            envItem = process.env[prefix + item.toUpperCase()];
        }
        if (envItem) {
            conf[item] = envItem;
        }
    }

    links.forEach(function (link) {
        var linkPort = process.env[link.toUpperCase() + '_PORT'];
        if (linkPort) {
            /*
             We want to end up with:
             conf.mongoHost = 172.17.0.15;
             conf.mongoPort = 27017;
             Starting with values like this:
             MONGO_PORT=tcp://172.17.0.15:27017
             */
            var values = linkPort.split('://');
            if (values.length === 2) {
                values = values[1].split(':');
                if (values.length === 2) {
                    conf[link + 'Host'] = values[0];
                    conf[link + 'Port'] = values[1];
                }
            }
        }
    });
}

exports.defaultValues = {
    projectName: 'Rage Analytics Backend',
    companyName: 'e-UCM Research Group',
    mongoHost: 'localhost',
    mongoPort: '27017',
    mongodbUrl: 'mongodb://localhost:27017/analytics-backend',
    apiPath: '/api',
    port: 3300,
    a2Host: 'localhost',
    a2Port: '3000',
    a2ApiPath: 'http://localhost:3000/api/',
    a2AdminUsername: 'root',
    a2AdminPassword: process.env.A2_rootPassword || (process.env.A2_ROOTPASSWORD || 'root'),
    lrsHost: 'localhost',
    lrsPort: 8080,
    lrsUrl: 'http://localhost:8080/xAPI/',
    lrsUsername: 'openlrs',     // Used for 'basic' authentication
    lrsPassword: 'openlrs',
    realtimeJar: '/home/eucm/hlocal/rage/gleaner/gleaner-realtime/target/realtime-jar-with-dependencies.jar',
    stormPath: '/home/eucm/hlocal/rage/gleaner/storm/apache-storm-0.9.5',
    kafkaHost: 'localhost',
    kafkaPort: '2181',
    kafkaUrl: 'localhost:2181'
};

exports.testValues = {
    projectName: 'rage-analytics-backend (Test)',
    companyName: 'e-UCM Research Group (Test)',
    mongoHost: 'localhost',
    mongoPort: '27017',
    mongodbUrl: 'mongodb://localhost:27017/analytics-backend-test', // This must be different than 'exports.defaultValues.mongodbUrl'
    apiPath: '/api',
    port: 3330,
    a2Host: 'localhost',
    a2Port: '3000',
    a2ApiPath: 'http://localhost:3000/api/',
    a2AdminUsername: 'root',
    a2AdminPassword: 'root',
    lrsHost: 'localhost',
    lrsPort: 8080,
    lrsUrl: 'http://localhost:8080/xAPI/',
    lrsUsername: 'openlrs',
    lrsPassword: 'openlrs',
    realtimeJar: '/home/eucm/hlocal/rage/gleaner/gleaner-realtime/target/realtime-jar-with-dependencies.jar',
    stormPath: '/home/eucm/hlocal/rage/gleaner/storm/apache-storm-0.9.5',
    kafkaHost: 'localhost',
    kafkaPort: '2181',
    kafkaUrl: 'localhost:2181'
};

var prefix = 'RAGE_ANALYTICS_BACKEND_';
var links = ['kafka', 'lrs', 'mongo', 'a2'];
initFromEnv(exports.defaultValues, prefix, links);
initFromEnv(exports.testValues, prefix, links);

// Some control instructions

// Ensuring that 'mongodbUrl' values are different
exports.defaultValues.mongodbUrl = 'mongodb://' + exports.defaultValues.mongoHost + ':' + exports.defaultValues.mongoPort + "/analytics-backend";
exports.testValues.mongodbUrl = exports.defaultValues.mongodbUrl + '-test';

exports.defaultValues.a2ApiPath = 'http://' + exports.defaultValues.a2Host + ':' + exports.defaultValues.a2Port + '/api/';
exports.testValues.a2ApiPath = exports.defaultValues.a2ApiPath;
exports.testValues.a2AdminUsername = exports.defaultValues.a2AdminUsername;
exports.testValues.a2AdminPassword = exports.defaultValues.a2AdminPassword;

exports.defaultValues.lrsUrl = 'http://' + exports.defaultValues.lrsHost + ':' + exports.defaultValues.lrsPort + "/xAPI/";
exports.testValues.lrsUrl = exports.defaultValues.lrsUrl;

exports.defaultValues.kafkaUrl = 'http://' + exports.defaultValues.kafkaHost + ':' + exports.defaultValues.kafkaPort;
exports.testValues.kafkaUrl = exports.defaultValues.kafkaUrl;