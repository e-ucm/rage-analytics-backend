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
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            timestamp: timestamp,
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
            value: zoneName,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });


    it('should correctly convert a SCREEN statement', function (done) {

        var screenName = 'MainMenu-2';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            timestamp: timestamp,
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
            value: screenName,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    it('should correctly convert a CHOICE statement', function (done) {

        var choiceName = 'HelpMenuLoginQuestion';
        var choiceValue = 'Option 2 - LogIn using Twitter';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            timestamp: timestamp,
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
            value: choiceValue,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });


    it('should correctly convert a VAR statement', function (done) {

        var varName = 'myTestVar-321';
        var varValue = '30';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            timestamp: timestamp,
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
            value: varValue,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    /** XAPI Profile Tests **/

    /*COMPLETABLE*/
    it('should correctly convert a Started (completable) statement', function (done) {

        var event = 'started';
        var target = 'testName';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
                name: '5739973ddb69cf4200fa41e274162',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'https://w3id.org/xapi/seriousgames/verbs/' + event
            },
            object: {
                id: 'http://a2:3000/api/proxy/gleaner/games/571f26b6ee07f74200512728/571f26b6ee07f74200512729/completables/' + target,
                definition: definitionObj
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    it('should correctly convert a Completed (completable) statement', function (done) {

        var event = 'completed';
        var target = 'testName';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: '57345599db69cf4200fa41d971088',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/' + event
            },
            object: {
                id: 'http://a2:3000/api/proxy/gleaner/games/571f26b6ee07f74200512728/571f26b6ee07f74200512729/completables/' + target,
                definition: definitionObj
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    it('should correctly convert a Progressed (completable) statement', function (done) {

        var event = 'progressed';
        var target = 'testName';
        var progress = '0.5';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: '57345599db69cf4200fa41d971088',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/' + event
            },
            object: {
                id: 'http://a2:3000/api/proxy/gleaner/games/571f26b6ee07f74200512728/571f26b6ee07f74200512729/completables/' + target,
                definition: definitionObj
            },
            result: {
                success: false,
                completion: false,
                extensions: {
                    'https://w3id.org/xapi/seriousgames/extensions/progress': progress
                }
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            progress: progress,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    /*VARIABLE*/
    it('should correctly convert a Set (Variable) statement', function (done) {

        var event = 'set';
        var target = 'testName';
        var value = 'testValue';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
                name: '5739973ddb69cf4200fa41e274162',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'https://w3id.org/xapi/seriousgames/verbs/' + event
            },
            object: {
                id: 'http://a2:3000/api/proxy/gleaner/games/571f26b6ee07f74200512728/571f26b6ee07f74200512729/variable/' + target,
                definition: definitionObj
            },
            result: {
                success: false,
                completion: false,
                extensions: {
                    'http://rage-eu.com/xapi/extensions/value': value
                }
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event:  event,
            target: target,
            value: value,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    it('should correctly convert an Increased (Variable) statement', function (done) {

        var event = 'increased';
        var target = 'testName';
        var value = 'testValue';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: '57345599db69cf4200fa41d971088',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/' + event
            },
            object: {
                id: 'http://a2:3000/api/proxy/gleaner/games/571f26b6ee07f74200512728/571f26b6ee07f74200512729/completables/' + target,
                definition: definitionObj
            },
            result: {
                success: false,
                completion: false,
                extensions: {
                    'http://rage-eu.com/xapi/extensions/value': value
                }
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            value: value,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    it('should correctly convert a Decreased (Variable) statement', function (done) {

        var event = 'decreased';
        var target = 'testName';
        var value = '0.5';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: '57345599db69cf4200fa41d971088',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/' + event
            },
            object: {
                id: 'http://a2:3000/api/proxy/gleaner/games/571f26b6ee07f74200512728/571f26b6ee07f74200512729/completables/' + target,
                definition: definitionObj
            },
            result: {
                success: false,
                completion: false,
                extensions: {
                    'http://rage-eu.com/xapi/extensions/value': value
                }
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            value: value,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    /*ALTERNATIVES*/
    it('should correctly convert a Preferred (Alternative) statement', function (done) {

        var event = 'preferred';
        var target = 'testName';
        var response = 'testResponse';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: '57345599db69cf4200fa41d971088',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/' + event
            },
            object: {
                id: 'http://a2:3000/api/proxy/gleaner/games/571f26b6ee07f74200512728/571f26b6ee07f74200512729/alternative/' + target,
                definition: definitionObj
            },
            result: {
                success: false,
                completion: false,
                response: response
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            response: response,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    /*REACHABLE*/
    it('should correctly convert an Accessed (Reachable) statement', function (done) {

        var event = 'access';
        var target = 'testMenu';
        var timestamp = '2016-05-16T11:48:25Z';
        var type = 'testType';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
                name: '5739973ddb69cf4200fa41e274162',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http://activitystrea.ms/schema/1.0/' + event
            },
            object: {
                id: 'http://example.com/games/SuperMarioBros/Screens/' + target,
                definition: {
                    extensions: definitionObj.extensions,
                    type: 'https://rage.e-ucm.es/xapi/seriousgames/activities/' + type
                }
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            type: type,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    it('should correctly convert a Skipped (Reachable) statement', function (done) {

        var event = 'skipped';
        var target = 'testMenu';
        var timestamp = '2016-05-16T11:48:25Z';
        var type = 'testType';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
                name: '5739973ddb69cf4200fa41e274162',
                account: {
                    homePage: 'http://a2:3000/',
                    name: 'Anonymous'
                }
            },
            verb: {
                id: 'http://id.tincanapi.com/verb/' + event
            },
            object: {
                id: 'http://example.com/games/SuperMarioBros/Screens/' + target,
                definition: {
                    extensions: definitionObj.extensions,
                    type: 'https://rage.e-ucm.es/xapi/seriousgames/activities/' + type
                }
            },
            timestamp: timestamp
        };
        var resultTrace = {
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            type: type,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });
});
