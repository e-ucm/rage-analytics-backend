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
    var Collection = require('easy-collections');
    var authTokens = new Collection(require('./db'), 'authtokens');

    var token = function () {
        return Math.random().toString(10).substr(10);
    };

    /**
     * Creates a new gameplay if there is a record of an authorization token with the given 'playerId', 'versionId'
     * and 'gameplayId'.
     *
     * This method is invoked when the data processed by the 'traces.js'
     * has a statement with a specific verb id (equal value to the value of 'startedGameplayId',
     * more info. can be found at 'traces.js').
     *
     * Note that the created gameplay has 0 sessions.
     *
     * @param playerId
     * @param versionId
     * @param gameplayId
     * @returns the new gameplay id or an error.
     */
    authTokens.newGameplay = function (playerId, versionId, gameplayId) {
        return authTokens.find({
            playerId: playerId,
            gameplayId: gameplayId,
            versionId: versionId
        }, true).then(function (authToken) {
            if (authToken) {
                var gameplays = new Collection(require('./db'), 'gameplays_' + versionId);
                return gameplays.insert({
                    playerId: playerId,
                    sessions: 0,
                    started: new Date()
                }).then(function (gameplay) {
                    return authTokens.findAndModify(authToken._id, {
                        gameplayId: gameplay._id
                    }).then(function () {
                        return gameplay._id;
                    });
                });
            }

            return gameplayId;

        });
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
    authTokens.start = function (playerId, version, authorization) {
        var gameplays = new Collection(require('./db'), 'gameplays_' + version._id);
        return gameplays.find({
            playerId: playerId
        }, true)
            .then(function (gameplay) {
                if (gameplay) {
                    return gameplays.findAndModify(gameplay._id, {
                        sessions: gameplay.sessions + 1
                    });
                }

                return gameplays.insert({
                    playerId: playerId,
                    sessions: 1,
                    started: new Date()
                });

            }).then(function (gameplay) {
                // To assure uniqueness in the authtoken, but also randomness
                var authToken = authorization ? authorization : version._id + gameplay._id + token() + gameplay.sessions;
                return authTokens.insert({
                    authToken: authToken,
                    gameplayId: gameplay._id,
                    versionId: version._id,
                    playerId: playerId,
                    lastAccessed: new Date()
                }).then(function () {
                    return authToken;
                });
            });
    };

    /**
     * Ensures that a document with the given 'authToken' exists and updates its 'lastAccessed' attribute.
     *
     * @param authToken
     * @returns 401 - Meaning that that 'authToken' is invalid.
     *          or the updated authorization document.
     */
    authTokens.track = function (authToken) {
        return authTokens.find({
            authToken: authToken
        }, true).then(function (authToken) {
            if (authToken) {
                var set = {
                    lastAccessed: new Date()
                };
                return authTokens.findAndModify(authToken._id, set);
            }

            throw {
                status: 401
            };
        });
    };

    return authTokens;
})();