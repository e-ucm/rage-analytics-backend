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

var async = require('async');

function backup(config, callback) {
    callback(null, config);
}

function upgrade(config, callback) {
    // Transformers
    var gamesCollection = config.mongodb.db.collection('games');
    var classesCollection = config.mongodb.db.collection('classes');
    var activitiesCollection = config.mongodb.db.collection('activities');

    // Change assistants, teachers and students by participants fields in class collection
    classesCollection.updateMany({},
        {
            $unset: {
                authors: ''
            },
            $rename: {
                students: 'participants.students',
                teachers: 'participants.teachers'
            },
            $set: {
                groups: [],
                groupings: []
            }
        }
    ).then(function () {
        gamesCollection.updateMany({},
            {$set: {deleted: false}}
        ).then(function () {
            // Activities use classes participants by default
            activitiesCollection.find().toArray(function (err, activities) {
                if (err) {
                    console.log('ERROR: ', err);
                    callback(err, config);
                }
                async.each(activities, function (act, callbackIn) {
                    var newAct = {};
                    newAct.open = act.end ? false : true;
                    newAct.visible = true;
                    newAct.groups = [];
                    newAct.groupings = [];
                    activitiesCollection.updateOne({_id: act._id}, {$set: newAct, $unset: {students: '', teachers: ''}}).then(
                        function (err, res) {
                            callbackIn();
                        });
                }, function (err) {
                    if (err) {
                        callback(err, config);
                    } else {
                        console.log('MongoTransformerTo4: Success');
                        callback(null, config);
                    }
                });
            });
        });
    });
}


function check(config, callback) {
    config.mongodb.db.db.listCollections().toArray(function (err, collections) {
        if (err) {
            console.log('Unexpected error while checking collections names!', err);
            return callback(err, config);
        }
        
        var classesCollection = config.mongodb.db.collection('classes');

        classesCollection.find().forEach(function (classDoc) {
            if (!classDoc.participants) {
                return callback(new Error('A class contains participants'));
            }
            if (!classDoc.participants.teachers) {
                return callback(new Error('A class contains participants.teachers'));
            }
        });


        var activitiesCollection = config.mongodb.db.collection('activities');
        activitiesCollection.find().forEach(function (activity) {
            if (!activity.open) {
                return callback(new Error('An activity does not contain open field'));
            }
            if (!activity.visible) {
                return callback(new Error('An activity does not contain visible field'));
            }
            if (activity.end && activity.open) {
                return callback(new Error('An activity end but is open'));
            }
            if (!activity.end && !activity.open) {
                return callback(new Error('An activity not end but not is open'));
            }
        });
        
        callback(null, config);
    });
}

function clean(config, callback) {
    // TODO exceptions
    callback(null, config);
}

function restore(config, callback) {
    // TODO exceptions
    callback(null, config);
}

module.exports = {
    backup: backup,
    upgrade: upgrade,
    check: check,
    clean: clean,
    restore: restore,
    requires: {}, // Depends on nothing
    version: {
        origin: '3',
        destination: '4'
    }
};


