'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var versions = require('./versions');
    var games = new Collection(require('./db'), 'games');
    var utils = require('./utils');

    games.sort = {
        _id: -1
    };

    games.preRemove(function (_id, next) {
        versions.remove({
            gameId: _id
        }).then(function () {
            next();
        }).fail(function () {
            next();
        });
    });

    /**
     * Creates a new class for the given gameId:versionId.
     * @Returns a promise with the class created
     */
    games.createGame = function (username, title, publicGame) {
        return games.insert({
            title: title,
            created: new Date(),
            authors: [username],
            public: publicGame,
            developers: [username]
        });
    };

    games.modifyGame = function (gameId, username, body, add) {
        return games.find(games.toObjectID(gameId), true)
            .then(function (game) {
                if (!game) {
                    throw {
                        message: 'Game does not exist',
                        status: 400
                    };
                }

                if (body.developers) {
                    if (!game.authors || game.authors.indexOf(username) === -1) {
                        throw {
                            message: 'You don\'t have permission to modify this game.',
                            status: 401
                        };
                    }
                }

                if (body._id) {
                    delete body._id;
                }

                var update = {};
                utils.addToArrayHandler(update, body, 'developers', add);

                if (add) {
                    if (body.title && typeof body.title === 'string') {
                        update.$set = {};
                        update.$set.title = body.title;
                    }
                    if (body.link && typeof body.link === 'string') {
                        update.$set = {};
                        update.$set.link = body.link;
                    }
                    if (typeof body.public === 'boolean') {
                        if (!update.$set) {
                            update.$set = {};
                        }
                        update.$set.public = body.public;
                    }
                }

                return games.findAndUpdate(gameId, update);
            });
    };

    games.removeGame = function (username, gameId) {
        return games.findById(gameId)
            .then(function (game) {
                if (!game) {
                    throw {
                        message: 'Game does not exist',
                        status: 400
                    };
                }

                if (!game.authors || game.authors.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to remove this game.',
                        status: 401
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