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

describe('Traces converter tests', function () {

    var getRealtimeData = require('../../lib/tracesConverter');
    var definitionObj = {
        extensions: {
            versionId: 'testVersionId',
            gameplayId: 'testGameplayId'
        }
    };

    it('should correctly convert a ZONE statement', function (done) {

        var zoneName = 'TestingZone-5827';
        var statement = {
            timestamp: '2016-01-22T14:11:22.798Z',
            actor: {
                name: '56a2388d20b8364200f67d9c67412',
                account: {
                    homePage: 'http:\/\/a2:3000\/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http:\/\/purl.org\/xapi\/games\/verbs\/entered'
            },
            object: {
                id: 'http:\/\/a2:3000\/api\/proxy\/gleaner\/games\/56a21ac020b8364200f67d84\/56a21ac020b8364200f67d85\/zone\/' + zoneName,
                definition: definitionObj
            },
            result: {
                extensions: {
                    'http:\/\/purl.org\/xapi\/games\/ext\/value': ''
                }
            }
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: 'zone',
            value: zoneName
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });


    it('should correctly convert a SCREEN statement', function (done) {

        var screenName = 'MainMenu-2';
        var statement = {
            timestamp: '2016-01-22T14:11:22.796Z',
            actor: {
                name: '56a2388d20b8364200f67d9c67412',
                account: {
                    homePage: 'http:\/\/a2:3000\/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http:\/\/purl.org\/xapi\/games\/verbs\/viewed'
            },
            object: {
                id: 'http:\/\/a2:3000\/api\/proxy\/gleaner\/games\/56a21ac020b8364200f67d84\/56a21ac020b8364200f67d85\/screen\/' + screenName,
                definition: definitionObj
            },
            result: {
                extensions: {
                    'http:\/\/purl.org\/xapi\/games\/ext\/value': ''
                }
            }
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: 'screen',
            value: screenName
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    it('should correctly convert a CHOICE statement', function (done) {

        var choiceName = 'HelpMenuLoginQuestion';
        var choiceValue = 'Option 2 - LogIn using Twitter';
        var statement = {
            timestamp: '2016-01-22T14:33:34.352Z',
            actor: {
                name: '56a23d8420b8364200f67d9f79692',
                account: {
                    homePage: 'http:\/\/a2:3000\/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http:\/\/purl.org\/xapi\/games\/verbs\/choose'
            },
            object: {
                id: 'http:\/\/a2:3000\/api\/proxy\/gleaner\/games\/56a21ac020b8364200f67d84\/56a21ac020b8364200f67d85\/choice\/' + choiceName,
                definition: definitionObj
            },
            result: {
                extensions: {
                    'http:\/\/purl.org\/xapi\/games\/ext\/value': choiceValue
                }
            }
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: 'choice',
            target: choiceName,
            value: choiceValue
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });


    it('should correctly convert a VAR statement', function (done) {

        var varName = 'myTestVar-321';
        var varValue = '30';
        var statement = {
            timestamp: '2016-01-22T14:33:34.346Z',
            actor: {
                name: '56a23d8420b8364200f67d9f79692',
                account: {
                    homePage: 'http:\/\/a2:3000\/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http:\/\/purl.org\/xapi\/games\/verbs\/updated'
            },
            object: {
                id: 'http:\/\/a2:3000\/api\/proxy\/gleaner\/games\/56a21ac020b8364200f67d84\/56a21ac020b8364200f67d85\/variable\/' + varName,
                definition: definitionObj
            },
            result: {
                extensions: {
                    'http:\/\/purl.org\/xapi\/games\/ext\/value': varValue
                }
            }
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: 'var',
            target: varName,
            value: varValue
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });
});
