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

var upgrader = require('../../bin/upgrade/upgrader');
var AbstractController = require('../../bin/upgrade/controllers/abstract-controller');
var testTransformer = require('./transformer-test.js');

function TestController() {
    AbstractController.call(this, [testTransformer]);
    this.state = 'DISCONNECTED';
    this.existingModelVersion = '1';

    this.testTransformer = testTransformer;
    this.testCallbacks = {
        onStateChange: function(state) {}
    };
}

TestController.prototype = new AbstractController();
TestController.prototype.constructor = TestController;

TestController.prototype.doConnect = function (config, callback) {
    should(this.state).equal('DISCONNECTED');
    console.log('[TEST CONTROLLER] connecting');
    this.state = 'READY';
    this.testCallbacks.onStateChange(this.state);
    callback(null, config);
};

TestController.prototype.getModelVersion = function (config, callback) {
    callback(null, this.existingModelVersion);
};


TestController.prototype.setModelVersion = function (version, config, callback) {
    this.existingModelVersion = version.toString();
    callback(null, config);
};

TestController.prototype.refresh = function (callback) {
    should(this.state).equal('READY');
    console.log('[TEST CONTROLLER] refreshing');

    AbstractController.prototype.refresh.call(this, function (err, status) {
        if (status.status === 0) {
            this.state = 'OK';
            this.testCallbacks.onStateChange(this.state);
        } else {
            this.state = 'TRANSFORM';
            this.testCallbacks.onStateChange(this.state);
        }
        return callback(err, status);
    }.bind(this));
};

TestController.prototype.transform = function (callback) {

    should(this.state).equal('TRANSFORM');
    console.log('[TEST CONTROLLER] transforming');

    AbstractController.prototype.transform.call(this, function(err, result) {
        if (err) {
            this.state = 'ERROR';
            this.testCallbacks.onStateChange(this.state);
        } else {
            this.state = 'READY';
            this.testCallbacks.onStateChange(this.state);
        }
        return callback(err, result);
    }.bind(this));
};

TestController.prototype.reset = function (callback) {
    this.nextTransformer = null;
    this.state = 'DISCONNECTED';
    this.existingModelVersion = '1';
};

upgrader.controller('test', new TestController());
