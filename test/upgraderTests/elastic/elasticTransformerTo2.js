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

module.exports = function (request, esClient) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**              Test Elastic Transformer To v2                 **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Elastic TransformTo2 test', function () {

        before(function(done){
            request.app.config.elasticsearch.esClient = esClient;
        });

        afterEach(function (done) {
            // delete all index
        });

        it('should transform correctly traces', function (done) {
            // parse input

            // fill DB
            /*
             app.esClient.index({
             index: '', // index
             type: '', // type
             id: '', // id
             body: '' // document
             }, function (error, response) {

             });
             */
            // apply transform
            var t = require('../../../bin/upgrade/transformers/elastic/transformToVersion2.js');
            async.waterfall([function (newCallback) {
                    newCallback(null, request.app.config);
                }, t.backup,
                    t.upgrade,
                    t.check],
                function (err, result) {
                    if (err) {
                        return logError(err, result);
                    }


                });
            // compare DB with output
        });
    });
};
