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

module.exports = function (request, app, db) {


    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                     Test Upgrader Pipeline                  **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Upgrader pipeline tests', function () {
        this.timeout(25000);

        var controllerTest = require('controller-test.js');
        var upgrader = require('../../../bin/upgrade/upgrader.js');
        before(function (done) {
            upgrader.controller('test', controllerTest);
            done();
        });


        beforeEach(function (done) {
            controllerTest.reset();
        });

        /* A it('should not upgrade anything', function (done) {
            controllerTest.notUpgrade();
            upgrader.upgrade();
            done();
        });*/

        it('should do a normal upgrade and stop', function (done) {
            // C controllerTest.normal();
            upgrader.upgrade();
            done();
        });
    });
};