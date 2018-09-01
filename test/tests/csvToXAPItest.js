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

describe('CSV to xAPI tests', function () {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var csvToXAPI = require('../../lib/csvToXAPI');
    var fs = require('fs');
    var definitionObj = [{
        actor: {
            account: {
                homePage: 'http://localhost:3000/',
                name: 'offline'
            },
            name: 'XJIR'
        },
        object: {
            definition: {
                type: 'https://w3id.org/xapi/seriousgames/activity-types/level'
            },
            id: 'https://w3id.org/xapi/adb/objectid/A\r'
        },
        timestamp: '2018-04-13T09:17:37.499Z',
        verb: {
            id: 'https://w3id.org/xapi/adb/verbs/initialized'
        }
    },
        {
            actor: {
                account: {
                    homePage: 'http://localhost:3000/',
                    name: 'offline'
                },
                name: 'KVDC'
            },
            object: {
                definition: {
                    type: 'https://w3id.org/xapi/seriousgames/activity-types/level'
                },
                id: 'https://w3id.org/xapi/adb/objectid/A\r'
            },
            timestamp: '2018-04-13T09:17:37.500Z',
            verb: {
                id: 'https://w3id.org/xapi/adb/verbs/initialized'
            }
        },
        {
            timestamp: '2018-04-13T09:17:37.510Z',
            actor: {
                account: {homePage: 'http://localhost:3000/', name: 'offline'},
                name: 'XJIR'
            },
            verb: {id: 'http://adlnet.gov/expapi/verbs/interacted'},
            object: {
                id: 'https://w3id.org/xapi/adb/objectid/15Objects-A',
                definition: {
                    type: 'https://w3id.org/xapi/seriousgames/activity-types/game-object'
                }
            },
            result: {extensions: {Bombilla: 1}}
        },
        {
            timestamp: '2018-04-13T09:17:37.623Z',
            actor: {
                account: {homePage: 'http://localhost:3000/', name: 'offline'},
                name: 'KVDC'
            },
            verb: {id: 'https://w3id.org/xapi/adb/verbs/selected'},
            object: {
                id: 'https://w3id.org/xapi/adb/objectid/A',
                definition: {
                    type: 'https://w3id.org/xapi/seriousgames/activity-types/alternative'
                }
            },
            result: {
                success: true,
                response: 'bombilla',
                extensions: {
                    mappings_Bombilla: ' bombilla',
                    targets: 'Bombilla=true',
                    bombilla: 802,
                    'object-changed': 0,
                    correct: 1
                }
            }
        },
        {
            timestamp: '2018-04-13T09:17:37.728Z',
            actor: {
                account: {homePage: 'http://localhost:3000/', name: 'offline'},
                name: 'XJIR'
            },
            verb: {id: 'http://adlnet.gov/expapi/verbs/interacted'},
            object: {
                id: 'https://w3id.org/xapi/adb/objectid/15Objects-A',
                definition: {
                    type: 'https://w3id.org/xapi/seriousgames/activity-types/game-object'
                }
            },
            result: {extensions: {Bombilla: 1}}
        },
        {
            timestamp: '2018-04-13T09:17:37.825Z',
            actor: {
                account: {homePage: 'http://localhost:3000/', name: 'offline'},
                name: 'KVDC'
            },
            verb: {id: 'https://w3id.org/xapi/adb/verbs/selected'},
            object: {
                id: 'https://w3id.org/xapi/adb/objectid/A',
                definition: {
                    type: 'https://w3id.org/xapi/seriousgames/activity-types/alternative'
                }
            },
            result: {
                success: false,
                response: 'pipa',
                extensions: {
                    mappings_Bombilla: 0,
                    targets: 'Bombilla=false',
                    'object-changed': 0,
                    correct: 0
                }
            }
        }];


    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    /** XAPI Profile Tests **/

    /*COMPLETABLE*/
    it('should correctly convert a traces', function (done) {

        var offlinetraces = fs.readFileSync('./test/resources/offlinetraces.csv', 'utf8');

        var lines = offlinetraces.split('\n');

        for (var i = 0; i < lines.length; i++) {
            var csvtrace = lines[i];
            var statement = csvToXAPI(csvtrace).statement;

            should(statement).eql(definitionObj[i]);
        }

        done();
    });
});
