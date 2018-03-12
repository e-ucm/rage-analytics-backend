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
    var authTokens = new Collection(require('./db'), 'authtokens');
    var gameplays = require('./gameplays');

    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var authTokenSchema = {
        id: '/AuthTokenSchema',
        type: 'object',
        properties: {
            authToken: { type: 'string'},
            gameplayId: { type: 'ID'},
            versionId: { type: 'ID'},
            activityId: { type: 'ID'},
            session: { type: 'number'},
            playerId: { type: 'ID'},
            lastAccessed: { type: 'date'},
            firstSessionStarted: { type: 'date'},
            currentSessionStarted: { type: 'date'}
        },
        required: ['authToken','gameplayId','versionId','session','playerId','lastAccessed','firstSessionStarted','currentSessionStarted'],
        additionalProperties: false
    };
    v.addSchema(authTokenSchema, '/AuthTokenSchema');

    var authTokenSchemaPut = {
        id: '/AuthTokenPutSchema',
        type: 'object',
        properties: {
            lastAccessed: { type: 'date'}
        },
        additionalProperties: false,
        minProperties: 1,
        maxProperties: 1
    };
    v.addSchema(authTokenSchemaPut, '/AuthTokenPutSchema');

    var token = function () {
        return Math.random().toString(10).substr(10);
    };

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
    authTokens.start = function (player, version, activity) {
        var id = activity ? activity._id : version._id;

        return gameplays.find(id, player)
            .then(function (gameplay) {
                // To assure uniqueness in the authToken, but also randomness
                var authorization = version._id + gameplay._id + token() + gameplay.sessions;

                return gameplays.startAttempt(id, player, authorization).then(function (attempt) {
                    // If it's the first session 'currentSessionStarted' and 'firstSessionStarted' must be the same
                    var currentTime = new Date();
                    var authToken = {
                        authToken: authorization,
                        gameplayId: gameplay._id,
                        versionId: version._id,
                        session: attempt.number,
                        playerId: player._id,
                        lastAccessed: currentTime,
                        firstSessionStarted: gameplay.firstSessionStarted,
                        currentSessionStarted: attempt.number === 1 ? gameplay.firstSessionStarted : currentTime
                    };

                    if (activity) {
                        authToken.activityId = activity._id;
                    }

                    var validationObj = v.validate(authToken, authTokenSchema);
                    if (validationObj.errors && validationObj.errors.length > 0) {
                        throw {
                            message: 'Course bad format: ' + validationObj.errors[0],
                            status: 400
                        };
                    }

                    return authTokens.insert(authToken)
                        .then(function (authToken) {
                            // First we create a new attempt
                            return {
                                authToken: authToken.authToken,
                                session: authToken.session,
                                firstSessionStarted: authToken.firstSessionStarted,
                                currentSessionStarted: authToken.currentSessionStarted
                            };
                        });
                });
            });
    };

    /**
     * Ensures that a document with the given 'authorization' exists and updates its 'lastAccessed' attribute.
     *
     * @param authorization
     * @returns 401 - Meaning that that 'authorization' is invalid.
     */
    authTokens.track = function (authorization) {
        var deferred = Q.defer();
        var set = {
            lastAccessed: new Date()
        };

        // Local validation (possibly unnecesary)
        var validationObj = v.validate(set, authTokenSchemaPut);
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'AuthToken bad format: ' + validationObj.errors[0],
                status: 400
            };
        }
        authTokens.collection().findOneAndUpdate({
            authToken: authorization
        }, { $set: set }, {
            returnOriginal: false,
            sort: {
                _id: 1
            }
        }).then(function (authToken) {
            if (!authToken.ok) {
                deferred.reject({ status: 401 });
                return;
            }
            deferred.resolve(authToken.value);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    /**
     * Ends the attempt for an 'authorization'
     *
     * @param authorization
     * @returns 401 - Meaning that that 'authorization' is invalid.
     */
    authTokens.end = function (authorization) {
        return authTokens.track(authorization, true)
            .then(function (authToken) {
                var id = authToken.activityId ? authToken.activityId : authToken.versionId;
                return gameplays.endAttempt(id, authToken.authToken);
            });
    };

    return authTokens;
})();