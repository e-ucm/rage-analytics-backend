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

    /** XAPI Profile Tests **/

    /*COMPLETABLE*/
    it('should correctly convert a Started (completable) statement', function (done) {

        var name = '57345599db69cf4200fa41d971088';
        var event = 'initialized';
        var target = 'testName';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
                name: name,
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
            name: name,
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

        var name = '57345599db69cf4200fa41d971088';
        var event = 'completed';
        var target = 'testName';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: name,
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
            name: name,
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

        var name = '57345599db69cf4200fa41d971088';
        var event = 'progressed';
        var target = 'testName';
        var progress = '0.5';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: name,
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
                    'org/xapi/progress': progress
                }
            },
            timestamp: timestamp
        };
        var resultTrace = {
            name: name,
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            progress: progress,
            success: false,
            completion: false,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    /*ALTERNATIVES*/
    it('should correctly convert a Selected (Alternative) statement', function (done) {

        var name = '57345599db69cf4200fa41d971088';
        var event = 'selected';
        var target = 'testName';
        var response = '123123testResponse';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: name,
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
            name: name,
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            response: response,
            success: false,
            completion: false,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    it('should correctly convert a Unlocked (Alternative) statement', function (done) {

        var name = '57345599db69cf4200fa41d971088';
        var event = 'unlocked';
        var target = 'testName';
        var response = 'test345345Response';
        var timestamp = '2016-05-16T11:48:25Z';
        var statement = {
            id: '6b6b0b18-c23c-4d3a-a039-5c5471370668',
            actor: {
                name: name,
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
            name: name,
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            event: event,
            target: target,
            response: response,
            success: false,
            completion: false,
            timestamp: timestamp
        };
        var trace = getRealtimeData(statement);
        should(trace).eql(resultTrace);

        done();
    });

    /*ACCESSIBLE*/
    it('should correctly convert an Accessed (ACCESSIBLE) statement', function (done) {

        var name = '57345599db69cf4200fa41d971088';
        var event = 'accessed';
        var target = 'testMenu';
        var timestamp = '2016-05-16T11:48:25Z';
        var type = 'testType';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
                name: name,
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
            name: name,
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

    it('should correctly convert a Skipped (ACCESSIBLE) statement', function (done) {

        var name = '57345599db69cf4200fa41d971088';
        var event = 'skipped';
        var target = 'testMenu';
        var timestamp = '2016-05-16T11:48:25Z';
        var type = 'testType';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
                name: name,
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
            name: name,
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
