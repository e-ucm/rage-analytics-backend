'use strict';

module.exports = (function() {
    var Collection = require('easy-collections');
    var players = new Collection(require('./db'), 'players');

    players.findByAuthorization = function(authorization) {
        if (authorization && authorization.indexOf('a:') === 0) {
            var anonymousId = authorization.split(':')[1];
            if (anonymousId === '') {
                // Create anonymous id for player
                return players.insert().then(function(player) {
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