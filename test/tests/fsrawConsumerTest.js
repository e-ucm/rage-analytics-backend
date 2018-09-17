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


module.exports = function (config) {
    var fsrawConsumer = require('../../lib/consumers/fsraw')(config.rawTracesFolder);
    var fs = require('fs');
    describe('File System Raw Consumer Test', function () {


        it('should append correctly to the player Id file', function (done) {
            var playerId = 'p1';
            var versionId = 'v1', gameplayId = 'g1', data = ['s1'], convertedData = ['cd1'];
            try {
                fs.unlinkSync(config.rawTracesFolder + '/' + playerId);
            } catch (ex) {
                console.error('Error unlinking: ', ex);
            }
            fsrawConsumer.addTraces(playerId, versionId, gameplayId, null, data, convertedData)
                .then(function () {
                    var line = fs.readFileSync(config.rawTracesFolder + '/' + playerId, 'utf-8');
                    var parsed = JSON.parse(line);
                    should(parsed.received).be.a.String();
                    should(parsed.statements).eql(data);
                    should(parsed.converted).eql(convertedData);
                    done();
                }).fail(function (err) {
                done(err);
            });
        });

    });
};
