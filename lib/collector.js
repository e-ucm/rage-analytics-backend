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
 *      1 - Invoke 'start' with a valid tracking code and with authorization header <Authorization2, a:>
 *      2 - You receive a response with the authorization token and your player name.
 *      3 - Use the authorization token received as a header in the following requests
 *      4 - The headers format must be <Authorization2, auth_token_received>
 *      5 - You can send data to be tracked and consumed by the configured consumers. Currently
 *      there are only two consumers.
 *              1 - OpenLRS consumer: sends the received data to an LRS. This means that the received data
 *                                    must be xAPI v 1.0.1 compliant (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md)
 *                                    in order to avoid errors from the LRS.
 *              2 - Kafka consumer: all the data is also queued using Kafka to a Storm cluster in order to preform some
 *                                  real time analysis and extract the real time state of the game.
 */

module.exports = (function () {
    var authTokens = require('./auth-tokens');
    var players = require('./players');
    var dataSource = require('./traces');
    var versions = require('./versions');

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
    var getActor = function(player) {

        var actor = {
            name: player.name,
            account: {
                homePage: config.a2.a2HomePage,
                name: player.type === 'identified' ? player.name : 'Anonymous'
            }
        };

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
    var getObjectId = function(version) {
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
         * @param trackingCode - received when creating a new version for a game.
         * @param authorization - Must have the following format:
         *                             1) 'a:' This will create a new anonymous player.
         *                             2) 'a:<playerName>' This will simply return the anonymous player with that given name.
         * @returns 404 - Meaning the 'trackingCode' is not valid.
         *          401 - The player couldn't be created or couldn't be found.
         *          200 and {
         *                       authToken: <String>,    - Used to track data.
         *                       playerName: <String>    - In case you want to start collecting with 'authorization' as
          *                                                 'a:<playerName>'.
         *                  }
         */
        start: function (trackingCode, authorization, username) {
            return versions.find({
                trackingCode: trackingCode
            }, true).then(function (version) {
                if (version) {
                    return players.findByAuthorization(authorization, username)
                        .then(function (player) {
                            if (player) {
                                return authTokens.start(player._id, version, player.type === 'identified' ? authorization : null)
                                    .then(function (authToken) {
                                        // Track data for user
                                        return {
                                            authToken: authToken,
                                            actor: getActor(player),
                                            playerName: player.name,
                                            objectId: getObjectId(version)
                                        };
                                    });
                            }

                            throw {
                                status: 401
                            };
                        });
                }

                throw {
                    status: 404
                };
            });
        },

        /**
         * If the 'authToken' is valid, updates the 'lastAccessed' attribute of the given token
         * and passes the data to the configured consumers right after adding the 'gameplayId' to the data
         * as an extension, more info. about this process can be found at 'traces.js'.
         *
         * @param authToken - The token received when successfully invoking 'start'.
         * @param data - The data passed through to the consumers. Must be xAPI v1.0.1 compliant.
         * @returns 200 and true when everything went ok.
         *          An array with errors from the consumers that failed.
         */
        track: function (authToken, data) {
            return authTokens.track(authToken).then(function (authToken) {
                return dataSource.add(authToken.playerId, authToken.versionId, authToken.gameplayId, data);
            });
        }
    };
})();