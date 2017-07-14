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

var Path = require('path');
var testTransformer = require(Path.resolve(__dirname, '/transformer-test.js'));

var existingModelVersion = 1;

var state = 'DISCONNECTED';

function connect(config, callback) {

    should(state).equal('DISCONNECTED');
    state = 'READY';

    callback();
}

function refresh(callback) {

    should(state).equal('READY');

    // STATUS == 0 -> OK no transition required
    //        == 1 -> PENDING, transform must be performed
    //        == 2 -> ERROR, an error has happened, no update

    var status = existingModelVersion === 1 ? 1 : 0;

    if (status === 0) {
        state = 'OK';
        callback(null, {
            status: status
        });
    } else {
        state = 'TRANSFORM';
        callback(null, {
            status: status,
            requirements: testTransformer.requirements,
            version: testTransformer.version
        });
    }
}


function transform(callback) {

    should(state).equal('TRANSFORM');

    async.waterfall([function (newCallback) {
            console.log('Starting executing elastic transformer ' + JSON.stringify(testTransformer.version, null, 4));
            newCallback(null, {});
        }, testTransformer.backup,
            testTransformer.upgrade,
            testTransformer.check],
        function (err, result) {
            if (err) {
                console.error('Check failed (upgrade error?)');
                console.error(err);
                console.log('Trying to restore...');
                return testTransformer.restore({}, function(restoreError, result) {
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

                    state = 'READY';
                }
            });
        });

    callback();
};

module.exports = {
    connect: connect,
    refresh: refresh,
    transform: transform,
    existingModelVersion: function () {
        return existingModelVersion;
    }
};