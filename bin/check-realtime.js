#!/usr/bin/env node
'use strict';

var request = require('request');


var trackingCode = '5732fccd536eb544004abfd4bk2kzj66lns714i';
var collectorHost = 'http://localhost:3000/api/proxy/gleaner/collector';

request.post(collectorHost + '/start/' + trackingCode, {
        json: true,
        headers: {
            Authorization: 'a:'
        }
    },
    function (err, httpResponse, body) {
        if (err || httpResponse.statusCode !== 200) {
            console.error(err);
            console.error(httpResponse.statusCode);
            console.log('Did not start the collection!');
            return process.exit(0);
        }

        console.log(body);
        var statement = {
            actor: {
                objectType: 'Agent',
                mbox: 'mailto:user@example.com',
                name: 'Project Tin Can API'
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/updated',
                display: {
                    'en-US': 'created'
                }
            },
            object: {
                id: 'http://example.adlnet.gov/xapi/example/testVar',
                definition: {
                    name: {
                        'en-US': 'simple statement'
                    },
                    description: {
                        'en-US': 'A simple Experience API statement. Note that the LRS does not need to have any prior ' +
                        'information about the Actor (learner), the verb, or the Activity/object.'
                    }
                }
            },
            result: {
                extensions: {
                    value: 'randomVariableValue'
                }
            }
        };
        var statement2 = {
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
                id: 'http:\/\/a2:3000\/api\/proxy\/gleaner\/games\/56a21ac020b8364200f67d84\/56a21ac020b8364200f67d85\/zone\/OOOOOOOOOProbandoZonaOOOOOOO',
                definition: {
                    extensions: {
                        versionId: 'testVersionId',
                        gameplayId: 'testGameplayId'
                    }
                }
            },
            result: {
                extensions: {
                    'http:\/\/purl.org\/xapi\/games\/ext\/value': ''
                }
            }
        };
        var statement3 = {
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
                id: 'http:\/\/a2:3000\/api\/proxy\/gleaner\/games\/56a21ac020b8364200f67d84\/56a21ac020b8364200f67d85\/screen\/MenuPrincipal',
                definition: {
                    extensions: {
                        versionId: 'testVersionId',
                        gameplayId: 'testGameplayId'
                    }
                }
            },
            result: {
                extensions: {
                    'http:\/\/purl.org\/xapi\/games\/ext\/value': ''
                }
            }
        };
        var statement4 = {
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
                id: 'http:\/\/a2:3000\/api\/proxy\/gleaner\/games\/56a21ac020b8364200f67d84\/56a21ac020b8364200f67d85\/choice\/AyudaraLucrecia',
                definition: {
                    extensions: {
                        versionId: 'testVersionId',
                        gameplayId: 'testGameplayId'
                    }
                }
            },
            result: {
                extensions: {
                    'http:\/\/purl.org\/xapi\/games\/ext\/value': 'No hacer nada'
                }
            }
        };
        var statement5 = {
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
                id: 'http:\/\/a2:3000\/api\/proxy\/gleaner\/games\/56a21ac020b8364200f67d84\/56a21ac020b8364200f67d85\/variable\/Cortesia',
                definition: {
                    extensions: {
                        versionId: 'testVersionId',
                        gameplayId: 'testGameplayId'
                    }
                }
            },
            result: {
                extensions: {
                    'http:\/\/purl.org\/xapi\/games\/ext\/value': '30'
                }
            }
        };

        request({
            uri: collectorHost + '/track',
            method: 'POST',
            body: [statement, statement2, statement3, statement4, statement5],
            json: true,
            headers: {
                Authorization: body.authToken
            }
        }, function (err, httpResponse, body) {
            if (err || httpResponse.statusCode !== 200) {
                console.error(err);
                console.error(httpResponse.statusCode);
                console.log('Did not track the statement!');
                return process.exit(0);
            }
            console.log(httpResponse.statusCode);

            console.log('Statements sent successfully.');

            process.exit(0);
        });
    });


