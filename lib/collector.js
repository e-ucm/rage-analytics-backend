'use strict';

/**
 *
 * This class exports a function that returns an object with two methods used to
 * start collecting data and to actually track incoming data.
 *
 * This class encapsulates the authorization process and anonymous player creation.
 *
 * The process of sending data is the following:
 *
 *      1 - Invoke 'start' with a valid tracking code. Include <Content-Type, application/json> header if you want to send a body.
 *          1.1 - If you want to be an Anonymous user, just invoke start. Also, if you want to re-use an Anonymous user and create another
 *               session, you can send the body: { "anonymous" : "player_id" }.
 *          1.2 - If you want authorized users, after they login into A2 and obtain the user token, you have to include an authorization
 *                header with the user token that you've. <Authorization, Bearer user_token>.
 *      2 - You receive a response with the authorization token, player id, player name (as animal name), a session counter, the actor that
 *          you have to include in xAPI traces, the objectId that goes after every xAPI object identifier, and the date of the first session
 *          and current session.
 *      3 - Use the authorization token received as a header in the following requests.
 *      4 - The headers format must be <Authorization, auth_token_received>
 *      5 - You can send data to be tracked and consumed by the configured consumers. Currently
 *      there are only two consumers.
 *              5.1 - OpenLRS consumer: sends the received data to an LRS. This means that the received data
 *                                    must be xAPI v 1.0.1 compliant (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md)
 *                                    in order to avoid errors from the LRS.
 *              5.2 - Kafka consumer: all the data is also queued using Kafka to a Storm cluster in order to preform some
 *                                  real time analysis and extract the real time state of the game.
 */

module.exports = (function () {
    var authTokens = require('./auth-tokens');
    var players = require('./players');
    var dataSource = require('./traces');
    var versions = require('./versions');
    var activities = require('./activities');

    var config = require('../config.js');
    /**
     * More info. about the xAPI actor can be found here: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor
     * @param player
     * @returns {
     *              name: <username or anonymous player_name>,
     *              account: {
     *                      homePage: <homepage of the A2 module>,
     *                      name: <username or 'Anonymous'>
     *                }
     *          }
     */
    var getActor = function (player) {

        var actor = {
            account: {
                homePage: config.a2.a2HomePage
            }
        };

        if (player.type === 'identified') {
            actor.name = player.name;
            actor.account.name = player.name;
        } else {
            actor.name = player.animalName;
            actor.account.name = 'Anonymous';
        }

        return actor;
    };

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    /**
     *
     * @param version
     * @returns A string pointing to the link where the given game version is located or, if no link is provided,
     *          returns the route that can be used in a GET request to obtain info about the given game (e.g. the title).
     */
    var getObjectId = function (version) {
        if (version.link) {
            var objectId = version.link;
            if (endsWith(objectId, '/')) {
                return objectId + version._id;
            }

            if (objectId.indexOf('?') === -1) {
                return objectId + '/' + version._id;
            }

            if (endsWith(objectId, '?')) {
                return objectId + 'v=' + version._id;
            }

            return objectId + '&v=' + version._id;
        }

        return config.a2.a2ApiPath + 'proxy/' + config.a2.a2Prefix + '/games/' + version.gameId + '/' + version._id;
    };

    return {
        /**
         *
         * @param body - can either be:
         *                             1) Undefined or empty: for new anonymous user or authorized users
         *                             2) '{anonymous: playerId}': for existing anonymous user (leave authorization Undefined).
         * @param trackingCode - received when creating a new version for a game.
         * @param authorization - Must have the following format:
         *                             1) Undefined or empty: Will create or use an anonymous user depending on body content
         *                             2) 'Bearer JWT': Will use an authorized user.
         * @returns 404 - Meaning the 'trackingCode' is not valid.
         *          401 - The player couldn't be created or couldn't be found.
         *          400 - Meaning that either the bearer is non JWT compilant or the anonymous playerid is not valid or not found.
         *                including a body with a message explaining what happened.
         *          200 and {
         *                    "authToken": <string>,             - Used to track data.
         *                    "actor": <object>,                 - For sending xAPI traces
         *                    "playerAnimalName": <string>,      - Anonymous player name,
         *                    "playerId": <string>,              - Player identifier (useful for anonymous users),
         *                    "objectId": <string>,              - Links to the game url, required by xAPI,
         *                    "session": <int>,                  - Counter of sessions playeds
         *                    "firstSessionStarted": <string>,   - First session date and time formated using ISO 8601
         *                    "currentSessionStarted": <string>  - Current session date and time formated using ISO 8601
         *                  }
         *
         */
        start: function (body, trackingCode, authorization, username) {
            // First we look for the activity
            activities.find({
                trackingCode: trackingCode
            }, true).then(function (activity) {
                // By default we look for a version
                var search = { trackingCode: trackingCode };
                if (activity) {
                    // If we find the activity, we use it to look for the version
                    search = { _id: activity.versionId };
                }
                // And look for the version
                return versions.find(search, true).then(function (version) {
                    if (version) {
                        // If we find a version we're ready find a player
                        return players.findByAuthorization(body, authorization, username)
                            .then(function (player) {
                                if (player) {
                                    // And create an authToken tor it
                                    return authTokens.start(player, version, activity)
                                        .then(function (result) {
                                            if (result) {
                                                var set = { $addToSet: { versions: version._id } };
                                                if (activity) {
                                                    set = { $addToSet: { activities: activity._id } };
                                                }

                                                players.findAndModify(player._id, set);
                                            }

                                            // Track data for user
                                            return {
                                                authToken: result.authToken,
                                                actor: getActor(player),
                                                playerAnimalName: player.animalName,
                                                playerId: player.name,
                                                objectId: getObjectId(version),
                                                session: result.session,
                                                firstSessionStarted: result.firstSessionStarted,
                                                currentSessionStarted: result.currentSessionStarted
                                            };
                                        });
                                }
                                // In case no player is found, we throw unnauthorized
                                throw {
                                    status: 401
                                };
                            });
                    }
                    // In case the version is not found, the tracking code is not valid
                    throw {
                        status: 404,
                        message: 'Tracking code not available!'
                    };
                });
            });
        },

        /**
         * If the 'authToken' is valid, updates the 'lastAccessed' attribute of the given token
         * and passes the data to the configured consumers right after adding the 'gameplayId' to the data
         * as an extension, more info. about this process can be found at 'traces.js'.
         *
         * @param authorization - The token received when successfully invoking 'start'.
         * @param data - The data passed through to the consumers. Must be xAPI v1.0.1 compliant.
         * @returns 200 and true when everything went ok.
         *          An array with errors from the consumers that failed.
         */
        track: function (authorization, data) {
            return authTokens.track(authorization).then(function (authToken) {
                return dataSource.add(authToken, data);
            });
        }
    };
})();