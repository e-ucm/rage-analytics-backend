'use strict';

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
        if (authorization && authorization.indexOf('a:') === 0) {
            var anonymousId = authorization.split(':')[1];
            if (anonymousId === '') {
                // Create anonymous id for player
                if(username) {
                    return players.insert({
                        name: username,
                        type: 'identified'
                    });
                }
                return players.insert().then(function (player) {
                    var set = {
                        name: player._id + Math.round(Math.random() * 100000),
                        type: 'anonymous'
                    };
                    return players.findAndModify(player._id, set);
                });
            } else {
                return players.find({
                    name: anonymousId,
                    type: 'anonymous'
                }, true);
            }
        } else {
            throw {
                status: 401
            };
        }
    };

    return players;
})();