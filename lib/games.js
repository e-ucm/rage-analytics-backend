'use strict';

module.exports = (function() {
    var Collection = require('easy-collections');
    var versions = require('./versions');
    var games = new Collection(require('./db'), 'games');

    games.sort = {
        _id: -1
    };

    games.preRemove(function(_id, next) {
        versions.remove({
            gameId: _id
        }).then(function() {
            next();
        }).fail(function() {
            next();
        });
    });

    games.removeGame = function (gameId) {
        return games.findById(gameId)
            .then(function (game) {
                if (!game) {
                    throw {
                        message: 'Game does not exist',
                        status: 400
                    };
                }

                return games.removeById(gameId).then(function (result, err) {
                    if (!err) {
                        return {
                            message: 'Success.'
                        };
                    }
                });
            });
    };

    return games;
})();