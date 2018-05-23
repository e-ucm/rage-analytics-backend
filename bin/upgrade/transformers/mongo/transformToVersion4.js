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
var ObjectID = require('mongodb').ObjectID;

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
                        upgradeAttempts(config, callback);
                    }
                });
            });
        });
    });
}

function upgradeAttempts(config, callback) {
    // Transformers
    var playersCollection = config.mongodb.db.collection('players');
    var authTokensCollection = config.mongodb.db.collection('authtokens');

    // Aux function to update a gameplay by adding attemps and player info. Also adds the version to the player.
    var updateGameplay = function(versionId, gameplaysCollection, gameplay, callback) {
        playersCollection.findOneAndUpdate({ _id: gameplay.playerId }, { $addToSet: { versions: versionId }}).then(function(res) {
            playersCollection.findOne({ _id: gameplay.playerId }).then(function(player) {
                gameplay.playerName = player.name;
                gameplay.playerType = player.type;
                gameplay.animalName = player.animalName;
                gameplay.attempts = [];

                authTokensCollection.find({playerId: player._id, gameplayId: gameplay._id }).toArray(function(err, authTokens) {
                    if (err) {
                        console.log('ERROR: ', err);
                        callback(err, config);
                    }
                    async.each(authTokens, function(authToken, callback) {
                        gameplay.attempts.push({
                            number: authToken.session,
                            authToken: authToken.authToken,
                            start: authToken.currentSessionStarted,
                            end: authToken.lastAccessed
                        });
                        callback(null, config);
                    }, function(err) {
                        if (err) {
                            console.log('ERROR: ', err);
                            callback(err, config);
                        }
                        gameplaysCollection.save(gameplay);
                        callback(null, config);
                    });
                });
            }, function (err) {
                console.log('Player not found!', err);
                return callback(err, config);
            });
        }, function (err) {
            console.log('Failed to add version to player!', err);
            return callback(err, config);
        });
    };

    config.mongodb.db.db.listCollections().toArray(function(err, collections) {

        var gameplaysCollections = [];

        // We map the gameplays collections locally for fast search
        for (var key in collections) {
            if (!collections.hasOwnProperty(key)) {
                continue;
            }
            var collection = collections[key];
            if (collection.name.startsWith('gameplays_')) {
                gameplaysCollections.push(collection.name);
            }
        }

        // First we add the missing activities and versions fields to the players
        playersCollection.updateMany({},{ $set: { versions: [], activities: [] }}, function(err, docs) {
            if (err) {
                console.log('Failed while adding activities and versions to players!', err);
                return callback(err, config);
            }

            // Then we iterate over the versions to add its attempts and its references to players
            async.each(gameplaysCollections, function(gameplayCollectionName, callback) {
                var gameplaysCollection = config.mongodb.db.collection(gameplayCollectionName);
                var versionId = ObjectID(gameplayCollectionName.split('_')[1]);
                gameplaysCollection.find({}).toArray(function(err, gameplays) {
                    if (err) {
                        console.log('ERROR: ', err);
                        callback(err, config);
                    }
                    async.each(gameplays, function(gameplay, callback) {
                        updateGameplay(versionId, gameplaysCollection, gameplay, callback);
                    }, function(err) {
                        if (err) {
                            callback(err, config);
                        }
                        callback(null, config);
                    });
                });
            }, function(err) {
                if (err) {
                    callback(err, config);
                }
                console.log('MongoTransformerTo4: Success');
                callback(null, config);
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
            if (activity.open === undefined) {
                return callback(new Error('An activity does not contain open field'));
            }
            if (activity.visible === undefined) {
                return callback(new Error('An activity does not contain visible field'));
            }
            if (activity.end && activity.open) {
                return callback(new Error('An activity end but is open'));
            }
            if (!activity.end && !activity.open) {
                return callback(new Error('An activity not end but not is open'));
            }
        });

        checkAttempts(config, callback);
    });
}

function checkAttempts(config, callback) {

    var playersCollection = config.mongodb.db.collection('players');
    var authTokensCollection = config.mongodb.db.collection('authtokens');

    var checkGameplay = function(gameplay, callback) {
        // Check new player fields
        var err = null;
        if (!gameplay.playerName) {
            err = 'A gameplay does not contain its player name.';
        } else if (!gameplay.playerType) {
            err = 'A gameplay does not contain its player type.';
        } else if (!gameplay.animalName) {
            err = 'A gameplay does not contain its player animal name.';
        } else if (!gameplay.attempts) {
            err = 'A gameplay does not contain its attempts.';
        } else if (!gameplay.attempts) {
            err = 'Gameplay has no attempts field.';
        } else if (gameplay.sessions !== gameplay.attempts.length) {
            err = 'A gameplay does not contain the same amount of attempts as sessions were counted.';
        }
        if (err) {
            console.log(err);
            return callback(err, config);
        }

        playersCollection.findOne({ _id: gameplay.playerId }).then(function(player) {
            var err = null;
            if (gameplay.playerName !== player.name) {
                err = 'Player name does not match.';
            } else if (gameplay.playerType !== player.type) {
                err = 'Player type does not match.';
            } else if (gameplay.animalName !== player.animalName) {
                err = 'Player animal name does not match.';
            }
            if (err) {
                console.log(err);
                return callback(err, config);
            }
            // Check the consistence of the attempts
            if (gameplay.attempts.length === 0) {
                return callback(null, config);
            }
            async.each(gameplay.attempts, function(attempt, callback) {
                authTokensCollection.findOne({authToken: attempt.authToken}).then(function (authToken) {
                    var err = null;
                    if (!authToken) {
                        err = 'Auth token is missing for an attempt.';
                    } else if (attempt.number !== authToken.session) {
                        err = 'Attempt and session number do not match.';
                    } else if (attempt.start !== authToken.currentSessionStarted) {
                        err = 'Attempt and session start do not match: ' + attempt.start + ' !== ' + authToken.currentSessionStart;
                    } else if (attempt.end !== authToken.lastAccessed) {
                        err = 'Attempt and session end do not match.';
                    }
                    if (err) {
                        console.log(err);
                        return callback(err, config);
                    }
                    callback(null, config);
                }, function (err) {
                    console.log(err);
                    return callback(err, config);
                });
            }, function (err, res) {
                if (err) {
                    console.log(err);
                    return callback(err, config);
                }
                callback(null, config);
            });
        }, function (err) {
            console.log(err);
            return callback(err, config);
        });
    };

    config.mongodb.db.db.listCollections().toArray(function(err, collections) {
        // Check the players contain the new fields
        playersCollection.findOne({
            $or: [
                { versions: {$exists: false} },
                { activities: {$exists: false} }
            ]
        }).then(function(player) {
            if (player && player !== {}) {
                var err = 'A player does not contain versions or activities fields.';
                console.log(err);
                return callback(err, config);
            }
            // Check all the gameplays collection
            async.each(collections, function(collection, callback) {
                // A gameplay collection has to start with gameplays_
                if (!collection.name.startsWith('gameplays_')) {
                    return callback(null, config);
                }
                var gameplaysCollection = config.mongodb.db.collection(collection.name);
                gameplaysCollection.find({}).toArray(function(err, gameplays) {
                    if (err) {
                        console.log('ERROR: ', err);
                        return callback(err, config);
                    }
                    async.each(gameplays, function(gameplay, callback) {
                        checkGameplay(gameplay, callback);
                    }, function(err) {
                        if (err) {
                            return callback(err, config);
                        }
                        // End collection check
                        callback(null, config);
                    });
                });
            }, function (err, res) {
                if (err) {
                    return callback(err, config);
                }
                console.log('Mongo3to4 Check success!');
                callback(null, config);
            });
        }, function(err) {
            console.log('Error accessing players.', err);
            return callback(err, config);
        });
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


