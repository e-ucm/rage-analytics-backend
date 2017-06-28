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
var Collection = require('easy-collections');

function backup(config, callback) {
    callback(null, config);
}

function upgrade(config, callback) {
    // Transformers
    var classesCollection = config.mongodb.db.collection('classes');
    var sessionscollection = config.mongodb.db.collection('sessions');

    // Remove the unnecesary fields from class
    classesCollection.updateMany({},
        { $unset: { gameId: '', versionId: ''} }
    ).then(function() {
        // Rename activities collection to activities
        sessionscollection.renameCollection('activities');
    });

}


function check(config, callback) {

    config.mongodb.db.listCollections().toArray(function(err, collections) {
        if (err) {
            console.log('Unexpected error while checking collections names!', err);
            return callback(err);
        }

        var activitiesExists = false;
        for (var key in collections) {
            var collection = collections[key];
            if (collection.name === 'activities') {
                activitiesExists = true;
                break;
            }
        }

        if (activitiesExists) {
            return callback(new Error('Activities collection not found!'));
        }


        var classesCollection = config.mongodb.db.collection('classes');

        classesCollection.find().forEach(function(classDoc) {
            if (classDoc.gameId) {
                return callback(new Error('A class contains a gameId'));
            }
            if (classDoc.versionId) {
                return callback(new Error('A class contains a versionId'));
            }
        });


        var activitiesCollection = config.mongodb.db.collection('activities');
        activitiesCollection.find().forEach(function(activity) {
            if (activity.gameId) {
                return callback(new Error('A class contains a gameId'));
            }
            if (activity.versionId) {
                return callback(new Error('A class contains a versionId'));
            }
        });

    });
}


module.exports = {
    backup: backup,
    upgrade: upgrade,
    check: check,
    requires: {}, // Depends on nothing
    version: {
        origin: 2,
        destination: 3
    }
};


