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
    should(state).equal('NONE');
    state = 'BACKUP';
    callback(null, config);
}

function upgrade(config, callback) {
    should(state).equal('BACKUP');
    state = 'UPGRADE';
    callback(null, config);
}

function check(config, callback) {
    should(state).equal('CHECK');
    state = 'CLEAN';
    callback(null, config);
}

function clean(config, callback) {
    should(state).equal('CLEAN');
    state = 'DONE';
    callback(null, config);
}

function restore(config, callback) {
    // TO DO test restore
    state = 'NONE';
    callback(null, config);
}

module.exports = {
    backup: backup,
    upgrade: upgrade,
    check: check,
    clean: clean,
    restore: restore,
    requires: {},
    version: {
        origin: '1',
        destination: '2'
    }
};