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
var assert = require('assert');

module.exports = function (request, app, db) {


    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                     Test Upgrader Pipeline                  **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Upgrader pipeline tests', function () {
        this.timeout(25000);

        var controllerTest;
        var upgrader;
        var transformerTest;
        before(function (done) {
            upgrader = require('../../bin/upgrade/upgrader');
            upgrader.clearControllers();
            require('./controller-test');
            controllerTest = upgrader.getController('test');
            transformerTest = require('./transformer-test.js');

            done();
        });

        var stateVerifier = function(states, currentState) {
            return function (state) {
                should(state).be.equal(states[currentState[0]]);
                currentState[0]++;
            };
        };

        beforeEach(function (done) {
            controllerTest.reset();
            transformerTest.reset();
            // Restore flags
            for (var flag in transformerTest.testFlags) {
                transformerTest.testFlags[flag] = true;
            }
            done();
        });

        it('should not upgrade anything', function (done) {
            controllerTest.setModelVersion('2', null, function(err, result) {
                var counts = {
                    controllerStates: [0]
                };

                var nothingStates = ['READY', 'OK'];
                var nothingVerifier = stateVerifier(nothingStates, counts.controllerStates);
                controllerTest.testCallbacks.onStateChange = nothingVerifier;
                upgrader.upgrade(function(err, result) {
                    assert.equal(err, null, 'Error happened!');
                    should(counts.controllerStates[0]).be.equal(nothingStates.length);
                    done();
                });
            });
        });

        it('should do a normal upgrade and stop', function (done) {
            controllerTest.setModelVersion('1', null, function(err, result) {
                var counts = {
                    controllerStates: [0],
                    transformerStates: [0],
                    transformerCalls: [0]
                };

                // Controller cycle
                var normalStates = ['READY', 'TRANSFORM', 'READY', 'OK'];
                var normalVerifier = stateVerifier(normalStates, counts.controllerStates);
                controllerTest.testCallbacks.onStateChange = normalVerifier;

                // Transformer cycle
                var transformerStates = ['UPGRADE', 'CHECK', 'CLEAN', 'DONE'];
                var statesVerifier = stateVerifier(transformerStates, counts.transformerStates);
                transformerTest.testCallbacks.state = statesVerifier;
                var transformerCalls = ['backup', 'upgrade', 'check', 'clean'];
                var callsVerifier = stateVerifier(transformerCalls, counts.transformerCalls);
                transformerTest.testCallbacks.called = callsVerifier;

                upgrader.upgrade(function(err, result) {
                    assert.equal(err, null, 'Error happened!');

                    should(counts.controllerStates[0]).be.equal(normalStates.length);
                    should(counts.transformerStates[0]).be.equal(transformerStates.length);
                    should(counts.transformerCalls[0]).be.equal(transformerCalls.length);
                    done();
                });
            });
        });

        it('should restore after backup failed and end with error', function (done) {
            controllerTest.setModelVersion('1', null, function(err, result) {
                transformerTest.testFlags.backup = false;

                var counts = {
                    controllerStates: [0],
                    transformerStates: [0],
                    transformerCalls: [0]
                };

                // Controller cycle
                var normalStates = ['READY', 'TRANSFORM', 'ERROR'];
                var normalVerifier = stateVerifier(normalStates, counts.controllerStates);
                controllerTest.testCallbacks.onStateChange = normalVerifier;

                // Transformer cycle
                var transformerStates = ['RESTORE', 'DONE'];
                var statesVerifier = stateVerifier(transformerStates, counts.transformerStates);
                transformerTest.testCallbacks.state = statesVerifier;
                var transformerCalls = ['backup', 'restore'];
                var callsVerifier = stateVerifier(transformerCalls, counts.transformerCalls);
                transformerTest.testCallbacks.called = callsVerifier;

                upgrader.upgrade(function(err, result) {
                    assert.notEqual(err, null, 'Error is null');

                    should(counts.controllerStates[0]).be.equal(normalStates.length);
                    should(counts.transformerStates[0]).be.equal(transformerStates.length);
                    should(counts.transformerCalls[0]).be.equal(transformerCalls.length);
                    done();
                });
            });
        });

        it('should restore after upgrade failed and end with error', function (done) {
            controllerTest.setModelVersion('1', null, function(err, result) {
                transformerTest.testFlags.upgrade = false;

                var counts = {
                    controllerStates: [0],
                    transformerStates: [0],
                    transformerCalls: [0]
                };

                // Controller cycle
                var normalStates = ['READY', 'TRANSFORM', 'ERROR'];
                var normalVerifier = stateVerifier(normalStates, counts.controllerStates);
                controllerTest.testCallbacks.onStateChange = normalVerifier;

                // Transformer cycle
                var transformerStates = ['UPGRADE', 'RESTORE', 'DONE'];
                var statesVerifier = stateVerifier(transformerStates, counts.transformerStates);
                transformerTest.testCallbacks.state = statesVerifier;
                var transformerCalls = ['backup', 'upgrade', 'restore'];
                var callsVerifier = stateVerifier(transformerCalls, counts.transformerCalls);
                transformerTest.testCallbacks.called = callsVerifier;

                upgrader.upgrade(function(err, result) {
                    assert.notEqual(err, null, 'Error is null');

                    should(counts.controllerStates[0]).be.equal(normalStates.length);
                    should(counts.transformerStates[0]).be.equal(transformerStates.length);
                    should(counts.transformerCalls[0]).be.equal(transformerCalls.length);
                    done();
                });
            });
        });

        it('should restore after check failed and end with error', function (done) {
            controllerTest.setModelVersion('1', null, function(err, result) {
                transformerTest.testFlags.check = false;

                var counts = {
                    controllerStates: [0],
                    transformerStates: [0],
                    transformerCalls: [0]
                };

                // Controller cycle
                var normalStates = ['READY', 'TRANSFORM', 'ERROR'];
                var normalVerifier = stateVerifier(normalStates, counts.controllerStates);
                controllerTest.testCallbacks.onStateChange = normalVerifier;

                // Transformer cycle
                var transformerStates = ['UPGRADE', 'CHECK', 'RESTORE', 'DONE'];
                var statesVerifier = stateVerifier(transformerStates, counts.transformerStates);
                transformerTest.testCallbacks.state = statesVerifier;
                var transformerCalls = ['backup', 'upgrade', 'check', 'restore'];
                var callsVerifier = stateVerifier(transformerCalls, counts.transformerCalls);
                transformerTest.testCallbacks.called = callsVerifier;

                upgrader.upgrade(function(err, result) {
                    assert.notEqual(err, null, 'Error is null');

                    should(counts.controllerStates[0]).be.equal(normalStates.length);
                    should(counts.transformerStates[0]).be.equal(transformerStates.length);
                    should(counts.transformerCalls[0]).be.equal(transformerCalls.length);
                    done();
                });
            });
        });

        it('should not stop on cleaning error', function (done) {
            controllerTest.setModelVersion('1', null, function(err, result) {
                transformerTest.testFlags.clean = false;

                var counts = {
                    controllerStates: [0],
                    transformerStates: [0],
                    transformerCalls: [0]
                };

                // Controller cycle
                var normalStates = ['READY', 'TRANSFORM', 'READY', 'OK'];
                var normalVerifier = stateVerifier(normalStates, counts.controllerStates);
                controllerTest.testCallbacks.onStateChange = normalVerifier;

                // Transformer cycle
                var transformerStates = ['UPGRADE', 'CHECK', 'CLEAN', 'DONE'];
                var statesVerifier = stateVerifier(transformerStates, counts.transformerStates);
                transformerTest.testCallbacks.state = statesVerifier;
                var transformerCalls = ['backup', 'upgrade', 'check', 'clean'];
                var callsVerifier = stateVerifier(transformerCalls, counts.transformerCalls);
                transformerTest.testCallbacks.called = callsVerifier;

                upgrader.upgrade(function(err, result) {
                    assert.equal(err, null, 'Error is not null!');

                    should(counts.controllerStates[0]).be.equal(normalStates.length);
                    should(counts.transformerStates[0]).be.equal(transformerStates.length);
                    should(counts.transformerCalls[0]).be.equal(transformerCalls.length);
                    done();
                });
            });
        });
    });
};