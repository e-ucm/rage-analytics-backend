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

var should = require('should');
var async = require('async');

var testTransformer = require('./transformer-test.js');
var upgrader = require('../../bin/upgrade/upgrader');

var existingModelVersion = '1';

var state = 'DISCONNECTED';
var appConfig;

function connect(config, callback) {

    appConfig = config;
    should(state).equal('DISCONNECTED');
    console.log('[TEST CONTROLLER] connecting');
    state = 'READY';
    testCallbacks.onStateChange(state);

    callback();
}

function refresh(callback) {

    should(state).equal('READY');
    console.log('[TEST CONTROLLER] refreshing');

    // STATUS == 0 -> OK no transition required
    //        == 1 -> PENDING, transform must be performed
    //        == 2 -> ERROR, an error has happened, no update

    var status = existingModelVersion === '1' ? 1 : 0;

    if (status === 0) {
        state = 'OK';
        testCallbacks.onStateChange(state);
        callback(null, {
            status: status
        });
    } else {
        state = 'TRANSFORM';
        testCallbacks.onStateChange(state);
        callback(null, {
            status: status,
            requirements: testTransformer.requirements,
            version: testTransformer.version
        });
    }
}


function transform(callback) {

    should(state).equal('TRANSFORM');
    console.log('[TEST CONTROLLER] transforming');

    async.waterfall([function (newCallback) {
            console.log('Starting executing test transformer ' + JSON.stringify(testTransformer.version, null, 4));
            newCallback(null, appConfig);
        }, testTransformer.backup,
            testTransformer.upgrade,
            testTransformer.check],
        function (err, result) {
            if (err) {
                console.error('Transformer failed');
                console.error(err);
                state = 'ERROR';
                testCallbacks.onStateChange(state);
                console.log('Trying to restore...');
                return testTransformer.restore(appConfig, function(restoreError, result) {
                    if (restoreError) {
                        console.error('Error on while restoring the database... sorry :)');
                        return callback(restoreError);
                    }

                    console.log('Restore OK.');
                    return callback(err);
                });
            }

            console.log('Cleaning...');
            testTransformer.clean({}, function(cleanError, result) {

                if (cleanError) {
                    console.log('Error cleaning!');
                    console.error(cleanError);
                } else {
                    console.log('Clean OK.');
                }

                state = 'READY';
                testCallbacks.onStateChange(state);
                existingModelVersion = testTransformer.version.destination;

                callback(null, testTransformer.version.destination);
            });
        });
}

var testCallbacks = {
    onStateChange: function(state) {}
};

upgrader.controller('test', {
    connect: connect,
    refresh: refresh,
    transform: transform,
    existingModelVersion: function () {
        return existingModelVersion;
    },
    // Testing purposes variables
    testTransformer: testTransformer,
    setModelVersion: function(version) {
        existingModelVersion = version;
    },
    reset: function() {
        state = 'DISCONNECTED';
    },
    testCallbacks: testCallbacks
});