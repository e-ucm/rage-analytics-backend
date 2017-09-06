/*
 * Copyright 2016 e-UCM (http://www.e-ucm.es/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * This project has received funding from the European Union’s Horizon
 * 2020 research and innovation programme under grant agreement No 644187.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0 (link is external)
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    mongodbUrlA2: 'mongodb://localhost:27017/' + (process.env.A2_MONGO_NAME || 'a2'),
    mongoModelVersion: '3', // Integer increment per version change
    elasticsearchURL: 'http://localhost:9200',
    apiPath: '/api',
    port: 3300,
    a2Host: 'localhost',
    a2Port: '3000',
    a2Prefix: 'gleaner',
    a2HomePage: 'http://localhost:3000/',
    a2ApiPath: 'http://localhost:3000/api/',
    a2AdminUsername: 'root',
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    a2AdminPassword: process.env.A2_rootPassword || (process.env.A2_ROOTPASSWORD || 'root'),
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    lrsHost: 'localhost',
    lrsPort: 8080,
    lrsUrl: 'http://localhost:8080/xAPI/',
    lrsUsername: 'openlrs',     // Used for 'basic' authentication
    lrsPassword: 'openlrs',
    realtimeJar: '/home/eucm/hlocal/rage2/rage-analytics-realtime/target/realtime-jar-with-dependencies.jar',
    stormPath: '/home/eucm/hlocal/rage/gleaner/storm/apache-storm-1.0.2/bin',
    nimbusHost: 'localhost',
    nimbusPort: '6627',
    kzkHost: 'localhost',
    kzkPort: '2181',
    kafkaUrl: 'localhost:2181',
    myHost: process.env.MY_HOST || 'localhost',
    fluxYaml: 'flux.yml',
    analysisFolder: './analysis',
    elasticsearchHost: 'localhost',
    elasticsearchPort: 9200,
    elasticsearchModelVersion: '2',
    defaultKibanaIndex: 'default-kibana-index',
    maxSizeRequest: '1mb'
};

exports.testValues = {
    projectName: 'rage-analytics-backend (Test)',
    companyName: 'e-UCM Research Group (Test)',
    mongoHost: 'localhost',
    mongoPort: '27017',
    mongodbUrl: 'mongodb://localhost:27017/analytics-backend-test', // This must be different than 'exports.defaultValues.mongodbUrl'
    mongodbUrlA2: 'mongodb://localhost:27017/' + (process.env.A2_MONGO_NAME || 'a2') + '-test',
    mongoModelVersion: '3', // Integer increment per version change
    elasticsearchURL: 'http://localhost:9200',
    apiPath: '/api',
    port: 3330,
    a2Host: 'localhost',
    a2Port: '3000',
    a2Prefix: 'gleaner',
    a2HomePage: 'http://localhost:3000/',
    a2ApiPath: 'http://localhost:3000/api/',
    a2AdminUsername: 'root',
    a2AdminPassword: 'root',
    lrsHost: 'localhost',
    lrsPort: 8080,
    lrsUrl: 'http://localhost:8080/xAPI/',
    lrsUsername: 'openlrs',
    lrsPassword: 'openlrs',
    realtimeJar: '/home/eucm/hlocal/rage/gleaner/gleaner-realtime/target/realtime-jar-with-dependencies.jar',
    stormPath: '/home/eucm/hlocal/rage/gleaner/storm/apache-storm-1.0.2/bin',
    nimbusHost: 'localhost',
    nimbusPort: '6627',
    kzkHost: 'localhost',
    kzkPort: '2181',
    kafkaUrl: 'localhost:2181',
    myHost: process.env.MY_HOST || 'localhost',
    fluxYaml: 'flux.yml',
    analysisFolder: './analysis',
    elasticsearchHost: 'localhost',
    elasticsearchPort: 9200,
    elasticsearchModelVersion: '2',
    defaultKibanaIndex: 'default-kibana-index',
    maxSizeRequest: '1mb'
};

var prefix = 'RAGE_ANALYTICS_BACKEND_';
var links = ['kzk', 'lrs', 'mongo', 'a2', 'nimbus', 'elasticsearch'];
initFromEnv(exports.defaultValues, prefix, links);
initFromEnv(exports.testValues, prefix, links);

// Some control instructions

// Ensuring that 'mongodbUrl' values are different
exports.defaultValues.mongodbUrl = 'mongodb://' + exports.defaultValues.mongoHost + ':' + exports.defaultValues.mongoPort + '/analytics-backend';
exports.testValues.mongodbUrl = exports.defaultValues.mongodbUrl + '-test';

exports.defaultValues.mongodbUrlA2 = 'mongodb://' + exports.defaultValues.mongoHost + ':' + exports.defaultValues.mongoPort + '/' + (process.env.A2_MONGO_NAME || 'a2');
exports.testValues.mongodbUrlA2 = exports.defaultValues.mongodbUrlA2 + '-test';

exports.defaultValues.elasticsearchURL = 'http://' + exports.defaultValues.elasticsearchHost + ':' + exports.defaultValues.elasticsearchPort;

exports.defaultValues.a2HomePage = 'http://' + exports.defaultValues.a2Host + ':' + exports.defaultValues.a2Port + '/';
exports.defaultValues.a2ApiPath = exports.defaultValues.a2HomePage + 'api/';
exports.testValues.a2ApiPath = exports.defaultValues.a2ApiPath;
exports.testValues.a2HomePage = exports.defaultValues.a2HomePage;
exports.testValues.a2AdminUsername = exports.defaultValues.a2AdminUsername;
exports.testValues.a2AdminPassword = exports.defaultValues.a2AdminPassword;

exports.defaultValues.lrsUrl = 'http://' + exports.defaultValues.lrsHost + ':' + exports.defaultValues.lrsPort + '/xAPI/';
exports.testValues.lrsUrl = exports.defaultValues.lrsUrl;

exports.defaultValues.kafkaUrl = exports.defaultValues.kzkHost + ':' + exports.defaultValues.kzkPort;
exports.testValues.kafkaUrl = exports.defaultValues.kafkaUrl;
