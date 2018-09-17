'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var db = require('./db');
    var games = new Collection(db, 'games');
    var utils = require('./utils');


    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var gameSchema = {
        id: '/GameSchema',
        type: 'object',
        properties: {
            title: { type: 'string'},
            created: { type: 'date'},
            authors: {
                type: 'array',
                items: {type: 'string'}
            },
            public: { type: 'boolean'},
            developers: {
                type: 'array',
                items: {type: 'string'}
            },
            deleted: { type: 'boolean'},
            link: { type: 'string'}
        },
        required: ['title', 'created', 'authors', 'public'],
        additionalProperties: false
    };

    var gameUpdatedSchema = {
        id: '/GameUpdatedSchema',
        type: 'object',
        properties: {
            title: { type: 'string'},
            authors: {
                type: 'array',
                items: {type: 'string'}
            },
            public: { type: 'boolean'},
            developers: { anyOf: [
                {
                    type: 'array',
                    items: {type: 'string'}
                },
                {
                    type: 'string'
                }
            ]},
            link: { type: 'string'}
        },
        minProperties: 1,
        additionalProperties: false
    };

    v.addSchema(gameSchema, '/GameSchema');
    v.addSchema(gameUpdatedSchema, '/GameUpdatedSchema');

    games.sort = {
        _id: -1
    };

    games.preRemove(function (_id, next) {
        require('./versions').remove({ // This propagates to activities
            gameId: _id
        }).then(function () {
            next();
        }).fail(function () {
            next();
        });
    });

    /**
     * Finds a game by Id. The game can only be accessed if is public or the username is a developer.
     * @param _id
     * @param username
     * @returns {Promise|*}
     */
    games.getGame = function(_id, username) {
        return games.findById(_id).then(function(game) {
            if (!game) {
                throw {
                    message: 'Game not found',
                    status: 404
                };
            }
            if (!game.public && game.developers.indexOf(username) === -1) {
                throw {
                    message: 'Game is not public',
                    status: 401
                };
            }

            return game;
        });
    };

    /**
     * Creates a new class for the given gameId:versionId.
     * @Returns a promise with the class created
     */
    games.createGame = function (username, title, publicGame) {
        var gameObj = {
            title: title,
            created: new Date(),
            authors: [username],
            public: publicGame,
            developers: [username],
            deleted: false
        };
        var validationObj = v.validate(gameObj, gameSchema);
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'Game bad format: ' + validationObj.errors[0],
                status: 400
            };
        }
        return games.insert(gameObj);
    };

    games.modifyGame = function (gameId, username, body, add) {
        var validationObj = v.validate(body, gameUpdatedSchema);
        if (validationObj.errors && validationObj.errors.length > 0) {
            throw {
                message: 'Game bad format: ' + validationObj.errors[0],
                status: 400
            };
        }
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

                var update = {};
                utils.addToArrayHandler(update, body, 'developers', add);

                if (add) {
                    if (body.title) {
                        if (!update.$set) {
                            update.$set = {};
                        }
                        update.$set.title = body.title;
                    }
                    if (body.link) {
                        if (!update.$set) {
                            update.$set = {};
                        }
                        update.$set.link = body.link;
                    }
                    if (body.public !== undefined) {
                        if (!update.$set) {
                            update.$set = {};
                        }
                        update.$set.public = body.public;
                    }
                }
                return games.findAndUpdate(gameId, update);
            });
    };

    /**
     * Removes a game removing nested versions and activities.
     * @param username
     * @param gameId
     * @returns {Promise|*}
     */
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

                return require('./activities').find({gameId: games.toObjectID(gameId)})
                    .then(function (activitiesRes) {
                        if (activitiesRes.length > 0) {
                            return games.findAndUpdate(games.toObjectID(gameId), {
                                $set: {
                                    deleted: true
                                }
                            });
                        }

                        return games.removeById(gameId).then(function (result, err) {
                            if (!err) {
                                return {
                                    message: 'Success.'
                                };
                            }
                        });

                    });
            });
    };

    return games;
})();