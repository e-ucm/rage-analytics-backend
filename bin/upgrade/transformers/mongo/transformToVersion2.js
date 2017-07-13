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

function updateSessionClassId(sessionsColection, sessionItem, classes, config, callback) {

    classes.insert({
        gameId: sessionItem.gameId,
        versionId: sessionItem.versionId,
        name: 'Automatic Class (' + sessionItem.name + ')',
        created: new Date(),
        authors: sessionItem.teachers,
        students: sessionItem.students,
        teachers: sessionItem.teachers
    }).then(function (classRes) {
        if (!classRes) {
            return callback(new Error('Unexpected error while creating a class for session'));
        }
        sessionsColection.findAndModify(
            {"_id": sessionItem._id},
            [],
            {"$set": {"classId": classRes._id}},
            {new: true, upsert: true}, 
            function (err, doc) {
                if (err) {
                    return callback(new Error('Unexpected error while updating session\'s classId attribute', err));
                }
                callback(null, config);
            });
    });
}


function upgrade(config, callback) {
    // Transformers
    var classes = new Collection(config.mongodb.db, 'classes');
    var sessionsCollection = config.mongodb.db.collection('sessions');
    var cursor = sessionsCollection.find();

    var completed = 0;
    var toComplete = 0;
    var completeAll = function(err, result){
        if(err)
            callback(err, result);

        completed++;
        if(completed >= toComplete){
            callback(err, result);
        }
    };

    // Execute the each command, triggers for each document
    cursor.each(function (err, item) {
        if (err) {
            console.log('Unexpected error while iterating sessions!', err);
            return callback(err);
        }

        // If the item is null then the cursor is exhausted/empty and closed
        if (item === null) {
            if(toComplete === 0)
                callback(null, config);
            return;
        }

        toComplete++;

        updateSessionClassId(sessionsCollection, item, classes, config, completeAll);
    });
}


function check(config, callback) {
    var classes = new Collection(config.mongodb.db, 'classes');
    var sessionsCollection = config.mongodb.db.collection('sessions');
    var cursor = sessionsCollection.find();

    cursor.each(function (err, item) {
        if (err) {
            console.log('Unexpected error while iterating sessions!', err);
            return callback(err);
        }

        // If the item is null then the cursor is exhausted/empty and closed
        if (item === null) {
            callback(null, config);
            return;
        }

        classes.findById(item.classId).then(function (classRes) {
            if (!classRes) {
                return callback(new Error('Class does not exist'));
            }
        });
    });
}

function clean(config, callback) {
    callback(null, config);
}

function restore(config, callback) {
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
        origin: '1',
        destination: '2'
    }
};


