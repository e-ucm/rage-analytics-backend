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

var Path = require('path');
var async = require('async');
var config = require(Path.resolve(__dirname, '../../config.js'));

function logError(err, result, callback) {
    console.error('Unexpected error,', err);
    console.error('Result,', result);
    if (callback) {
        return callback(err, result);
    }
}

var controllers = {};

function controller(name, controller) {
    controllers[name] = controller;
}

function clearControllers() {
    controllers = {};
}

function getController(name) {
    return controllers[name];
}

function roll(callback) {

    var refreshes = {};
    for (var key in controllers) {
        var controller = controllers[key];
        refreshes[key] = controller.refresh.bind(controller);
    }

    console.log('Starting refresh phase!');
    async.series(refreshes,
        function (err, status) {
            // Results is now equal to: {one: 1, two: 2}
            console.log('Finished refresh phase!');
            if (err) {
                return logError(err, status, callback);
            }

            var finish = true;
            for (var s in status) {
                var refresh = status[s];
                if (refresh.status !== 0) {
                    finish = false;
                }
                if (refresh.status === 2) {
                    return logError('Error, refresh returned 2!', err, callback);
                }
            }

            if (finish) {
                console.log('Finished upgrading!');
                if (callback) {
                    return callback(null, 'Success!');
                }
                return;
            }

            /*

             {
             mongo : [1,2,3]

             }

             */

            var requirements = {};

            /*
             Gathering requirements for all controllers to any version
             */
            for (var keyCtr in controllers) {
                var contrReqs = status[keyCtr].requirements;
                for (var contrReq in contrReqs) {
                    var contrReqVersion = contrReqs[contrReq].toString();
                    if (!requirements[contrReq]) {
                        requirements[contrReq] = {};
                    }

                    if (!requirements[contrReq][contrReqVersion]) {
                        requirements[contrReq][contrReqVersion] = true;
                    }
                }
            }

            var transforms = {};
            for (var c in controllers) {
                if (status[c].status === 0) {
                    continue;
                }
                var version = status[c].version;
                if (!requirements[c] || !requirements[c][version.origin.toString()]) {
                    // Update
                    transforms[c] = controllers[c].transform.bind(controllers[c]);
                }
            }

            if (transforms.length === 0) {
                return logError('Controllers are pending, but no transforms are possible (system locked)!',
                    status, callback);
            }

            // TODO, is empty transforms -> double dependency?
            async.series(transforms,
                function (err, status) {
                    // Results is now equal to: {one: 1, two: 2}
                    if (err) {
                        return logError(err, status, callback);
                    }
                    console.log('Finished transforms phase!', status);
                    roll(callback);
                });
        });
}

function upgrade(done) {
    var connects = [function (callback) {
        console.log('Starting connect phase...');
        callback(null, config);
    }];
    for (var key in controllers) {
        var controller = controllers[key];
        connects.push(controller.connect.bind(controller));
    }
    async.waterfall(connects,
        function (err, result) {
            console.log('Finished connect phase!');
            if (err) {
                return logError(err, result, done);
            }
            roll(done);
        });
}

module.exports = {
    getController: getController,
    controller: controller,
    upgrade: upgrade,
    clearControllers: clearControllers
};
