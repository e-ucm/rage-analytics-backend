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
 * @param mongodbUrl - Note that this value mustn't be the same in 'defaultValues' and 'testValues'.
 * @param apiPath - prefix for the REST API requests.
 * @param port - port to listen to.
 * @param lrsUrl - Base url to the LRS, e.g. http://localhost:8080/xAPI/.
 * @param lrsUsername - LRS username for 'basic' authentication.
 * @param lrsPassword - LRS password for 'basic' authentication.
 */

exports.defaultValues = {
    projectName: 'Learning Record Store',
    companyName: 'e-UCM Research Group',
    mongodbUrl: 'mongodb://localhost:27017/lrs',
    apiPath: '/api',
    port: 3300,
    lrsUrl: 'http://localhost:8080/xAPI/',
    lrsUsername: 'openlrs',     // Used for 'basic' authentication
    lrsPassword: 'openlrs'
};

exports.testValues = {
    projectName: 'lrs (Test)',
    companyName: 'e-UCM Research Group (Test)',
    mongodbUrl: 'mongodb://localhost:27017/lrs-test', // This must be different than 'exports.defaultValues.mongodbUrl'
    apiPath: '/api',
    port: 3330,
    lrsUrl: 'http://localhost:8080/xAPI/',
    lrsUsername: 'openlrs',
    lrsPassword: 'openlrs'
};
