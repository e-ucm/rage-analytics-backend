'use strict';

var ObjectID = require('mongodb').ObjectID;

module.exports = {
    games: [
        {
            _id: ObjectID('5a955ddc52031c0081395c33'),
            title: 'test',
            created: '2018-02-27T13:32:12.185Z',
            authors: [
                'dev2'
            ],
            public: false,
            developers: [
                'dev2'
            ]
        },
        {
            _id: ObjectID('5a959b29ca50e50077dec85d'),
            title: 'd1',
            created: '2018-02-27T17:53:45.468Z',
            authors: [
                'd1'
            ],
            public: true,
            developers: [
                'd1'
            ]
        }
    ],
    classes: [
        {
            _id: ObjectID('5a26cb78c8b102008b41472c'),
            name: 'c1',
            created: '2017-12-05T16:38:16.556Z',
            authors: [
                't'
            ],
            teachers: [
                't'
            ],
            students: [ ]
        },
        {
            _id: ObjectID('5a2ff6bac8b102008b41474b'),
            name: 'SM_IES EuropaTeachers',
            created: '2017-12-12T15:33:14.500Z',
            authors: [
                'game_tea'
            ],
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

    ],
    activities: [
        {
            _id: ObjectID('595badad370740006dc1ab80'),
            gameId: ObjectID('5a955ddc52031c0081395c33'),
            versionId: ObjectID('59315d0d370740006dc1a7b7'),
            classId: ObjectID('5a2ff6bac8b102008b41474b'),
            name: 'g1c1s1',
            allowAnonymous: false,
            created: '2018-01-29T17:23:06.227Z',
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
            ],
            teachers: [
                'game_tea'
            ],
            start: '2018-01-30T12:32:50.185Z',
            end: '2018-01-30T13:20:23.621Z'
        },
        {
            _id: ObjectID('595badbe370740006dc1ab81'),
            gameId: ObjectID('5a959b29ca50e50077dec85d'),
            versionId: ObjectID('59315d0d370740006dc1a7b7'),
            classId: ObjectID('5a26cb78c8b102008b41472c'),
            name: 'g1c1s2',
            allowAnonymous: true,
            students: [],
            teachers: [
                't'
            ],
            created: '2017-12-01T18:34:00.394Z',
            start: '2017-12-04T17:06:28.507Z',
            end: null
        }
    ]
};