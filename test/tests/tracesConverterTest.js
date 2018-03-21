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

    var tracesConverter = require('../../lib/tracesConverter');
    var getRealtimeData = tracesConverter;
    var definitionObj = {
        type: 'defType',
        extensions: {
            versionId: 'testVersionId',
            gameplayId: 'testGameplayId',
            session: 1,
            firstSessionStart: '2016-05-16T11:48:25Z',
            currentSessionStart: '2016-05-16T11:48:25Z'
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
            activityId: definitionObj.extensions.activityId,
            session: definitionObj.extensions.session,
            firstSessionStarted: definitionObj.extensions.firstSessionStarted,
            currentSessionStarted: definitionObj.extensions.currentSessionStarted,
            event: event,
            target: target,
            timestamp: timestamp,
            type: definitionObj.type
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        delete trace.uuidv4;
        should(result.error).eql(undefined);
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
            activityId: definitionObj.extensions.activityId,
            session: definitionObj.extensions.session,
            firstSessionStarted: definitionObj.extensions.firstSessionStarted,
            currentSessionStarted: definitionObj.extensions.currentSessionStarted,
            event: event,
            target: target,
            timestamp: timestamp,
            type: definitionObj.type
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        delete trace.uuidv4;
        should(result.error).eql(undefined);
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
            activityId: definitionObj.extensions.activityId,
            session: definitionObj.extensions.session,
            firstSessionStarted: definitionObj.extensions.firstSessionStarted,
            currentSessionStarted: definitionObj.extensions.currentSessionStarted,
            event: event,
            target: target,
            ext: {
                progress: progress
            },
            success: false,
            completion: false,
            timestamp: timestamp,
            type: definitionObj.type
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        delete trace.uuidv4;
        should(result.error).eql(undefined);
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
            activityId: definitionObj.extensions.activityId,
            session: definitionObj.extensions.session,
            firstSessionStarted: definitionObj.extensions.firstSessionStarted,
            currentSessionStarted: definitionObj.extensions.currentSessionStarted,
            event: event,
            target: target,
            response: response,
            success: false,
            completion: false,
            timestamp: timestamp,
            type: definitionObj.type
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        delete trace.uuidv4;
        should(result.error).eql(undefined);
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
            activityId: definitionObj.extensions.activityId,
            session: definitionObj.extensions.session,
            firstSessionStarted: definitionObj.extensions.firstSessionStarted,
            currentSessionStarted: definitionObj.extensions.currentSessionStarted,
            event: event,
            target: target,
            response: response,
            success: false,
            completion: false,
            timestamp: timestamp,
            type: definitionObj.type
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        delete trace.uuidv4;
        should(result.error).eql(undefined);
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
            activityId: definitionObj.extensions.activityId,
            session: definitionObj.extensions.session,
            firstSessionStarted: definitionObj.extensions.firstSessionStarted,
            currentSessionStarted: definitionObj.extensions.currentSessionStarted,
            event: event,
            target: target,
            type: type,
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        delete trace.uuidv4;
        should(result.error).eql(undefined);
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
            activityId: definitionObj.extensions.activityId,
            session: definitionObj.extensions.session,
            firstSessionStarted: definitionObj.extensions.firstSessionStarted,
            currentSessionStarted: definitionObj.extensions.currentSessionStarted,
            event: event,
            target: target,
            type: type,
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        delete trace.uuidv4;
        should(result.error).eql(undefined);
        should(trace).eql(resultTrace);

        done();
    });


    it('should correctly convert result.extensions to ext object', function (done) {

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
            result: {
                extensions: {
                    ext1: '123',
                    '/ext2': '456',
                    'asdasd/asdasd3': 0,
                    '23.423.4756/ext3': '411'
                }
            },
            timestamp: timestamp
        };
        var resultTrace = {
            name: name,
            versionId: definitionObj.extensions.versionId,
            gameplayId: definitionObj.extensions.gameplayId,
            activityId: definitionObj.extensions.activityId,
            session: definitionObj.extensions.session,
            firstSessionStarted: definitionObj.extensions.firstSessionStarted,
            currentSessionStarted: definitionObj.extensions.currentSessionStarted,
            event: event,
            target: target,
            type: type,
            timestamp: timestamp,
            ext: {
                ext1: '123',
                ext2: '456',
                asdasd3: 0,
                ext3: '411'
            }
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        delete trace.uuidv4;
        should(result.error).eql(undefined);
        should(trace).eql(resultTrace);

        done();
    });

    it('should not convert result.extensions ending with /', function (done) {

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
            result: {
                extensions: {
                    '23.423.4756/ext4//': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error).not.eql(undefined);
        should(trace).eql(undefined);

        done();
    });


    // Full Error Checking


    it('should not convert a statement with a missing actor', function (done) {

        var event = 'skipped';
        var target = 'testMenu';
        var timestamp = '2016-05-16T11:48:25Z';
        var type = 'testType';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
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
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Actor is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with a missing actor name', function (done) {

        var event = 'skipped';
        var target = 'testMenu';
        var timestamp = '2016-05-16T11:48:25Z';
        var type = 'testType';
        var statement = {
            id: '19de3bf2-6b7f-4399-a71b-da5f3674c8f8',
            actor: {
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
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Actor name is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with missing timestamp', function (done) {

        var name = 'testName';
        var event = 'skipped';
        var target = 'testMenu';
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
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            }
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Timestamp is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });


    it('should not convert a statement with a missing verb', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
        var target = 'testMenu';
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
            object: {
                id: 'http://example.com/games/SuperMarioBros/Screens/' + target,
                definition: {
                    extensions: definitionObj.extensions,
                    type: 'https://rage.e-ucm.es/xapi/seriousgames/activities/' + type
                }
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Verb is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });


    it('should not convert a statement with a missing verb id', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
        var target = 'testMenu';
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

            },
            object: {
                id: 'http://example.com/games/SuperMarioBros/Screens/' + target,
                definition: {
                    extensions: definitionObj.extensions,
                    type: 'https://rage.e-ucm.es/xapi/seriousgames/activities/' + type
                }
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Verb Id is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with a verb id ending with /', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
        var target = 'testMenu';
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
                id: 'http://...asddsfdg//'
            },
            object: {
                id: 'http://example.com/games/SuperMarioBros/Screens/' + target,
                definition: {
                    extensions: definitionObj.extensions,
                    type: 'https://rage.e-ucm.es/xapi/seriousgames/activities/' + type
                }
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Verb Id cannot end with / for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with a missing object', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
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
                id: 'http://.../asddsfdg'
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Object is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with a missing object id', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
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
                id: 'http://.../asddsfdg'
            },
            object: {
                definition: {
                    extensions: definitionObj.extensions,
                    type: 'https://rage.e-ucm.es/xapi/seriousgames/activities/' + type
                }
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Object Id is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with an object id ending with /', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
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
                id: 'http://.../asddsfdg'
            },
            object: {
                id: 'http://..objectId/',
                definition: {
                    extensions: definitionObj.extensions,
                    type: 'https://rage.e-ucm.es/xapi/seriousgames/activities/' + type
                }
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Object Id cannot end with / for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });


    it('should not convert a statement with a missing object definition', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
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
                id: 'http://.../asddsfdg'
            },
            object: {
                id: 'http://../objectId'
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Object definition is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with a missing object definition type', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
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
                id: 'http://.../asddsfdg'
            },
            object: {
                id: 'http://../objectId',
                definition: {

                }
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Object definition type is missing for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with an object definition type ending with /', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
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
                id: 'http://.../asddsfdg'
            },
            object: {
                id: 'http://../objectId',
                definition: {
                    type: 'http://.../objectDefinitionType//'
                }
            },
            result: {
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Object definition type cannot end with / for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with a result score raw value missing', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
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
                id: 'http://.../asddsfdg'
            },
            object: {
                id: 'http://../objectId',
                definition: {
                    type: 'http://.../objectDefinitionType'
                }
            },
            result: {
                score: {

                },
                extensions: {
                    '23.423.4756/ext4': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Result.score.raw should not be undefined or null for statement, ' + statement);
        should(trace).eql(undefined);

        done();
    });

    it('should not convert a statement with a result score raw value missing', function (done) {

        var timestamp = '2016-05-16T11:48:25Z';
        var name = 'testName';
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
                id: 'http://.../asddsfdg'
            },
            object: {
                id: 'http://../objectId',
                definition: {
                    type: 'http://.../objectDefinitionType'
                }
            },
            result: {
                score: {
                    raw: 3
                },
                extensions: {
                    '23.423.4756/ext4/': '434'
                }
            },
            timestamp: timestamp
        };
        var result = getRealtimeData(statement);
        var trace = result.trace;
        should(result.error.message).eql('Extension 23.423.4756/ext4/ cannot end with / for result, ' + statement.result);
        should(trace).eql(undefined);

        done();
    });
});
