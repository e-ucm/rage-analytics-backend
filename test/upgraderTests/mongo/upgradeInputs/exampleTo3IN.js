'use strict';

var ObjectID = require('mongodb').ObjectID;

module.exports = {
    games: [
        {
            "_id": ObjectID("59315d0d370740006dc1a7b6"),
            "title": "g1",
            "created": "2017-06-02T12:41:49.631Z",
            "authors": [
                "d"
            ],
            "public": true,
            "developers": [
                "d"
            ]
        },
        {
            "_id": ObjectID("59289445370740006dc1a794"),
            "title": "g2",
            "created": "2017-05-26T20:47:01.968Z",
            "authors": [
                "d"
            ],
            "public": true,
            "developers": [
                "d"
            ]
        }
    ],
    versions: [
        {
            "_id": ObjectID("59315d0d370740006dc1a7b7"),
            "gameId": ObjectID("59315d0d370740006dc1a7b6"),
            "trackingCode": "59315d0d370740006dc1a7b72g66zktn0khjjor"
        },
        {
            "_id": ObjectID("59289445370740006dc1a795"),
            "gameId": ObjectID("59289445370740006dc1a794"),
            "trackingCode": "59289445370740006dc1a795lds5abfyul2nvcxr"
        }
    ],
    classes: [
        {
            "_id": ObjectID("595bacf1370740006dc1ab7f"),
            "gameId": ObjectID("59315d0d370740006dc1a7b6"),
            "versionId": ObjectID("59315d0d370740006dc1a7b7"),
            "name": "g1c1",
            "created": "2017-07-04T14:57:53.048Z",
            "authors": [
                "t1"
            ],
            "teachers": [
                "t1",
                "t2",
                "t3"
            ],
            "students": [
                "s1",
                "s2",
                "s3",
                "s4",
                "s5"
            ]
        },
        {
            "_id": ObjectID("595bace0370740006dc1ab7e"),
            "gameId": ObjectID("59315d0d370740006dc1a7b6"),
            "versionId": ObjectID("59315d0d370740006dc1a7b7"),
            "name": "g1c2",
            "created": "2017-07-04T14:57:36.826Z",
            "authors": [
                "t1"
            ],
            "teachers": [
                "t1",
                "t3"
            ],
            "students": [
                "s1",
                "s3",
                "s5"
            ]
        },
        {
            "_id": ObjectID("5953c068370740006dc1ab7b"),
            "gameId": ObjectID("59289445370740006dc1a794"),
            "versionId": ObjectID("59289445370740006dc1a795"),
            "name": "g2c1",
            "created": "2017-06-28T14:42:48.426Z",
            "authors": [
                "t2"
            ],
            "teachers": [
                "t2",
                "t3"
            ],
            "students": [
                "s2",
                "s4"
            ]
        }
    ],
    sessions: [
        {
            "_id": ObjectID("595badad370740006dc1ab80"),
            "gameId": ObjectID("59315d0d370740006dc1a7b6"),
            "versionId": ObjectID("59315d0d370740006dc1a7b7"),
            "classId": ObjectID("595bacf1370740006dc1ab7f"),
            "name": "g1c1s1",
            "allowAnonymous": false,
            "created": "2017-07-04T15:01:01.878Z",
            "students": [
                "s1",
                "s2",
                "s3",
                "s4",
                "s5"
            ],
            "teachers": [
                "t1",
                "t2",
                "t3"
            ]
        },
        {
            "_id": ObjectID("595badbe370740006dc1ab81"),
            "gameId": ObjectID("59315d0d370740006dc1a7b6"),
            "versionId": ObjectID("59315d0d370740006dc1a7b7"),
            "classId": ObjectID("595bacf1370740006dc1ab7f"),
            "name": "g1c1s2",
            "allowAnonymous": true,
            "created": "2017-07-04T15:01:18.422Z",
            "students": [
                "s1",
                "s2",
                "s3",
                "s4",
                "s5"
            ],
            "teachers": [
                "t1",
                "t2",
                "t3"
            ]
        },
        {
            "_id": ObjectID("595bb031370740006dc1ab82"),
            "gameId": ObjectID("59315d0d370740006dc1a7b6"),
            "versionId": ObjectID("59315d0d370740006dc1a7b7"),
            "classId": ObjectID("595bace0370740006dc1ab7e"),
            "name": "g1c2s1",
            "allowAnonymous": false,
            "created": "2017-07-04T15:11:45.126Z",
            "students": [
                "s1",
                "s3",
                "s5"
            ],
            "teachers": [
                "t1",
                "t3"
            ]
        },
        {
            "_id": ObjectID("59565c67370740006dc1ab7c"),
            "gameId": ObjectID("59289445370740006dc1a794"),
            "versionId": ObjectID("59289445370740006dc1a795"),
            "classId": ObjectID("5953c068370740006dc1ab7b"),
            "name": "g2c1s1",
            "allowAnonymous": true,
            "created": "2017-06-30T14:12:55.209Z",
            "students": [
                "s2",
                "s4"
            ],
            "teachers": [
                "t2",
                "t3"
            ]
        },
        {
            "_id": ObjectID("595bac18370740006dc1ab7d"),
            "gameId": ObjectID("59289445370740006dc1a794"),
            "versionId": ObjectID("59289445370740006dc1a795"),
            "classId": ObjectID("5953c068370740006dc1ab7b"),
            "name": "g2c1s2",
            "allowAnonymous": true,
            "created": "2017-07-04T14:54:16.859Z",
            "students": [
                "s2",
                "s4"
            ],
            "teachers": [
                "t2",
                "t3"
            ]
        }
    ]
};