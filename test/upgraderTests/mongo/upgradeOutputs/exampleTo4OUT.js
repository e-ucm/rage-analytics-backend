// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

var ObjectID = require('mongodb').ObjectID;

module.exports = {
    games: [
        {
            _id: ObjectID('5a955ddc52031c0081395c33'),
            title: 'test',
            created: new Date('2018-02-27T13:32:12.185Z'),
            authors: [
                'dev2'
            ],
            public: false,
            developers: [
                'dev2'
            ],
            deleted: false
        },
        {
            _id: ObjectID('5a959b29ca50e50077dec85d'),
            title: 'd1',
            created: new Date('2018-02-27T17:53:45.468Z'),
            authors: [
                'd1'
            ],
            public: true,
            developers: [
                'd1'
            ],
            deleted: false
        }
    ],
    classes: [
        {
            _id: ObjectID('5a26cb78c8b102008b41472c'),
            name: 'c1',
            created: new Date('2017-12-05T16:38:16.556Z'),
            groups: [],
            groupings: [],
            participants: {
                teachers: [
                    't'
                ],
                students: [ ]
            }
        },
        {
            _id: ObjectID('5a2ff6bac8b102008b41474b'),
            name: 'SM_IES EuropaTeachers',
            created: new Date('2017-12-12T15:33:14.500Z'),
            groups: [],
            groupings: [],
            participants: {
                teachers: [
                    'game_tea'
                ],
                students: [
                    'pphu',
                    'aieb',
                    'kqrv',
                    'cyvs',
                    'bvze',
                    'otkn',
                    'okbh',
                    'rznz',
                    'szbp',
                    'gphg'
                ]
            }
        }

    ],
    activities: [
        {
            _id: ObjectID('595badad370740006dc1ab80'),
            gameId: ObjectID('5a955ddc52031c0081395c33'),
            versionId: ObjectID('59315d0d370740006dc1a7b7'),
            classId: ObjectID('5a2ff6bac8b102008b41474b'),
            name: 'g1c1s1',
            allowAnonymous: false,
            groups: [],
            groupings: [],
            created: new Date('2018-01-29T17:23:06.227Z'),
            start: new Date('2018-01-30T12:32:50.185Z'),
            end: new Date('2018-01-30T13:20:23.621Z'),
            open: false,
            visible: true
        },
        {
            _id: ObjectID('595badbe370740006dc1ab81'),
            gameId: ObjectID('5a959b29ca50e50077dec85d'),
            versionId: ObjectID('59315d0d370740006dc1a7b7'),
            classId: ObjectID('5a26cb78c8b102008b41472c'),
            name: 'g1c1s2',
            allowAnonymous: true,
            groups: [],
            groupings: [],
            created: new Date('2017-12-01T18:34:00.394Z'),
            start: new Date('2017-12-04T17:06:28.507Z'),
            end: null,
            open: true,
            visible: true
        }
    ],
    versions: [
        {
            _id: ObjectID('5a14760fffce74008bddcabc'),
            gameId: ObjectID('5a14760fffce74008bddcabb'),
            trackingCode: '5a14760fffce74008bddcabcfb1gtsm6sif'
        },
        {
            _id: ObjectID('5a16cc69bfc960008bc5e079'),
            gameId: ObjectID('5a16cc69bfc960008bc5e078'),
            trackingCode: '5a16cc69bfc960008bc5e0798uh4l2i29o5'
        },
        {
            _id: ObjectID('5a959b29ca50e50077dec85e'),
            gameId: ObjectID('5a959b29ca50e50077dec85d'),
            trackingCode: '5a959b29ca50e50077dec85efylibxtuepi'
        }
    ],
    authtokens: [
        {
            _id: ObjectID('5a1577dfbfc960008bc5e059'),
            authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058787872071',
            gameplayId: ObjectID('5a1577dfbfc960008bc5e058'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 1,
            playerId: ObjectID('5a1577dfbfc960008bc5e057'),
            lastAccessed: new Date('2017-11-22T13:13:03.179z'),
            firstSessionStarted: new Date('2017-11-22T13:13:03.179z'),
            currentSessionStarted: new Date('2017-11-22T13:13:03.179z')
        },
        {
            _id: ObjectID('5a1579debfc960008bc5e05a'),
            authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058628466332',
            gameplayId: ObjectID('5a1577dfbfc960008bc5e058'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 2,
            playerId: ObjectID('5a1577dfbfc960008bc5e057'),
            lastAccessed: new Date('2017-11-22T14:16:59.066z'),
            firstSessionStarted: new Date('2017-11-22T13:13:03.179z'),
            currentSessionStarted: new Date('2017-11-22T13:21:34.131z')
        },
        {
            _id: ObjectID('5a15972abfc960008bc5e05b'),
            authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058369114523',
            gameplayId: ObjectID('5a1577dfbfc960008bc5e058'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 3,
            playerId: ObjectID('5a1577dfbfc960008bc5e057'),
            lastAccessed: new Date('2017-11-22T15:26:40.300z'),
            firstSessionStarted: new Date('2017-11-22T13:13:03.179z'),
            currentSessionStarted: new Date('2017-11-22T15:26:34.216z')
        },
        {
            _id: ObjectID('5a15978bbfc960008bc5e05c'),
            authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058085793924',
            gameplayId: ObjectID('5a1577dfbfc960008bc5e058'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 4,
            playerId: ObjectID('5a1577dfbfc960008bc5e057'),
            lastAccessed: new Date('2017-11-22T15:28:15.826z'),
            firstSessionStarted: new Date('2017-11-22T13:13:03.179z'),
            currentSessionStarted: new Date('2017-11-22T15:28:11.611z')
        },
        {
            _id: ObjectID('5a159899bfc960008bc5e05d'),
            authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e0587079993275',
            gameplayId: ObjectID('5a1577dfbfc960008bc5e058'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 5,
            playerId: ObjectID('5a1577dfbfc960008bc5e057'),
            lastAccessed: new Date('2017-11-22T15:32:41.882z'),
            firstSessionStarted: new Date('2017-11-22T13:13:03.179z'),
            currentSessionStarted: new Date('2017-11-22T15:32:41.882z')
        },
        {
            _id: ObjectID('5a15b1cebfc960008bc5e05e'),
            authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058987391846',
            gameplayId: ObjectID('5a1577dfbfc960008bc5e058'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 6,
            playerId: ObjectID('5a1577dfbfc960008bc5e057'),
            lastAccessed: new Date('2017-11-22T17:21:37.947z'),
            firstSessionStarted: new Date('2017-11-22T13:13:03.179z'),
            currentSessionStarted: new Date('2017-11-22T17:20:14.856z')
        },
        {
            _id: ObjectID('5a15b7c4bfc960008bc5e05f'),
            authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e05864294149987',
            gameplayId: ObjectID('5a1577dfbfc960008bc5e058'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 7,
            playerId: ObjectID('5a1577dfbfc960008bc5e057'),
            lastAccessed: new Date('2017-11-22T17:51:21.165z'),
            firstSessionStarted: new Date('2017-11-22T13:13:03.179z'),
            currentSessionStarted: new Date('2017-11-22T17:45:40.084z')
        },
        {
            _id: ObjectID('5a15ba69bfc960008bc5e062'),
            authToken: '5a14760fffce74008bddcabc5a15ba69bfc960008bc5e06124144021',
            gameplayId: ObjectID('5a15ba69bfc960008bc5e061'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 1,
            playerId: ObjectID('5a15ba69bfc960008bc5e060'),
            lastAccessed: new Date('2017-11-22T18:06:39.232z'),
            firstSessionStarted: new Date('2017-11-22T17:56:57.555z'),
            currentSessionStarted: new Date('2017-11-22T17:56:57.555z')
        },
        {
            _id: ObjectID('5a15c835bfc960008bc5e063'),
            authToken: '5a14760fffce74008bddcabc5a15ba69bfc960008bc5e061680051772',
            gameplayId: ObjectID('5a15ba69bfc960008bc5e061'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 2,
            playerId: ObjectID('5a15ba69bfc960008bc5e060'),
            lastAccessed: new Date('2017-11-22T19:02:32.405z'),
            firstSessionStarted: new Date('2017-11-22T17:56:57.555z'),
            currentSessionStarted: new Date('2017-11-22T18:55:49.882z')
        },
        {
            _id: ObjectID('5a15cbabbfc960008bc5e064'),
            authToken: '5a14760fffce74008bddcabc5a15ba69bfc960008bc5e0619913684383',
            gameplayId: ObjectID('5a15ba69bfc960008bc5e061'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 3,
            playerId: ObjectID('5a15ba69bfc960008bc5e060'),
            lastAccessed: new Date('2017-11-22T19:13:44.682z'),
            firstSessionStarted: new Date('2017-11-22T17:56:57.555z'),
            currentSessionStarted: new Date('2017-11-22T19:10:35.339z')
        },
        {
            _id: ObjectID('5a16be3fbfc960008bc5e067'),
            authToken: '5a14760fffce74008bddcabc5a15ba69bfc960008bc5e061068634744',
            gameplayId: ObjectID('5a15ba69bfc960008bc5e061'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 4,
            playerId: ObjectID('5a15ba69bfc960008bc5e060'),
            lastAccessed: new Date('2017-11-23T12:27:11.918z'),
            firstSessionStarted: new Date('2017-11-22T17:56:57.555z'),
            currentSessionStarted: new Date('2017-11-23T12:25:35.874z')
        },
        {
            _id: ObjectID('5a16bef6bfc960008bc5e06a'),
            authToken: '5a14760fffce74008bddcabc5a16bef6bfc960008bc5e0696990773231',
            gameplayId: ObjectID('5a16bef6bfc960008bc5e069'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 1,
            playerId: ObjectID('5a16bef6bfc960008bc5e068'),
            lastAccessed: new Date('2017-11-23T12:30:13z'),
            firstSessionStarted: new Date('2017-11-23T12:28:38.468z'),
            currentSessionStarted: new Date('2017-11-23T12:28:38.468z')
        },
        {
            _id: ObjectID('5a16bf71bfc960008bc5e06b'),
            authToken: '5a14760fffce74008bddcabc5a16bef6bfc960008bc5e0693330362652',
            gameplayId: ObjectID('5a16bef6bfc960008bc5e069'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 2,
            playerId: ObjectID('5a16bef6bfc960008bc5e068'),
            lastAccessed: new Date('2017-11-23T12:31:02.043z'),
            firstSessionStarted: new Date('2017-11-23T12:28:38.468z'),
            currentSessionStarted: new Date('2017-11-23T12:30:41.987z')
        },
        {
            _id: ObjectID('5a16c196bfc960008bc5e06c'),
            authToken: '5a14760fffce74008bddcabc5a16bef6bfc960008bc5e069262637553',
            gameplayId: ObjectID('5a16bef6bfc960008bc5e069'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 3,
            playerId: ObjectID('5a16bef6bfc960008bc5e068'),
            lastAccessed: new Date('2017-11-23T12:40:06.791z'),
            firstSessionStarted: new Date('2017-11-23T12:28:38.468z'),
            currentSessionStarted: new Date('2017-11-23T12:39:50.074z')
        },
        {
            _id: ObjectID('5a16c1c1bfc960008bc5e06f'),
            authToken: '5a14760fffce74008bddcabc5a16c1c1bfc960008bc5e06e459872271',
            gameplayId: ObjectID('5a16c1c1bfc960008bc5e06e'),
            versionId: ObjectID('5a14760fffce74008bddcabc'),
            session: 1,
            playerId: ObjectID('5a16c1c1bfc960008bc5e06d'),
            lastAccessed: new Date('2017-11-23T12:40:42.969z'),
            firstSessionStarted: new Date('2017-11-23T12:40:33.924z'),
            currentSessionStarted: new Date('2017-11-23T12:40:33.924z')
        },
        {
            _id: ObjectID('5a16c9f9bfc960008bc5e076'),
            authToken: '5a16c726bfc960008bc5e0715a16c9f9bfc960008bc5e07509614651',
            gameplayId: ObjectID('5a16c9f9bfc960008bc5e075'),
            versionId: ObjectID('5a16c726bfc960008bc5e071'),
            session: 1,
            playerId: ObjectID('5a16c9f8bfc960008bc5e074'),
            lastAccessed: new Date('2017-11-23T13:16:30.592z'),
            firstSessionStarted: new Date('2017-11-23T13:15:37.002z'),
            currentSessionStarted: new Date('2017-11-23T13:15:37.002z')
        },
        {
            _id: ObjectID('5a16ca96bfc960008bc5e077'),
            authToken: '5a16c726bfc960008bc5e0715a16c9f9bfc960008bc5e0752084193272',
            gameplayId: ObjectID('5a16c9f9bfc960008bc5e075'),
            versionId: ObjectID('5a16c726bfc960008bc5e071'),
            session: 2,
            playerId: ObjectID('5a16c9f8bfc960008bc5e074'),
            lastAccessed: new Date('2017-11-23T13:21:09.051z'),
            firstSessionStarted: new Date('2017-11-23T13:15:37.002z'),
            currentSessionStarted: new Date('2017-11-23T13:18:14.390z')
        },
        {
            _id: ObjectID('5a16cf03bfc960008bc5e07e'),
            authToken: '5a16cc69bfc960008bc5e0795a16cf03bfc960008bc5e07d616289851',
            gameplayId: ObjectID('5a16cf03bfc960008bc5e07d'),
            versionId: ObjectID('5a16cc69bfc960008bc5e079'),
            session: 1,
            playerId: ObjectID('5a16cf03bfc960008bc5e07c'),
            lastAccessed: new Date('2017-11-23T13:39:38.055z'),
            firstSessionStarted: new Date('2017-11-23T13:37:07.384z'),
            currentSessionStarted: new Date('2017-11-23T13:37:07.384z')
        },
        {
            _id: ObjectID('5a16f39fbfc960008bc5e081'),
            authToken: '5a16cc69bfc960008bc5e0795a16f39fbfc960008bc5e080329850051',
            gameplayId: ObjectID('5a16f39fbfc960008bc5e080'),
            versionId: ObjectID('5a16cc69bfc960008bc5e079'),
            session: 1,
            playerId: ObjectID('5a16f39fbfc960008bc5e07f'),
            lastAccessed: new Date('2017-11-23T16:26:00.730z'),
            firstSessionStarted: new Date('2017-11-23T16:13:19.888z'),
            currentSessionStarted: new Date('2017-11-23T16:13:19.888z')
        },
        {
            _id: ObjectID('5a16f3a3bfc960008bc5e084'),
            authToken: '5a16cc69bfc960008bc5e0795a16f3a3bfc960008bc5e0838916352941',
            gameplayId: ObjectID('5a16f3a3bfc960008bc5e083'),
            versionId: ObjectID('5a16cc69bfc960008bc5e079'),
            session: 1,
            playerId: ObjectID('5a16f3a3bfc960008bc5e082'),
            lastAccessed: new Date('2017-11-23T16:29:29.811z'),
            firstSessionStarted: new Date('2017-11-23T16:13:23.416z'),
            currentSessionStarted: new Date('2017-11-23T16:13:23.416z')
        }
    ],
    players: [
        {
            _id: ObjectID('5a1577dfbfc960008bc5e057'),
            name: 'qeee',
            type: 'identified',
            animalName: 'prochurch-sophisticated-pekingese',
            versions: [ObjectID('5a14760fffce74008bddcabc')],
            activities: []
        },
        {
            _id: ObjectID('5a15ba69bfc960008bc5e060'),
            name: 'fdpo',
            type: 'identified',
            animalName: 'chromium-lovesome-rook',
            versions: [ObjectID('5a14760fffce74008bddcabc')],
            activities: []
        },
        {
            _id: ObjectID('5a16bef6bfc960008bc5e068'),
            name: 'kzkx',
            type: 'identified',
            animalName: 'climactic-overparticular-apisdorsatalaboriosa',
            versions: [ObjectID('5a14760fffce74008bddcabc')],
            activities: []
        },
        {
            _id: ObjectID('5a16c1c1bfc960008bc5e06d'),
            name: 'blao',
            type: 'identified',
            animalName: 'duckie-silken-lynx',
            versions: [ObjectID('5a14760fffce74008bddcabc')],
            activities: []
        },
        {
            _id: ObjectID('5a16c9f8bfc960008bc5e074'),
            name: 'onzt',
            type: 'identified',
            animalName: 'bigboned-doctorial-bug',
            versions: [ObjectID('5a16c726bfc960008bc5e071')],
            activities: []
        },
        {
            _id: ObjectID('5a16cf03bfc960008bc5e07c'),
            name: 'sbgg',
            type: 'identified',
            animalName: 'ideal-rustic-llama',
            versions: [ObjectID('5a16cc69bfc960008bc5e079')],
            activities: []
        },
        {
            _id: ObjectID('5a16f39fbfc960008bc5e07f'),
            name: 'zwtp',
            type: 'identified',
            animalName: 'scorpioid-obsequious-arawana',
            versions: [ObjectID('5a16cc69bfc960008bc5e079')],
            activities: []
        },
        {
            _id: ObjectID('5a16f3a3bfc960008bc5e082'),
            name: 'rixp',
            type: 'identified',
            animalName: 'encyclopaedic-lithophilic-danishswedishfarmdog',
            versions: [ObjectID('5a16cc69bfc960008bc5e079')],
            activities: []
        },
        {
            _id: ObjectID('5a16f3abbfc960008bc5e085'),
            name: 'vakl',
            type: 'identified',
            animalName: 'leathery-porky-terrier',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3abbfc960008bc5e088'),
            name: 'pjke',
            type: 'identified',
            animalName: 'factional-englacial-egg',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3abbfc960008bc5e08b'),
            name: 'fmks',
            type: 'identified',
            animalName: 'unmetallurgic-palish-armadillo',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3acbfc960008bc5e08e'),
            name: 'pktd',
            type: 'identified',
            animalName: 'freeborn-scaly-pilchard',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3adbfc960008bc5e091'),
            name: 'zaiu',
            type: 'identified',
            animalName: 'disproportional-displaceable-dromaeosaur',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3afbfc960008bc5e094'),
            name: 'ojci',
            type: 'identified',
            animalName: 'barbaric-premonarchical-cobra',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3b7bfc960008bc5e097'),
            name: 'mtsq',
            type: 'identified',
            animalName: 'unthanking-choppy-easternnewt',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3bcbfc960008bc5e09a'),
            name: 'kptk',
            type: 'identified',
            animalName: 'halfboiled-coercionary-velvetworm',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3bcbfc960008bc5e09d'),
            name: 'oiig',
            type: 'identified',
            animalName: 'cryptographical-dusty-virginiaopossum',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a16f3bcbfc960008bc5e09e'),
            name: 'huyo',
            type: 'identified',
            animalName: 'noncrystallising-potbellied-tasmaniantiger',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a1c403fce1a660081c86327'),
            name: 'szhn',
            type: 'identified',
            animalName: 'relaxed-unfortunate-adouri',
            versions: [],
            activities: []
        },
        {
            _id: ObjectID('5a1daa77ce1a660081c8632f'),
            name: '5a1daa77ce1a660081c8632f15511',
            type: 'anonymous',
            animalName: 'unwholesome-stuck-africanfisheagle',
            versions: [],
            activities: []
        }
    ],
    gameplays_5a16cc69bfc960008bc5e079: [
        {
            _id: ObjectID('5a16cf03bfc960008bc5e07d'),
            playerId: ObjectID('5a16cf03bfc960008bc5e07c'),
            playerName: 'sbgg',
            playerType: 'identified',
            animalName: 'ideal-rustic-llama',
            sessions: 1,
            firstSessionStarted: new Date('2017-11-23T13:37:07.384z'),
            attempts: [
                {
                    number: 1,
                    authToken: '5a16cc69bfc960008bc5e0795a16cf03bfc960008bc5e07d616289851',
                    start: new Date('2017-11-23T13:37:07.384z'),
                    end: new Date('2017-11-23T13:39:38.055z')
                }
            ]
        },
        {
            _id: ObjectID('5a16f39fbfc960008bc5e080'),
            playerId: ObjectID('5a16f39fbfc960008bc5e07f'),
            playerName: 'zwtp',
            playerType: 'identified',
            animalName: 'scorpioid-obsequious-arawana',
            sessions: 1,
            firstSessionStarted: new Date('2017-11-23T16:13:19.888z'),
            attempts: [
                {
                    number: 1,
                    authToken: '5a16cc69bfc960008bc5e0795a16f39fbfc960008bc5e080329850051',
                    start: new Date('2017-11-23T16:13:19.888z'),
                    end: new Date('2017-11-23T16:26:00.730z')
                }
            ]
        },
        {
            _id: ObjectID('5a16f3a3bfc960008bc5e083'),
            playerId: ObjectID('5a16f3a3bfc960008bc5e082'),
            playerName: 'rixp',
            playerType: 'identified',
            animalName: 'encyclopaedic-lithophilic-danishswedishfarmdog',
            sessions: 1,
            firstSessionStarted: new Date('2017-11-23T16:13:23.416z'),
            attempts: [
                {
                    number: 1,
                    authToken: '5a16cc69bfc960008bc5e0795a16f3a3bfc960008bc5e0838916352941',
                    start: new Date('2017-11-23T16:13:23.416z'),
                    end: new Date('2017-11-23T16:29:29.811z')
                }
            ]
        }
    ],
    gameplays_5a16c726bfc960008bc5e071: [
        {
            _id: ObjectID('5a16c9f9bfc960008bc5e075'),
            playerId: ObjectID('5a16c9f8bfc960008bc5e074'),
            playerName: 'onzt',
            playerType: 'identified',
            animalName: 'bigboned-doctorial-bug',
            sessions: 2,
            firstSessionStarted: new Date('2017-11-23T13:15:37.002z'),
            attempts: [
                {
                    number: 1,
                    authToken: '5a16c726bfc960008bc5e0715a16c9f9bfc960008bc5e07509614651',
                    start: new Date('2017-11-23T13:15:37.002z'),
                    end: new Date('2017-11-23T13:16:30.592z')
                },
                {
                    number: 2,
                    authToken: '5a16c726bfc960008bc5e0715a16c9f9bfc960008bc5e0752084193272',
                    start: new Date('2017-11-23T13:18:14.390z'),
                    end: new Date('2017-11-23T13:21:09.051z')
                }
            ]
        }
    ],
    gameplays_5a14760fffce74008bddcabc: [
        {
            _id: ObjectID('5a1577dfbfc960008bc5e058'),
            playerId: ObjectID('5a1577dfbfc960008bc5e057'),
            playerName: 'qeee',
            playerType: 'identified',
            animalName: 'prochurch-sophisticated-pekingese',
            sessions: 7,
            firstSessionStarted: new Date('2017-11-22T13:13:03.179z'),
            attempts: [
                {
                    number: 1,
                    authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058787872071',
                    start: new Date('2017-11-22T13:13:03.179z'),
                    end: new Date('2017-11-22T13:13:03.179z')
                },
                {
                    number: 2,
                    authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058628466332',
                    start: new Date('2017-11-22T13:21:34.131z'),
                    end: new Date('2017-11-22T14:16:59.066z')
                },
                {
                    number: 3,
                    authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058369114523',
                    start: new Date('2017-11-22T15:26:34.216z'),
                    end: new Date('2017-11-22T15:26:40.300z')
                },
                {
                    number: 4,
                    authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058085793924',
                    start: new Date('2017-11-22T15:28:11.611z'),
                    end: new Date('2017-11-22T15:28:15.826z')
                },
                {
                    number: 5,
                    authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e0587079993275',
                    start: new Date('2017-11-22T15:32:41.882z'),
                    end: new Date('2017-11-22T15:32:41.882z')
                },
                {
                    number: 6,
                    authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e058987391846',
                    start: new Date('2017-11-22T17:20:14.856z'),
                    end: new Date('2017-11-22T17:21:37.947z')
                },
                {
                    number: 7,
                    authToken: '5a14760fffce74008bddcabc5a1577dfbfc960008bc5e05864294149987',
                    start: new Date('2017-11-22T17:45:40.084z'),
                    end: new Date('2017-11-22T17:51:21.165z')
                }
            ]
        },
        {
            _id: ObjectID('5a15ba69bfc960008bc5e061'),
            playerId: ObjectID('5a15ba69bfc960008bc5e060'),
            playerName: 'fdpo',
            playerType: 'identified',
            animalName: 'chromium-lovesome-rook',
            sessions: 4,
            firstSessionStarted: new Date('2017-11-22T17:56:57.555z'),
            attempts: [
                {
                    number: 1,
                    authToken: '5a14760fffce74008bddcabc5a15ba69bfc960008bc5e06124144021',
                    start: new Date('2017-11-22T17:56:57.555z'),
                    end: new Date('2017-11-22T18:06:39.232z')
                },
                {
                    number: 2,
                    authToken: '5a14760fffce74008bddcabc5a15ba69bfc960008bc5e061680051772',
                    start: new Date('2017-11-22T18:55:49.882z'),
                    end: new Date('2017-11-22T19:02:32.405z')
                },
                {
                    number: 3,
                    authToken: '5a14760fffce74008bddcabc5a15ba69bfc960008bc5e0619913684383',
                    start: new Date('2017-11-22T19:10:35.339z'),
                    end: new Date('2017-11-22T19:13:44.682z')
                },
                {
                    number: 4,
                    authToken: '5a14760fffce74008bddcabc5a15ba69bfc960008bc5e061068634744',
                    start: new Date('2017-11-23T12:25:35.874z'),
                    end: new Date('2017-11-23T12:27:11.918z')
                }
            ]
        },
        {
            _id: ObjectID('5a16bef6bfc960008bc5e069'),
            playerId: ObjectID('5a16bef6bfc960008bc5e068'),
            playerName: 'kzkx',
            playerType: 'identified',
            animalName: 'climactic-overparticular-apisdorsatalaboriosa',
            sessions: 3,
            firstSessionStarted: new Date('2017-11-23T12:28:38.468z'),
            attempts: [
                {
                    number: 1,
                    authToken: '5a14760fffce74008bddcabc5a16bef6bfc960008bc5e0696990773231',
                    start: new Date('2017-11-23T12:28:38.468z'),
                    end: new Date('2017-11-23T12:30:13z')
                },
                {
                    number: 2,
                    authToken: '5a14760fffce74008bddcabc5a16bef6bfc960008bc5e0693330362652',
                    start: new Date('2017-11-23T12:30:41.987z'),
                    end: new Date('2017-11-23T12:31:02.043z')
                },
                {
                    number: 3,
                    authToken: '5a14760fffce74008bddcabc5a16bef6bfc960008bc5e069262637553',
                    start: new Date('2017-11-23T12:39:50.074z'),
                    end: new Date('2017-11-23T12:40:06.791z')
                }
            ]
        },
        {
            _id: ObjectID('5a16c1c1bfc960008bc5e06e'),
            playerId: ObjectID('5a16c1c1bfc960008bc5e06d'),
            playerName: 'blao',
            playerType: 'identified',
            animalName: 'duckie-silken-lynx',
            sessions: 1,
            firstSessionStarted: new Date('2017-11-23T12:40:33.924z'),
            attempts: [
                {
                    number: 1,
                    authToken: '5a14760fffce74008bddcabc5a16c1c1bfc960008bc5e06e459872271',
                    start: new Date('2017-11-23T12:40:33.924z'),
                    end: new Date('2017-11-23T12:40:42.969z')
                }
            ]
        }
    ]
};
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers