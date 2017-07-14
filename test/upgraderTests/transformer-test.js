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
var state = 'NONE';

function backup(config, callback) {
    console.log('[TEST TRANSFORMER] backup');
    testCallbacks.called('backup');
    should(state).be.equal('NONE');

    if (testFlags.backup === false) {
        state = 'RESTORE';
        testCallbacks.state(state);
        callback('Failed to backup', config);
    } else {
        state = 'UPGRADE';
        testCallbacks.state(state);
        callback(null, config);
    }

}

function upgrade(config, callback) {
    console.log('[TEST TRANSFORMER] upgrade');
    testCallbacks.called('upgrade');
    should(state).be.equal('UPGRADE');

    if (testFlags.upgrade === false) {
        state = 'RESTORE';
        testCallbacks.state(state);
        callback('Failed to upgrade', config);
    } else {
        state = 'CHECK';
        testCallbacks.state(state);
        callback(null, config);
    }
}

function check(config, callback) {
    console.log('[TEST TRANSFORMER] check');
    testCallbacks.called('check');
    should(state).be.equal('CHECK');

    if (testFlags.check === false) {
        state = 'RESTORE';
        testCallbacks.state(state);
        callback('Failed to check', config);
    } else {
        state = 'CLEAN';
        testCallbacks.state(state);
        callback(null, config);
    }
}

function clean(config, callback) {
    console.log('[TEST TRANSFORMER] clean');
    testCallbacks.called('clean');
    should(state).be.equal('CLEAN');

    if (testFlags.clean === false) {
        state = 'DONE';
        testCallbacks.state(state);
        callback('Failed to clean', config);
    } else {
        state = 'DONE';
        testCallbacks.state(state);
        callback(null, config);
    }
}

function restore(config, callback) {
    console.log('[TEST TRANSFORMER] restore');
    testCallbacks.called('restore');
    // TO DO test restore
    should(state).be.equal('RESTORE');

    if (testFlags.restore === false) {
        state = 'ERROR';
        testCallbacks.state(state);
        callback('Failed to restore', config);
    } else {
        state = 'DONE'; // Should it be ERROR?
        testCallbacks.state(state);
        callback(null, config);
    }
}

var testCallbacks = {
    called: function(method) {},
    state: function(state) {}
};

var testFlags = {
    backup: true,
    upgrade: true,
    check: true,
    clean: true,
    restore: true
};

module.exports = {
    backup: backup,
    upgrade: upgrade,
    check: check,
    clean: clean,
    restore: restore,
    requires: {},
    // Test vars
    reset: function() {
        state = 'NONE';
    },
    version: {
        origin: '1',
        destination: '2'
    },
    testFlags: testFlags,
    testCallbacks: testCallbacks
};