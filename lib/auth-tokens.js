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
    authTokens.start = function (playerId, version) {
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
                    firstSessionStarted: new Date()
                });

            }).then(function (gameplay) {
                // To assure uniqueness in the authToken, but also randomness
                var authorization = version._id + gameplay._id + token() + gameplay.sessions;

                // If it's the first session 'currentSessionStarted' and 'firstSessionStarted' must be the same
                var currentSessionStarted = gameplay.sessions === 1 ? gameplay.firstSessionStarted : new Date();
                return authTokens.insert({
                    authToken: authorization,
                    gameplayId: gameplay._id,
                    versionId: version._id,
                    session: gameplay.sessions,
                    playerId: playerId,
                    lastAccessed: currentSessionStarted,
                    firstSessionStarted: gameplay.firstSessionStarted,
                    currentSessionStarted: currentSessionStarted
                }).then(function () {
                    return {
                        authToken: authorization,
                        session: gameplay.sessions,
                        firstSessionStarted: gameplay.firstSessionStarted,
                        currentSessionStarted: currentSessionStarted
                    };
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
        return authTokens.find({
            authToken: authorization
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