'use strict';

/**
 * Manages the gameplays stored. A new gameplay collection is created for each game version
 * ('gameplays_<versionId>') with:
 *
 *      {
 *          playerId: <String>,
 *          sessions: <Integer>,    - This value increases each time we invoke the 'start' method.
 *          started: <Date>         - The moment this gameplay was started. Either when we've received a
 *                                     '/api/collector/start/:trackingCode' request or when we've received
 *                                     a Statement with a special(reserved) verb id (more info. at 'traces.js')
 *      }
 *
 * Manages a collection of authorization tokens, named 'authtokens', with the following documents:
 *
 *     {
 *          authToken: <String>,    - version._id + gameplay._id + <10_random_string_characters> + gameplay.sessions.
 *          gameplayId: <String>,
 *          versionId: <String>,
 *          playerId: <String>,
 *          lastAccessed: <Date>    - Updated each time new data is sent to be tracked.
 *     }
 */

module.exports = (function () {
    var Q = require('q');
    var Collection = require('easy-collections');
    var gameplays = {};


    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var gameplaySchema = {
        id: '/GamePlaySchema',
        type: 'object',
        properties: {
            playerName: { type: 'string'},
            playerType: { type: 'string'},
            animalName: { type: 'string'},
            sessions: { type: 'number'},
            firstSessionStarted: { type: 'date'},
            attempts: {
                type: 'array',
                required: true,
                items: {
                    type: 'object',
                    properties: {
                        authToken: {
                            type: 'string',
                            required: true
                        },
                        start: {
                            type: 'date',
                            required: true
                        },
                        end: { type: 'date'},
                        number: {
                            type: 'number',
                            required: true
                        }
                    }
                }
            }
        },
        required: ['playerName','playerType','animalName','sessions'],
        additionalProperties: false
    };
    v.addSchema(gameplaySchema, '/GamePlaySchema');

    var gameplayPutSchema = {
        id: '/GamePlayPutSchema',
        type: 'object',
        properties: {
            sessions: { type: 'number'}
        },
        additionalProperties: false,
        minProperties: 1
    };
    v.addSchema(gameplayPutSchema, '/GamePlayPutSchema');

    var attemptSchema = {
        id: '/AttemptSchema',
        type: 'object',
        properties: {
            authToken: { type: 'string' },
            start: { type: 'date' },
            end: { type: 'date'},
            number: { type: 'number' }
        },
        additionalProperties: false,
        minProperties: 1
    };
    v.addSchema(attemptSchema, '/AttemptSchema');


    /**
     * If there is an existing gameplay with the given 'version._id' for the given 'playerId' it increases its
     * 'sessions' counter by one.
     * Otherwise will create a new gameplay for that 'playerId' with the 'sessions' attribute initialized to 1 and
     * the 'started' attribute set to the current date.
     *
     * Note that if a new gameplay is created it will be created with 1 session directly.
     *
     * Afterwards creates a new authorization document with the following information:
     *
     *      {
     *          authToken: authToken,       - version._id + gameplay._id + <10_random_string_characters> + gameplay.sessions.
     *          gameplayId: gameplay._id,   - The ID of the gameplay that was recently created or whose 'sessions'
     *                                         attribute has just been increased by 1.
     *          versionId: version._id,
     *          playerId: playerId,
     *          lastAccessed: <currentDate>
     *      }
     *
     * This method is invoked when we receive an '/api/collector/start/:trackingCode' request, right after
     * ensuring that the 'trackingCode' is correct and querying the player depending of an 'Authorization' header.
     * More info. can be found at 'collector.js'@start function.
     *
     * @param playerId
     * @param trackingCode
     * @param version
     * @returns the newly created authorization token document.
     */
    gameplays.find = function (id, player) {
        var g = new Collection(require('./db'), 'gameplays_' + id);
        return g.find({
            playerName: player.name
        }, true).then(function (gameplay) {
                if (!gameplay) {
                    gameplay = {
                        playerName: player.name,
                        playerType: player.type,
                        animalName: player.animalName,
                        sessions: 0,
                        firstSessionStarted: new Date(),
                        attempts: []
                    };

                    var validationObj = v.validate(gameplay, gameplaySchema);
                    if (validationObj.errors && validationObj.errors.length > 0) {
                        throw {
                            message: 'Gameplay bad format: ' + validationObj.errors[0],
                            status: 400
                        };
                    } else {
                        return g.insert(gameplay);
                    }
                }
                return gameplay;
            });
    };

    /**
     * Finds all the attempts for an activity by its id. Optionally, the playerName can be used to filter the
     * activities for a player.
     *
     * @param activityId
     * @param playerName
     */
    gameplays.startAttempt = function (id, player, authToken) {
        var g = new Collection(require('./db'), 'gameplays_' + id);

        return gameplays.find(id, player).then(function (gameplay) {
            return g.findAndUpdate(gameplay._id.toString(), {
                $inc: { sessions: 1 }
            }).then(function (gameplay) {
                var newAttempt = {
                    number: gameplay.sessions,
                    authToken: authToken,
                    start: new Date()
                };
                var validationObj = v.validate(newAttempt, attemptSchema);
                if (validationObj.errors && validationObj.errors.length > 0) {
                    throw {
                        message: 'Attempt bad format: ' + validationObj.errors[0],
                        status: 400
                    };
                } else {
                    return g.findAndUpdate(gameplay._id.toString(), {
                        $push: { attempts: newAttempt }
                    }).then(function () {
                        return newAttempt;
                    });
                }
            });
        });
    };

    /**
     * Finds all the attempts for an activity by its id. Optionally, the playerName can be used to filter the
     * activities for a player.
     *
     * @param activityId
     * @param playerName
     */
    gameplays.getAttempts = function (id, playerName) {
        var g = new Collection(require('./db'), 'gameplays_' + id);
        if (playerName) {
            return g.find({ playerName: playerName });
        }
        return g.find();
    };

    /**
     * Ends the attempt for an 'authorization'
     *
     * @param authorization
     * @returns 401 - Meaning that that 'authorization' is invalid.
     */
    gameplays.endAttempt = function (id, authToken) {
        var deferred = Q.defer();
        var g = new Collection(require('./db'), 'gameplays_' + id);
        g.collection().findOneAndUpdate({
            'attempts.authToken': authToken
        }, {
            $set: { 'attempts.$.end': new Date() }
        }, {
            returnOriginal: false,
            sort: {
                _id: 1
            }
        }).then(function (result) {
            if (result.ok) {
                deferred.resolve(result.value);
            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    };

    return gameplays;
})();