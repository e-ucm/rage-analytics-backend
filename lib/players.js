'use strict';

var generate = require('adjective-adjective-animal');

/**
 * Manages a collection ('players') with documents for each anonymous player with:
 *
 *      {
 *          name: <String>      - player._id + Math.round(Math.random() * 100000)
 *          type: 'anonymous'
 *      }
 */

module.exports = (function () {
    var Collection = require('easy-collections');
    var players = new Collection(require('./db'), 'players');

    /**
     * Creates or returns a player depending on the value of 'authorization'.
     *
     * This method is invoked when we receive an '/api/collector/start/:trackingCode' request, right after
     * ensuring that the 'trackingCode' is correct. More info. can be found at 'collector.js'@start function.
     *
     * @param authorization - Must have the following format:
     *                             1) 'a:' This will create a new anonymous player.
     *                             2) 'a:<playerName>' This will simply return the anonymous player with that given name.
     * @returns 401 - The 'authorization' format is not valid.
     *          or the found player document.
     */
    players.findByAuthorization = function (authorization, username) {
        if (authorization) {
            var anonymousId = '';
            if (authorization.indexOf('a:') === 0) {
                anonymousId = authorization.split(':')[1];
            }
            // Request of a new anonymous user or the user is already identified if username exists
            if (anonymousId === '') {
                // Create anonymous id for player
                if (username) {
                    var playerData = {
                        name: username,
                        type: 'identified'
                    };
                    return players.find(playerData, true).then(function (player) {
                        if (!player) {
                            return generate().then(function (animalName) {
                                playerData.animalName = animalName;
                                return players.insert(playerData);
                            });
                        }
                        return player;
                    });

                }
                return players.insert().then(function (player) {

                    return generate().then(function (animalName) {
                        var set = {
                            name: player._id + Math.round(Math.random() * 100000),
                            type: 'anonymous',
                            animalName: animalName

                        };
                        return players.findAndModify(player._id, set);
                    });
                });
            }

            return players.find({
                name: anonymousId,
                type: 'anonymous'
            }, true);
        }

        throw {
            status: 401
        };
    };

    return players;
})();